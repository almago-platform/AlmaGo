"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const navigation = [
  ["Le parcours", "#parcours"],
  ["L’espace étudiant", "/login"],
  ["Nos repères", "#outils"],
  ["FAQ", "#faq"],
] as const;

export function HomeHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <>
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
          <Link href="/" className={s.logo} aria-label="AlmaGo accueil">
            <BrandLogo className={s.logoImage} priority />
          </Link>
          <nav className={s.desktopNav} aria-label="Navigation principale">
            {navigation.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className={s.headerActions}>
            <Link className={s.login} href="/login">
              Connexion
            </Link>
            <Link className={`${s.button} ${s.headerCta}`} href="/signup">
              Créer mon dossier
              <HomeIcon name="arrow" />
            </Link>
            <button
              ref={toggle}
              className={s.menuToggle}
              aria-expanded={open}
              aria-controls="home-mobile-menu"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen(!open)}
            >
              <HomeIcon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
        <nav
          id="home-mobile-menu"
          className={s.mobileNav}
          aria-label="Navigation mobile"
          hidden={!open}
        >
          {navigation.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <HomeIcon name="arrow" />
            </a>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}>
            Se connecter
            <HomeIcon name="arrow" />
          </Link>
          <Link className={s.mobileSignup} href="/signup" onClick={() => setOpen(false)}>
            Créer mon dossier
            <HomeIcon name="arrow" />
          </Link>
        </nav>
      </header>
    </>
  );
}
