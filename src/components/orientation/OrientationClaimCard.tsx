"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { orientationActivationCopy } from "@/content/orientation-activation-copy";

export function OrientationClaimCard({ token }: { token: string }) {
  const { locale } = useLocale();
  const copy = orientationActivationCopy[locale];
  const started = useRef(false);
  const [status, setStatus] = useState<"working" | "success" | "error">("working");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        const response = await fetch("/api/orientation/claim", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const payload = await response.json().catch(() => null) as { linked?: boolean } | null;
        setStatus(response.ok && payload?.linked ? "success" : "error");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  return (
    <section className="professional-panel mx-auto max-w-2xl rounded-[var(--radius-panel)] p-6 sm:p-8">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 className="page-title mt-2 text-3xl">{copy.title}</h1>

      {status === "working" ? (
        <p role="status" className="mt-4 text-sm leading-6 text-[var(--muted)]">{copy.working}</p>
      ) : null}

      {status === "success" ? (
        <div className="mt-5">
          <p role="status" className="rounded-[var(--radius-control)] border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {copy.success}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy.freeAccountNote}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/prospect"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
            >
              {copy.openSpace}
            </Link>
            <Link
              href={`/orientation/report/${encodeURIComponent(token)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-bold text-[var(--foreground)]"
            >
              {copy.viewOrientation}
            </Link>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <p role="alert" className="mt-5 rounded-[var(--radius-control)] border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          {copy.failure}
        </p>
      ) : null}
    </section>
  );
}
