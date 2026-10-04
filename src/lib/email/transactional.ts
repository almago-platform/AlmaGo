import "server-only";

import { createHash } from "node:crypto";
import { connect as connectNet, type Socket } from "node:net";
import { connect as connectTls, type TLSSocket } from "node:tls";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SMTP_TIMEOUT_MS = 12_000;

export type TransactionalEmailAttachment = {
  filename: string;
  contentBase64: string;
  contentType: string;
};

type TransactionalEmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  attachments?: readonly TransactionalEmailAttachment[];
};

type ResendConfiguration = {
  provider: "resend";
  apiKey: string;
  from: string;
};

type SmtpConfiguration = {
  provider: "smtp";
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
};

type TransactionalEmailConfiguration = ResendConfiguration | SmtpConfiguration;
type SmtpSocket = Socket | TLSSocket;

export type TransactionalEmailResult =
  | { status: "sent"; provider: "resend" | "smtp"; messageId: string }
  | { status: "unavailable" }
  | { status: "failed" };

function enabled(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() || "");
}

function parseSmtpPort(value: string | undefined) {
  if (!value?.trim()) return 587;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) return null;
  return parsed;
}

export function getTransactionalEmailConfiguration(
  env: Record<string, string | undefined> = process.env,
): TransactionalEmailConfiguration | null {
  const provider = env.ALMAGO_TRANSACTIONAL_EMAIL_PROVIDER?.trim().toLowerCase();
  const from = env.ALMAGO_TRANSACTIONAL_EMAIL_FROM?.trim();
  if (!from) return null;

  if (provider === "resend") {
    const apiKey = env.RESEND_API_KEY?.trim();
    if (!apiKey) return null;
    return { provider: "resend", apiKey, from };
  }

  if (provider === "smtp") {
    const host = env.ALMAGO_SMTP_HOST?.trim();
    const port = parseSmtpPort(env.ALMAGO_SMTP_PORT);
    const username = env.ALMAGO_SMTP_USERNAME?.trim();
    const password = env.ALMAGO_SMTP_PASSWORD;
    if (!host || !port || !username || !password) return null;

    const secure = env.ALMAGO_SMTP_SECURE?.trim()
      ? enabled(env.ALMAGO_SMTP_SECURE)
      : port === 465;

    return {
      provider: "smtp",
      host,
      port,
      secure,
      username,
      password,
      from,
    };
  }

  return null;
}

function sanitizeHeader(value: string) {
  if (/[\r\n]/.test(value)) throw new Error("Invalid email header.");
  return value.trim();
}

function mailboxFromHeader(value: string) {
  const safe = sanitizeHeader(value);
  const bracketed = /<([^<>]+)>/.exec(safe)?.[1]?.trim();
  const mailbox = bracketed || safe;
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(mailbox)) {
    throw new Error("Invalid sender mailbox.");
  }
  return mailbox;
}

function encodeSubject(value: string) {
  return `=?UTF-8?B?${Buffer.from(sanitizeHeader(value), "utf8").toString("base64")}?=`;
}

function wrapBase64(value: string) {
  const encoded = Buffer.from(value, "utf8").toString("base64");
  return encoded.match(/.{1,76}/g)?.join("\r\n") || "";
}

function wrapBase64Content(value: string) {
  const encoded = value.replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    throw new Error("Invalid base64 attachment.");
  }
  return encoded.match(/.{1,76}/g)?.join("\r\n") || "";
}

function safeAttachmentFilename(value: string) {
  const sanitized = value.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 120);
  return sanitized || "attachment.bin";
}

function smtpMessageId(message: TransactionalEmailMessage, sender: string) {
  const digest = createHash("sha256")
    .update(message.idempotencyKey)
    .digest("hex");
  const domain = sender.split("@")[1] || "almago.invalid";
  return `<${digest.slice(0, 32)}@${domain}>`;
}

