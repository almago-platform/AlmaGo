"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function AuthMobileHeader({ mode }: { mode: "login" | "signup" }) {
  const { copy } = useLocale();

  return (
    <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
      <Link href="/" className="inline-flex min-h-11 items-center" aria-label={copy.common.homeAria}>
        <BrandLogo className="h-auto w-32 sm:w-44" />
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitcher compact />
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
        >
          {mode === "login" ? copy.auth.mobile.signupLink : copy.auth.mobile.loginLink}
        </Link>
      </div>
    </div>
  );
}
