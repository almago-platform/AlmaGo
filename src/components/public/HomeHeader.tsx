"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { HomeSymbol } from "./HomeSymbol";
import s from "./CodexHome.module.css";
const links = [
  ["L’espace étudiant", "#espace"],
  ["Le parcours", "#parcours"],
  ["Nos engagements", "#confiance"],
  ["FAQ", "#faq"],
] as const;
export function HomeHeader() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <header
      className={s.header}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <div className={[s.container, s.headerInner].join(" ")}>
        <Link href="/" className={s.logo} aria-label="AlmaGo, accueil">
          <span className={s.logoMark}>A</span>
          <span>
            AlmaGo<span className={s.logoSub}>Études en Allemagne</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className={s.desktopNav}>
          {links.map(([name, href]) => (
            <a key={href} href={href}>
              {name}
            </a>
          ))}
        </nav>
        <div className={s.headerActions}>
          <Link href="/login" className={s.login}>
            Connexion
          </Link>
          <Link href="/signup" className={[s.button, s.headerCta].join(" ")}>
            Créer mon dossier
            <HomeSymbol name="arrow" />
          </Link>
          <button
            ref={button}
            type="button"
            className={s.menuButton}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="codex-mobile-nav"
            onClick={() => setOpen(!open)}
          >
            <HomeSymbol name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      <nav
        id="codex-mobile-nav"
        className={s.mobileNav}
        aria-label="Navigation mobile"
        hidden={!open}
      >
        {links.map(([name, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {name}
            <HomeSymbol name="arrow" />
          </a>
        ))}
        <Link href="/signup" className={s.mobileCreate}>
          Créer mon dossier
          <HomeSymbol name="arrow" />
        </Link>
      </nav>
    </header>
  );
}
