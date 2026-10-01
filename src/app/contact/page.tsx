import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { HomeFooter } from "@/components/public/HomeClosing";
import { getNativeCopy } from "@/content/native-copy";
import { rebrandCopy } from "@/lib/brand";
import { LOCALE_COOKIE, normalizeLocale, type Locale } from "@/lib/i18n";
import { isPhase2AccessEnabled } from "@/lib/phase2/config";
import { isPublicIndexingEnabled } from "@/lib/public-indexing";
import { getPublicOrigin } from "@/lib/public-origin";
import s from "./ContactPage.module.css";

const contactCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    emailLabel: string;
    cta: string;
    safetyTitle: string;
    safetyText: string;
    back: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  fr: {
    eyebrow: "Contact",
    title: "Une question ? Écrivez-nous.",
    intro:
      "Une question sur Campus Allemagne, votre compte ou votre projet d’études ? Contactez-nous directement par e-mail.",
    emailLabel: "Adresse de contact",
    cta: "Écrire à Campus Allemagne",
    safetyTitle: "Pour votre sécurité",
    safetyText:
      "N’envoyez jamais votre mot de passe par e-mail. Pour les documents sensibles, privilégiez votre espace étudiant lorsque cela suffit.",
    back: "Retour à l’accueil",
    metaTitle: "Contact",
    metaDescription: "Contactez Campus Allemagne à contact@campus-allemagne.info.",
  },
  ar: {
    eyebrow: "تواصل معنا",
    title: "لديك سؤال؟ راسلنا.",
    intro:
      "إذا كان لديك سؤال عن Campus Allemagne أو حسابك أو مشروعك الدراسي، يمكنك التواصل معنا مباشرة عبر البريد الإلكتروني.",
    emailLabel: "بريد التواصل",
    cta: "راسل Campus Allemagne",
    safetyTitle: "لحماية بياناتك",
    safetyText:
      "لا ترسل كلمة المرور عبر البريد الإلكتروني. وبالنسبة إلى المستندات الحساسة، استخدم مساحة الطالب عندما تكون كافية.",
    back: "العودة إلى الصفحة الرئيسية",
    metaTitle: "تواصل معنا",
    metaDescription: "تواصل مع Campus Allemagne عبر contact@campus-allemagne.info.",
  },
  en: {
    eyebrow: "Contact",
    title: "Have a question? Get in touch.",
    intro:
      "If you have a question about Campus Allemagne, your account, or your study plans, contact us directly by email.",
    emailLabel: "Contact email",
    cta: "Email Campus Allemagne",
    safetyTitle: "Keep your information safe",
    safetyText:
      "Never send your password by email. For sensitive documents, use your student workspace whenever it is sufficient.",
    back: "Back to home",
    metaTitle: "Contact",
    metaDescription: "Contact Campus Allemagne at contact@campus-allemagne.info.",
  },
  de: {
    eyebrow: "Kontakt",
    title: "Du hast eine Frage? Schreib uns.",
    intro:
      "Wenn du eine Frage zu Campus Allemagne, deinem Konto oder deinem Studienvorhaben hast, erreichst du uns direkt per E-Mail.",
    emailLabel: "Kontakt-E-Mail",
    cta: "Campus Allemagne schreiben",
    safetyTitle: "Schütze deine Daten",
    safetyText:
      "Sende dein Passwort niemals per E-Mail. Für sensible Dokumente solltest du deinen Studierendenbereich nutzen, wenn das ausreicht.",
    back: "Zur Startseite",
    metaTitle: "Kontakt",
    metaDescription: "Kontaktiere Campus Allemagne unter contact@campus-allemagne.info.",
  },
};

async function requestLocale() {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const [locale, publicOrigin] = await Promise.all([requestLocale(), getPublicOrigin()]);
  const contact = contactCopy[locale];
  const indexingEnabled = isPublicIndexingEnabled();

  return {
    title: `${contact.metaTitle} | Campus Allemagne`,
    description: contact.metaDescription,
    alternates: {
      canonical: new URL("/contact", publicOrigin).toString(),
    },
    robots: {
      index: indexingEnabled,
      follow: indexingEnabled,
    },
  };
}

export default async function ContactPage() {
  const locale = await requestLocale();
  const contact = contactCopy[locale];
  const copy = rebrandCopy(getNativeCopy(locale));
  const phase2Enabled = isPhase2AccessEnabled();

  return (
    <div className={s.page}>
      <a className={s.skipLink} href="#contact-main">
        {copy.common.skip}
      </a>

      <header className={s.header}>
        <div className={s.container}>
          <Link href="/" aria-label={copy.common.homeAria} className={s.logoLink}>
            <BrandLogo className={s.logo} priority />
          </Link>
          <Link href="/" className={s.backLink}>
            {contact.back}
          </Link>
        </div>
      </header>

      <main id="contact-main" className={s.main}>
        <section className={s.hero} aria-labelledby="contact-title">
          <div className={s.heroInner}>
            <p className={s.eyebrow}>{contact.eyebrow}</p>
            <h1 id="contact-title">{contact.title}</h1>
            <p className={s.intro}>{contact.intro}</p>

            <div className={s.contactCard}>
              <p className={s.contactLabel}>{contact.emailLabel}</p>
              <a
                className={s.email}
                href="mailto:contact@campus-allemagne.info"
                dir="ltr"
              >
                contact@campus-allemagne.info
              </a>
              <a className={s.button} href="mailto:contact@campus-allemagne.info">
                {contact.cta}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <aside className={s.safety}>
              <strong>{contact.safetyTitle}</strong>
              <p>{contact.safetyText}</p>
            </aside>
          </div>
        </section>
      </main>

      <HomeFooter
        footer={copy.home.footer}
        homeAria={copy.common.homeAria}
        phase2Enabled={phase2Enabled}
        orientationLabel={copy.home.nav.orientation}
      />
    </div>
  );
}
