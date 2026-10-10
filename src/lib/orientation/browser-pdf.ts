import "server-only";

import { spawn, type ChildProcess } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PdfAttachment } from "@/lib/orientation/pdf-attachments";

/**
 * Print the EXACT saved web report, rather than maintaining a second, visually
 * different server PDF renderer. The only input is an already-saved opaque token.
 * Never include that token in subprocess arguments, paths or application logs.
 */
const PDF_TIMEOUT_MS = 47000;
const MAX_PDF_BYTES = 6_000_000;
let activePdfBrowsers = 0;
const MAX_ACTIVE_PDF_BROWSERS = 2;
const PRINT_ORIGIN = "http://127.0.0.1:3000";

type CdpResponse = { id?: number; result?: Record<string, unknown>; error?: { message?: string } };

async function executablePath(): Promise<string> {
  const candidates = [process.env.ALMAGO_PDF_CHROMIUM_PATH, "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"].filter((v): v is string => Boolean(v));
  for (const candidate of candidates) {
    if (!candidate.startsWith("/")) continue;
    try { await access(candidate, constants.X_OK); return candidate; } catch { /* try next */ }
  }
  throw new Error("Orientation PDF browser is not installed");
}

function localOrigin(): string {
  const url = new URL(process.env.ALMAGO_PDF_ORIGIN || PRINT_ORIGIN);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
    throw new Error("PDF origin must be local loopback");
  }
  return url.origin;
}

async function waitForDebuggingPort(dir: string, child: ChildProcess): Promise<number> {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null || child.signalCode !== null) break;
    try {
      const port = Number((await readFile(join(dir, "DevToolsActivePort"), "utf8")).split("\n")[0]);
      if (Number.isInteger(port) && port > 0 && port < 65536) return port;
    } catch { /* Chromium is starting */ }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error("Chromium remote debugger did not start");
}

async function debugPage(port: number): Promise<string> {
  const response = await fetch(`http://127.0.0.1:${port}/json/list`, { cache: "no-store" });
  if (!response.ok) throw new Error("Chromium debugging target unavailable");
  const entries = await response.json() as Array<{ type: string; webSocketDebuggerUrl?: string }>;
  const target = entries.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
  if (!target?.webSocketDebuggerUrl) throw new Error("No Chromium page target");
  return target.webSocketDebuggerUrl;
}

class CdpPage {
  private id = 0;
  private readonly pending = new Map<number, { resolve: (value: Record<string, unknown>) => void; reject: (error: Error) => void }>();
  constructor(readonly socket: WebSocket) {
    socket.addEventListener("message", (event: MessageEvent) => {
      let message: CdpResponse;
      try { message = JSON.parse(String(event.data)) as CdpResponse; } catch { return; }
      if (typeof message.id !== "number") return;
      const task = this.pending.get(message.id);
      if (!task) return;
      this.pending.delete(message.id);
      if (message.error) task.reject(new Error("Chromium protocol error"));
      else task.resolve(message.result || {});
    });
    socket.addEventListener("close", () => {
      for (const task of this.pending.values()) task.reject(new Error("Chromium exited"));
      this.pending.clear();
    });
  }
  static async connect(url: string): Promise<CdpPage> {
    const socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Chromium connection timeout")), 4000);
      socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
      socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("Chromium connection failed")); }, { once: true });
    });
    return new CdpPage(socket);
  }
  command(method: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    if (this.socket.readyState !== WebSocket.OPEN) throw new Error("Chromium disconnected");
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluateBoolean(expression: string): Promise<boolean> {
    const result = await this.command("Runtime.evaluate", { expression, returnByValue: true });
    const remote = result.result as { value?: unknown } | undefined;
    return remote?.value === true;
  }
  close(): void { this.socket.close(); }
}