function buildSmtpMimeMessage(
  config: SmtpConfiguration,
  message: TransactionalEmailMessage,
) {
  const from = sanitizeHeader(config.from);
  const to = sanitizeHeader(message.to);
  const sender = mailboxFromHeader(from);
  const digest = createHash("sha256")
    .update(message.idempotencyKey)
    .digest("hex");
  const alternativeBoundary = `almago-alt-${digest.slice(0, 20)}`;
  const mixedBoundary = `almago-mixed-${digest.slice(0, 20)}`;
  const messageId = smtpMessageId(message, sender);
  const attachments = message.attachments || [];

  const alternativeParts = [
    `--${alternativeBoundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(message.text),
    `--${alternativeBoundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(message.html),
    `--${alternativeBoundary}--`,
  ];

  const headers = [
    `Date: ${new Date().toUTCString()}`,
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(message.subject)}`,
    `Message-ID: ${messageId}`,
    `X-AlmaGo-Idempotency-Key: ${sanitizeHeader(message.idempotencyKey)}`,
    "MIME-Version: 1.0",
  ];

  const body = attachments.length
    ? [
        `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
        "",
        `--${mixedBoundary}`,
        `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
        "",
        ...alternativeParts,
        ...attachments.flatMap((attachment) => {
          const filename = safeAttachmentFilename(attachment.filename);
          const contentType = sanitizeHeader(attachment.contentType || "application/octet-stream");
          return [
            `--${mixedBoundary}`,
            `Content-Type: ${contentType}; name="${filename}"`,
            `Content-Disposition: attachment; filename="${filename}"`,
            "Content-Transfer-Encoding: base64",
            "",
            wrapBase64Content(attachment.contentBase64),
          ];
        }),
        `--${mixedBoundary}--`,
        "",
      ]
    : [
        `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
        "",
        ...alternativeParts,
        "",
      ];

  const raw = [...headers, ...body].join("\r\n");

  return {
    sender,
    messageId,
    raw: raw
      .split("\r\n")
      .map((line) => line.startsWith(".") ? `.${line}` : line)
      .join("\r\n"),
  };
}

function waitForSocket(
  socket: SmtpSocket,
  event: "connect" | "secureConnect",
) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      socket.off(event, onReady);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onTimeout = () => {
      cleanup();
      reject(new Error("SMTP connection timed out."));
    };

    socket.once(event, onReady);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}

function readSmtpResponse(socket: SmtpSocket) {
  return new Promise<{ code: number; lines: string[] }>((resolve, reject) => {
    let buffer = "";
    const lines: string[] = [];

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
      socket.off("close", onClose);
    };

    const finish = (code: number) => {
      cleanup();
      resolve({ code, lines });
    };

    const onData = (chunk: Buffer | string) => {
      buffer += chunk.toString();
      let end = buffer.indexOf("\r\n");

      while (end >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (line) {
          lines.push(line);
          const match = /^(\d{3})([ -])/.exec(line);
          if (match?.[2] === " ") {
            finish(Number(match[1]));
            return;
          }
        }
        end = buffer.indexOf("\r\n");
      }
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onTimeout = () => {
      cleanup();
      reject(new Error("SMTP response timed out."));
    };
    const onClose = () => {
      cleanup();
      reject(new Error("SMTP connection closed."));
    };

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
    socket.once("close", onClose);
  });
}

async function expectSmtp(
  socket: SmtpSocket,
  expected: number | number[],
) {
  const response = await readSmtpResponse(socket);
  const accepted = Array.isArray(expected) ? expected : [expected];
  if (!accepted.includes(response.code)) {
    throw new Error(`Unexpected SMTP response: ${response.code}`);
  }
  return response;
}

async function smtpCommand(
  socket: SmtpSocket,
  command: string,
  expected: number | number[],
) {
  socket.write(`${command}\r\n`);
  return expectSmtp(socket, expected);
}

async function openSmtpSocket(config: SmtpConfiguration) {
  if (config.secure) {
    const socket = connectTls({
      host: config.host,
      port: config.port,
      servername: config.host,
      rejectUnauthorized: true,
    });
    socket.setTimeout(SMTP_TIMEOUT_MS);
    await waitForSocket(socket, "secureConnect");
    return socket as SmtpSocket;
  }

  const socket = connectNet({
    host: config.host,
    port: config.port,
  });
  socket.setTimeout(SMTP_TIMEOUT_MS);
  await waitForSocket(socket, "connect");
  return socket as SmtpSocket;
}

