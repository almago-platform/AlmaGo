import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const tools = [
  {
    href: "/signup",
    icon: "certificate",
    title: "Voir par où commencer",
    text: "Indiquez votre diplôme, votre domaine, votre langue et votre rentrée.",
    cta: "Commencer mon dossier",
  },
  {
    href: "#programmes",
    icon: "university",
    title: "Comparer les programmes",
    text: "Regardez les critères, les dates et la source officielle.",
    cta: "Voir les programmes",
  },
  {
    href: "#faq",
    icon: "globe",
    title: "Vérifier une information",
    text: "Voyez qui donne l’information et où la confirmer.",
    cta: "Voir les sources",
  },
] as const;

export function HomeTrustSection() {
  return (
    <section
      id="outils"
      className={`${s.section} ${s.helpfulTools}`}
      aria-labelledby="helpful-tools-title"
    >
      <div className={s.container}>
        <div className={s.helpfulToolsHeading}>
          <p className={s.eyebrow}>Pour avancer</p>
          <h2 id="helpful-tools-title">Choisissez par où commencer.</h2>
          <p>Trois façons simples d’avancer dans votre projet.</p>
        </div>

        <div className={s.helpfulToolsGrid}>
          {tools.map((tool) => (
            <a className={s.helpfulToolCard} href={tool.href} key={tool.title}>
              <span className={s.helpfulToolIcon} aria-hidden="true">
                <HomeIcon name={tool.icon} />
              </span>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
              <span className={s.helpfulToolAction}>
                {tool.cta}
                <HomeIcon name="arrow" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