async function renderPage(
  page: CdpPage,
  token: string,
  kind: "orientation" | "candidate" | "detailed",
): Promise<PdfAttachment> {
  const path = `/orientation/report/${encodeURIComponent(token)}`;
  const suffix = kind === "orientation" ? "" : `?document=${kind}`;
  const url = `${localOrigin()}${path}${suffix}`;
  await page.command("Page.navigate", { url });
  const startedAt = Date.now();
  const selector = kind === "orientation" ? ".orientation-one-page-print" : kind === "candidate" ? ".orientation-candidate-pdf" : ".orientation-detailed-print-report";
  while (Date.now() - startedAt < 18000) {
    const ready = await page.evaluateBoolean(`(() => {
      const report = document.querySelector(${JSON.stringify(selector)});
      const detailed = ${kind === "detailed"};
      return document.readyState === "complete" && !!report
        && (!detailed || document.documentElement.getAttribute("data-orientation-report-ready") === "true")
        && Array.from(report.querySelectorAll("img")).every(img => img.complete)
        && (!detailed || Array.from(report.querySelectorAll(".orientation-detail-photo img, .orientation-detail-research-photo img")).every(img => img.naturalWidth > 0))
        && document.fonts.status === "loaded";
    })()`);
    if (ready) {
      const result = await page.command("Page.printToPDF", {
        printBackground: true, preferCSSPageSize: true,
        displayHeaderFooter: false, paperWidth: 8.27, paperHeight: 11.69,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
      });
      const raw = result.data;
      if (typeof raw !== "string") throw new Error("PDF output missing");
      const size = Buffer.byteLength(raw, "base64");
      if (size < 1000 || size > MAX_PDF_BYTES) throw new Error("PDF size outside allowed range");
      const signature = Buffer.from(raw, "base64").subarray(0, 5).toString("ascii");
      if (signature !== "%PDF-") throw new Error("Invalid browser PDF response");
      return {
        filename: kind === "orientation" ? "resume-orientation-campus-allemagne.pdf"
          : kind === "detailed" ? "dossier-detaille-campus-allemagne.pdf" : "rapport-candidat-campus-allemagne.pdf",
        contentBase64: raw, contentType: "application/pdf",
      };
    }
    await new Promise((resolve) => setTimeout(resolve, 160));
  }
  throw new Error("Orientation printable document was not ready");
}

export async function buildWebsiteOrientationPdfAttachments(
  token: string, hasPersonalizedShortlist: boolean,
): Promise<[PdfAttachment, PdfAttachment]> {
  if (!/^[A-Za-z0-9_-]{20,250}$/.test(token)) throw new Error("Invalid orientation token");
  if (activePdfBrowsers >= MAX_ACTIVE_PDF_BROWSERS) throw new Error("PDF export capacity reached");
  activePdfBrowsers++;
  let profile: string | null = null;
  try {
    profile = await mkdtemp(join(tmpdir(), "almago-orientation-print-"));
  } catch (error) {
    activePdfBrowsers--;
    throw error;
  }
  const browser = await executablePath().catch((error: unknown) => {
    activePdfBrowsers--;
    throw error;
  });
  let child: ChildProcess | null = null;
  let page: CdpPage | null = null;
  const timeout = setTimeout(() => { child?.kill("SIGKILL"); }, PDF_TIMEOUT_MS);
  try {
    child = spawn(browser, [
      "--headless=new", "--disable-gpu", "--disable-dev-shm-usage",
      "--no-first-run", "--no-default-browser-check", "--disable-extensions",
      "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
    ], { stdio: "ignore", env: { ...process.env, HOME: process.env.HOME || "/tmp" } });
    const port = await waitForDebuggingPort(profile, child);
    page = await CdpPage.connect(await debugPage(port));
    await page.command("Page.enable");
    await page.command("Runtime.enable");
    await page.command("Emulation.setEmulatedMedia", { media: "print" });
    const summary = await renderPage(page, token, "orientation");
    const second = await renderPage(page, token, hasPersonalizedShortlist ? "detailed" : "candidate");
    return [summary, second];
  } finally {
    clearTimeout(timeout);
    try { page?.close(); } catch { /* already closed */ }
    child?.kill("SIGKILL");
    await rm(profile, { recursive: true, force: true }).catch(() => undefined);
    activePdfBrowsers--;
  }
}
