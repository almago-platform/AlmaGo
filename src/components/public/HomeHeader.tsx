"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeHeader({ phase2Enabled = false }: { phase2Enabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const { copy } = useLocale();
  const nav = copy.home.nav;
  const primaryHref = phase2Enabled ? "/orientation" : "/signup";
  const primaryLabel = phase2Enabled ? nav.orientation : nav.signup;
  const navigation: Array<readonly [string, string]> = [
    ...(phase2Enabled ? [[nav.orientation, "/orientation"] as const] : []),
    [nav.journey, "#parcours"],
    [nav.space, "/login"],
    [nav.why, "#outils"],
    [nav.questions, "#faq"],
    [nav.contact, "/contact"],
  ];

  return (
    <header
      className={s.header}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className={`${s.container} ${s.headerInner}`}>
        <Link href="/" className={s.logo} aria-label={copy.common.homeAria}>
          <BrandLogo className={s.logoImage} priority />
        </Link>
        <nav className={s.desktopNav} aria-label={nav.mainNavigation}>
          {navigation.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className={s.headerActions}>
          <LanguageSwitcher compact className="hidden xl:inline-flex" />
          <Link className={s.login} href="/login">
            {nav.login}
          </Link>
          <Link className={`${s.button} ${s.headerCta}`} href={primaryHref}>
            {primaryLabel}
            <HomeIcon name="arrow" />
          </Link>
          <button
            ref={toggle}
            className={s.menuToggle}
            aria-expanded={open}
            aria-controls="home-mobile-menu"
            aria-label={open ? nav.closeMenu : nav.openMenu}
            onClick={() => setOpen(!open)}
          >
            <HomeIcon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      <nav
        id="home-mobile-menu"
        className={s.mobileNav}
        aria-label={nav.mobileNavigation}
        hidden={!open}
      >
        <div className="mb-2 px-1">
          <LanguageSwitcher />
        </div>
        {navigation.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
            <HomeIcon name="arrow" />
          </a>
        ))}
        <Link href="/login" onClick={() => setOpen(false)}>
          {nav.login}
          <HomeIcon name="arrow" />
        </Link>
        <Link className={s.mobileSignup} href={primaryHref} onClick={() => setOpen(false)}>
          {primaryLabel}
          <HomeIcon name="arrow" />
        </Link>
      </nav>
    </header>
  );
}