async function authenticateSmtp(
  socket: SmtpSocket,
  capabilities: string,
  config: SmtpConfiguration,
) {
  const auth = capabilities.toUpperCase();

  if (auth.includes("AUTH PLAIN")) {
    const credentials = Buffer
      .from(`\0${config.username}\0${config.password}`, "utf8")
      .toString("base64");
    await smtpCommand(socket, `AUTH PLAIN ${credentials}`, 235);
    return;
  }

  await smtpCommand(socket, "AUTH LOGIN", 334);
  await smtpCommand(
    socket,
    Buffer.from(config.username, "utf8").toString("base64"),
    334,
  );
  await smtpCommand(
    socket,
    Buffer.from(config.password, "utf8").toString("base64"),
    235,
  );
}

async function sendWithSmtp(
  config: SmtpConfiguration,
  message: TransactionalEmailMessage,
): Promise<TransactionalEmailResult> {
  let socket: SmtpSocket | null = null;

  try {
    socket = await openSmtpSocket(config);
    await expectSmtp(socket, 220);

    let ehlo = await smtpCommand(socket, "EHLO almago.local", 250);
    let capabilities = ehlo.lines.join("\n");

    if (!config.secure) {
      if (!capabilities.toUpperCase().includes("STARTTLS")) {
        throw new Error("SMTP server does not offer STARTTLS.");
      }

      await smtpCommand(socket, "STARTTLS", 220);
      const tlsSocket = connectTls({
        socket: socket as Socket,
        servername: config.host,
        rejectUnauthorized: true,
      });
      tlsSocket.setTimeout(SMTP_TIMEOUT_MS);
      await waitForSocket(tlsSocket, "secureConnect");
      socket = tlsSocket;

      ehlo = await smtpCommand(socket, "EHLO almago.local", 250);
      capabilities = ehlo.lines.join("\n");
    }

    await authenticateSmtp(socket, capabilities, config);

    const mime = buildSmtpMimeMessage(config, message);
    await smtpCommand(socket, `MAIL FROM:<${mime.sender}>`, 250);
    await smtpCommand(socket, `RCPT TO:<${sanitizeHeader(message.to)}>`, [250, 251]);
    await smtpCommand(socket, "DATA", 354);
    socket.write(`${mime.raw}\r\n.\r\n`);
    await expectSmtp(socket, 250);

    try {
      await smtpCommand(socket, "QUIT", 221);
    } catch {
      // Delivery was already accepted after DATA. A QUIT failure does not undo it.
    }

    return {
      status: "sent",
      provider: "smtp",
      messageId: mime.messageId,
    };
  } catch {
    return { status: "failed" };
  } finally {
    socket?.end();
    socket?.destroy();
  }
}

async function sendWithResend(
  config: ResendConfiguration,
  message: TransactionalEmailMessage,
): Promise<TransactionalEmailResult> {
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.attachments?.length
          ? {
              attachments: message.attachments.map((attachment) => ({
                filename: safeAttachmentFilename(attachment.filename),
                content: attachment.contentBase64,
                content_type: attachment.contentType,
              })),
            }
          : {}),
      }),
    });

    if (!response.ok) return { status: "failed" };

    const payload = await response.json().catch(() => null) as { id?: unknown } | null;
    if (!payload || typeof payload.id !== "string" || !payload.id) {
      return { status: "failed" };
    }

    return {
      status: "sent",
      provider: "resend",
      messageId: payload.id,
    };
  } catch {
    return { status: "failed" };
  }
}

export async function sendTransactionalEmail(
  message: TransactionalEmailMessage,
  env: Record<string, string | undefined> = process.env,
): Promise<TransactionalEmailResult> {
  const config = getTransactionalEmailConfiguration(env);
  if (!config) return { status: "unavailable" };

  if (config.provider === "smtp") {
    return sendWithSmtp(config, message);
  }

  return sendWithResend(config, message);
}
