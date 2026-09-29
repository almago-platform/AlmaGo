"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeFinalCta() {
  const { copy } = useLocale();
  const closing = copy.home.closing;

  return (
    <section className={s.finalCta} aria-labelledby="final-title">
      <div className={`${s.container} ${s.finalInner}`}>
        <div className={s.finalCopy}>
          <p className={s.eyebrow}>{closing.eyebrow}</p>
          <h2 id="final-title">
            {closing.title1}
            <br />
            <em>{closing.title2}</em>
          </h2>
          <p>{closing.text}</p>
          <div className={s.finalProof} aria-label={closing.proofAria}>
            {closing.proof.map((item) => (
              <span key={item}>
                <HomeIcon name="check" /> {item}
              </span>
            ))}
          </div>
        </div>

        <div className={s.finalActions}>
          <Link className={s.button} href="/signup">
            {closing.cta}
            <HomeIcon name="arrow" />
          </Link>
          <p><Link href="/login">{closing.login}</Link></p>
        </div>
      </div>
    </section>
  );
}

export function HomeFooter() {
  const { copy } = useLocale();
  const footer = copy.home.footer;

  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footerGrid}>
          <div className={s.footerBrand}>
            <Link href="/" className={`${s.logo} ${s.footerLogoLink}`} aria-label={copy.common.homeAria}>
              <BrandLogo className={s.footerLogoImage} />
            </Link>
            <p>{footer.tagline}</p>
            <span className={s.footerIndependence}>{footer.independent}</span>
          </div>

          {footer.columns.map(([title, links]) => (
            <FooterColumn key={title} title={title} links={links} />
          ))}
        </div>

        <div className={s.footerBottom}>
          <p>
            © Campus Allemagne ·{" "}
            <a href="mailto:contact@campus-allemagne.info">contact@campus-allemagne.info</a>
          </p>
          <p>{footer.disclaimer}</p>
        </div>

        <p className={s.photoCredit}>
          {footer.photoCredit1}{" "}
          <a href="https://www.pexels.com/license/">Pexels</a>. {footer.photoCredit2}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <nav aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
