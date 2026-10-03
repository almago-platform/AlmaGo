import Link from "next/link";
import type { HomepageRedesignCopy } from "@/content/homepage-redesign-copy";
import { HomeIcon } from "./HomeIcons";
import s from "./HomepageRedesign.module.css";

export function HomeLanding({
  copy,
  primaryHref,
}: {
  copy: HomepageRedesignCopy;
  primaryHref: string;
}) {
  return (
    <>
      <Hero copy={copy.hero} primaryHref={primaryHref} />
      <Steps copy={copy.steps} />
      <Benefits copy={copy.benefits} />
      <ProductShowcase
        programmes={copy.programmes}
        documents={copy.documents}
        applications={copy.applications}
      />
      <Sources copy={copy.sources} />
      <Faq copy={copy.faq} />
      <FinalCta copy={copy.final} primaryHref={primaryHref} />
    </>
  );
}

function Hero({
  copy,
  primaryHref,
}: {
  copy: HomepageRedesignCopy["hero"];
  primaryHref: string;
}) {
  return (
    <section className={s.hero} aria-labelledby="home-title">
      <div className={s.container}>
        <div className={s.heroGrid}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>{copy.eyebrow}</p>
            <h1 id="home-title">{copy.title}</h1>
            <p className={s.heroLead}>{copy.lead}</p>
            <div className={s.heroActions}>
              <Link className={s.primaryButton} href={primaryHref}>
                {copy.primary}
                <HomeIcon name="arrow" />
              </Link>
              <a className={s.secondaryButton} href="#parcours">
                {copy.secondary}
                <HomeIcon name="arrow" />
              </a>
            </div>
            <div className={s.heroTrust}>
              <span><HomeIcon name="check" /> Programmes</span>
              <span><HomeIcon name="check" /> Documents</span>
              <span><HomeIcon name="check" /> Candidatures</span>
            </div>
          </div>

          <DashboardPreview copy={copy} />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview({ copy }: { copy: HomepageRedesignCopy["hero"] }) {
  return (
    <figure className={s.dashboardFigure}>
      <figcaption className={s.previewLabel}>{copy.previewLabel}</figcaption>
      <div className={s.dashboardShell} aria-label={copy.previewLabel}>
        <div className={s.dashboardTopbar}>
          <div>
            <span className={s.dashboardBrandMark}>A</span>
            <div>
              <p>{copy.dashboard.eyebrow}</p>
              <strong>AlmaGo</strong>
            </div>
          </div>
          <span className={s.dashboardAvatar}>LI</span>
        </div>

        <div className={s.dashboardHero}>
          <div>
            <span>{copy.dashboard.eyebrow}</span>
            <h2>{copy.dashboard.hello}</h2>
            <p>{copy.dashboard.intro}</p>
          </div>
          <span className={s.dashboardActionCount}>2</span>
        </div>

        <div className={s.dashboardMain}>
          <div className={s.dashboardPriority}>
            <div className={s.dashboardPriorityCopy}>
              <p>{copy.dashboard.nextAction}</p>
              <h3>{copy.dashboard.nextActionTitle}</h3>
              <span>{copy.dashboard.nextActionMeta}</span>
            </div>
            <span className={s.dashboardArrow}><HomeIcon name="arrow" /></span>
          </div>

          <div className={s.dashboardProgress}>
            <div>
              <p>{copy.dashboard.progress}</p>
              <strong>{copy.dashboard.progressValue}</strong>
              <span>{copy.dashboard.progressMeta}</span>
            </div>
            <div className={s.progressTrack} aria-hidden="true">
              <span />
            </div>
          </div>

          <div className={s.dashboardStats}>
            {copy.dashboard.cards.map(([label, value, detail], index) => (
              <div className={s.dashboardStat} key={label}>
                <span className={s.dashboardStatIcon}>
                  <HomeIcon name={index === 0 ? "document" : index === 1 ? "book" : index === 2 ? "route" : "check"} />
                </span>
                <div>
                  <p>{label}</p>
                  <strong>{value}</strong>
                  <span>{detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

function Steps({ copy }: { copy: HomepageRedesignCopy["steps"] }) {
  return (
    <section id="parcours" className={s.section} aria-labelledby="steps-title">
      <div className={s.container}>
        <SectionIntro eyebrow={copy.eyebrow} title={copy.title} text={copy.intro} id="steps-title" />
        <ol className={s.stepsGrid}>
          {copy.items.map(([title, text], index) => (
            <li key={title} className={s.stepCard}>
              <span className={s.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Benefits({ copy }: { copy: HomepageRedesignCopy["benefits"] }) {
  const icons = ["folder", "route", "source", "check"] as const;

  return (
    <section id="outils" className={[s.section, s.benefits].join(" ")} aria-labelledby="benefits-title">
      <div className={s.container}>
        <SectionIntro eyebrow={copy.eyebrow} title={copy.title} id="benefits-title" />
        <div className={s.benefitGrid}>
          {copy.items.map(([title, text], index) => (
            <article className={s.benefitCard} key={title}>
              <span className={s.benefitIcon}><HomeIcon name={icons[index]} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductShowcase({
  programmes,
  documents,
  applications,
}: {
  programmes: HomepageRedesignCopy["programmes"];
  documents: HomepageRedesignCopy["documents"];
  applications: HomepageRedesignCopy["applications"];
}) {
  return (
    <section className={[s.section, s.productSection].join(" ")} aria-label="Aperçu du produit AlmaGo">
      <div className={s.container}>
        <article id="programmes" className={s.featureRow}>
          <FeatureCopy eyebrow={programmes.eyebrow} title={programmes.title} text={programmes.text} />
          <ProgrammesPreview copy={programmes} />
        </article>

        <article id="documents" className={[s.featureRow, s.featureRowReverse].join(" ")}>
          <FeatureCopy eyebrow={documents.eyebrow} title={documents.title} text={documents.text} />
          <DocumentsPreview copy={documents} />
        </article>

        <article id="candidatures" className={s.featureRow}>
          <FeatureCopy eyebrow={applications.eyebrow} title={applications.title} text={applications.text} />
          <ApplicationsPreview copy={applications} />
        </article>
      </div>
    </section>
  );
}

function FeatureCopy({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className={s.featureCopy}>
      <p className={s.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function ProgrammesPreview({ copy }: { copy: HomepageRedesignCopy["programmes"] }) {
  return (
    <div className={s.productPanel}>
      <div className={s.panelTop}>
        <div>
          <span className={s.panelIcon}><HomeIcon name="book" /></span>
          <div>
            <p>{copy.eyebrow}</p>
            <strong>{copy.rows.length}</strong>
          </div>
        </div>
        <span className={s.panelBadge}>Exemple</span>
      </div>
      <div className={s.programmeRows}>
        {copy.rows.map(([title, meta, status], index) => (
          <div className={s.programmeRow} key={title}>
            <span className={s.programmeIndex}>{index + 1}</span>
            <div>
              <strong>{title}</strong>
              <span>{meta}</span>
            </div>
            <span className={s.statusBadge}>{status}</span>
          </div>
        ))}
      </div>
      <p className={s.panelNote}><HomeIcon name="source" /> {copy.note}</p>
    </div>
  );
}

function DocumentsPreview({ copy }: { copy: HomepageRedesignCopy["documents"] }) {
  return (
    <div className={s.productPanel}>
      <div className={s.panelTop}>
        <div>
          <span className={s.panelIcon}><HomeIcon name="document" /></span>
          <div>
            <p>{copy.eyebrow}</p>
            <strong>{copy.rows.length}</strong>
          </div>
        </div>
        <span className={s.panelBadge}>4/6</span>
      </div>
      <div className={s.documentRows}>
        {copy.rows.map(([title, status], index) => {
          const tone = index < 2 ? s.documentReady : index === 2 ? s.documentTodo : s.documentCheck;
          return (
            <div className={s.documentRow} key={title}>
              <span className={[s.documentState, tone].join(" ")}>
                {index < 2 ? <HomeIcon name="check" /> : index + 1}
              </span>
              <strong>{title}</strong>
              <span>{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationsPreview({ copy }: { copy: HomepageRedesignCopy["applications"] }) {
  return (
    <div className={s.productPanel}>
      <div className={s.panelTop}>
        <div>
          <span className={s.panelIcon}><HomeIcon name="route" /></span>
          <div>
            <p>{copy.eyebrow}</p>
            <strong>{copy.rows.length}</strong>
          </div>
        </div>
        <span className={s.panelBadge}>2 actives</span>
      </div>
      <div className={s.applicationRows}>
        {copy.rows.map(([name, status, deadline], index) => (
          <div className={s.applicationRow} key={name}>
            <span className={[s.applicationDot, index === 2 ? s.applicationDone : ""].join(" ")} />
            <div>
              <strong>{name}</strong>
              <span>{status}</span>
            </div>
            <time>{deadline}</time>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sources({ copy }: { copy: HomepageRedesignCopy["sources"] }) {
  return (
    <section id="sources" className={[s.section, s.sources].join(" ")} aria-labelledby="sources-title">
      <div className={s.container}>
        <div className={s.sourcesGrid}>
          <div className={s.sourcesCopy}>
            <p className={s.eyebrow}>{copy.eyebrow}</p>
            <h2 id="sources-title">{copy.title}</h2>
            <p>{copy.text}</p>
          </div>
          <div className={s.sourceCards}>
            {copy.points.map(([title, text], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq({ copy }: { copy: HomepageRedesignCopy["faq"] }) {
  return (
    <section id="faq" className={[s.section, s.faq].join(" ")} aria-labelledby="faq-title">
      <div className={[s.container, s.faqGrid].join(" ")}>
        <div className={s.faqIntro}>
          <p className={s.eyebrow}>{copy.eyebrow}</p>
          <h2 id="faq-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <div className={s.faqList}>
          {copy.items.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                <span>{question}</span>
                <HomeIcon name="plus" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({
  copy,
  primaryHref,
}: {
  copy: HomepageRedesignCopy["final"];
  primaryHref: string;
}) {
  return (
    <section className={s.finalCta} aria-labelledby="final-cta-title">
      <div className={[s.container, s.finalCtaInner].join(" ")}>
        <div>
          <p className={s.eyebrow}>{copy.eyebrow}</p>
          <h2 id="final-cta-title">{copy.title}</h2>
          <p>{copy.text}</p>
        </div>
        <div className={s.finalActions}>
          <Link className={s.primaryButton} href={primaryHref}>
            {copy.primary}
            <HomeIcon name="arrow" />
          </Link>
          <Link className={s.finalSecondary} href="/login">{copy.secondary}</Link>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
  id,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  id: string;
}) {
  return (
    <div className={s.sectionIntro}>
      <p className={s.eyebrow}>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
