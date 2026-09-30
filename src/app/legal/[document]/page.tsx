import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  isLegalPublicationReady,
  legalDocuments,
  type LegalDocumentKey,
} from "@/content/legal-content";
import s from "./LegalPage.module.css";

type LegalPageProps = {
  params: Promise<{ document: string }>;
};

function isLegalDocumentKey(value: string): value is LegalDocumentKey {
  return value === "imprint" || value === "privacy" || value === "terms";
}

async function getDocument(params: LegalPageProps["params"]) {
  const { document } = await params;

  if (!isLegalDocumentKey(document)) {
    notFound();
  }

  return legalDocuments[document];
}

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const document = await getDocument(params);
  const ready = isLegalPublicationReady();

  return {
    title: `${document.title} | Campus Allemagne`,
    description: document.description,
    robots: {
      index: ready,
      follow: ready,
    },
  };
}

export default async function LegalDocumentPage({ params }: LegalPageProps) {
  const document = await getDocument(params);
  const ready = isLegalPublicationReady();

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/" aria-label="Retour à l’accueil" className={s.logoLink}>
            <BrandLogo className={s.logo} priority />
          </Link>
          <Link href="/" className={s.backLink}>
            Retour à l’accueil
          </Link>
        </div>
      </header>

      <main className={s.main}>
        <article className={s.card}>
          <p className={s.eyebrow}>Campus Allemagne · Informations juridiques</p>
          <h1>{document.title}</h1>

          {!ready ? (
            <div className={s.pending} role="status">
              <h2>Document en cours de finalisation</h2>
              <p>
                Cette page est préparée, mais son contenu juridique n’est pas encore
                publié. Il sera rendu disponible uniquement après confirmation des
                informations de l’exploitant et relecture humaine finale.
              </p>
              <p>
                La version juridique de référence sera rédigée en français. Aucune
                traduction juridique automatique n’est publiée avant validation.
              </p>
              <p>
                Pour toute question, écrivez à{" "}
                <a href="mailto:contact@campus-allemagne.info">
                  contact@campus-allemagne.info
                </a>.
              </p>
            </div>
          ) : (
            <div className={s.sections}>
              {document.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          )}

          <nav className={s.legalNav} aria-label="Documents juridiques">
            <Link href="/legal/imprint">Mentions légales</Link>
            <Link href="/legal/privacy">Confidentialité</Link>
            <Link href="/legal/terms">Conditions d’utilisation</Link>
          </nav>
        </article>
      </main>
    </div>
  );
}
