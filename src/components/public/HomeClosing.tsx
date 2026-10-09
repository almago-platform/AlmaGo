import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import type { getNativeCopy } from "@/content/native-copy";
import type { HomepageV42Copy } from "@/content/homepage-v42-copy";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

type NativeCopy = ReturnType<typeof getNativeCopy>;
type ClosingCopy = NativeCopy["home"]["closing"];
type FooterCopy = NativeCopy["home"]["footer"];

export function HomeFinalCta({
  closing,
  primaryHref = "/signup",
  primaryLabel,
}: {
  closing: ClosingCopy;
  primaryHref?: string;
  primaryLabel?: string;
}) {
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
          <Link className={s.button} href={primaryHref}>
            {primaryLabel || closing.cta}
            <HomeIcon name="arrow" />
          </Link>
          <p><Link href="/login">{closing.login}</Link></p>
        </div>
      </div>
    </section>
  );
}

export function HomeFooter({
  footer,
  brandFooter,
  homeAria,
  phase2Enabled = false,
  orientationLabel,
  hashLinksToHome = false,
}: {
  footer: FooterCopy;
  brandFooter?: HomepageV42Copy["footer"];
  homeAria: string;
  phase2Enabled?: boolean;
  orientationLabel?: string;
  hashLinksToHome?: boolean;
}) {
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footerGrid}>
          <div className={s.footerBrand}>
            <Link href="/" className={`${s.logo} ${s.footerLogoLink}`} aria-label={homeAria}>
              <BrandLogo className={s.footerLogoImage} />
            </Link>
            <p>{brandFooter?.tagline ?? footer.tagline}</p>
            <span className={s.footerIndependence}>{footer.independent}</span>
          </div>

          {footer.columns.map(([title, links], index) => (
            <FooterColumn
              key={title}
              title={title}
              links={links}
              extraLinks={index === 0 && brandFooter ? [[brandFooter.about, "#apropos"], [brandFooter.services, "#services"]] : []}
              phase2Enabled={phase2Enabled}
              orientationLabel={orientationLabel}
              hashLinksToHome={hashLinksToHome}
            />
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
  extraLinks = [],
  phase2Enabled,
  orientationLabel,
  hashLinksToHome,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
  extraLinks?: readonly (readonly [string, string])[];
  phase2Enabled: boolean;
  orientationLabel?: string;
  hashLinksToHome: boolean;
}) {
  return (
    <nav aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {[...extraLinks, ...links].map(([label, href]) => {
          const orientationLink = phase2Enabled && href === "/signup";
          const resolvedHref = orientationLink ? "/orientation" : hashLinksToHome && href.startsWith("#") ? `/${href}` : href;
          const resolvedLabel = orientationLink && orientationLabel ? orientationLabel : label;

          return (
            <li key={label}>
              <Link href={resolvedHref}>{resolvedLabel}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
