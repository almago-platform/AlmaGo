import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const tools = [
  {
    href: "/signup",
    icon: "certificate",
    title: "Évaluer mon point de départ",
    text: "Diplôme, domaine, langue et rentrée : posez les bases de votre projet avant de chercher.",
    cta: "Commencer mon dossier",
  },
  {
    href: "#programmes",
    icon: "university",
    title: "Explorer les programmes",
    text: "Comparez des pistes selon votre profil, leurs critères, leurs échéances et leurs sources.",
    cta: "Voir les programmes",
  },
  {
    href: "#faq",
    icon: "globe",
    title: "Trouver les bons repères",
    text: "Identifiez où confirmer une information et quel organisme est responsable de la décision.",
    cta: "Consulter les repères",
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
          <p className={s.eyebrow}>Pour avancer plus simplement</p>
          <h2 id="helpful-tools-title">Outils utiles</h2>
          <p>
            Trois points d’entrée pour clarifier votre projet, explorer vos
            options et savoir où vérifier les informations importantes.
          </p>
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

        <p className={s.helpfulToolsNote}>
          AlmaGo organise votre préparation. Les admissions, visas et autres
          décisions officielles restent aux organismes compétents.
        </p>
      </div>
    </section>
  );
}
