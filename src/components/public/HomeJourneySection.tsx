import Link from "next/link";
import { HomeSymbol } from "./HomeSymbol";
import s from "./CodexHome.module.css";
const steps = [
  [
    "Poser votre projet",
    "Diplôme, domaine, langue, rentrée : donnez une direction à vos recherches.",
    "Le point de départ",
  ],
  [
    "Clarifier votre base académique",
    "Rassemblez vos diplômes et justificatifs. Identifiez les éléments à faire vérifier.",
    "Votre parcours actuel",
  ],
  [
    "Explorer les programmes",
    "Examinez les programmes, leurs critères, leurs échéances et leurs sources.",
    "Des pistes à comparer",
  ],
  [
    "Préparer les candidatures",
    "Reliez chaque candidature aux pièces demandées et aux actions à effectuer.",
    "Un dossier à la fois",
  ],
  [
    "Préparer les conditions du projet",
    "Langue, financement et assurance : organisez les besoins selon votre situation.",
    "Les besoins à anticiper",
  ],
  [
    "Suivre les démarches suivantes",
    "Avancez avec une checklist adaptée aux réponses reçues et à votre projet réel.",
    "La suite, au bon moment",
  ],
] as const;
export function HomeJourneySection() {
  return (
    <section
      id="parcours"
      className={s.section}
      aria-labelledby="journey-title"
    >
      <div className={[s.container, s.journeyGrid].join(" ")}>
        <div className={s.journeyIntro}>
          <p className={s.eyebrow}>Un parcours, six repères</p>
          <h2 id="journey-title" className={s.title}>
            D’abord les études.
            <br />
            <span>Puis la suite.</span>
          </h2>
          <p className={s.lead}>
            Vous n’avez pas à tout maîtriser aujourd’hui. Chaque étape vous aide
            à préparer la suivante.
          </p>
          <div className={s.journeyAside}>
            <HomeSymbol name="route" />
            <p>
              <strong>Votre première priorité</strong>Construire un projet
              académique cohérent avant les démarches qui en dépendent.
            </p>
          </div>
          <Link href="/signup" className={s.textLink}>
            Commencer par mon projet
            <HomeSymbol name="arrow" />
          </Link>
        </div>
        <ol className={s.steps} aria-label="Les six étapes du projet">
          {steps.map(([title, text, detail], index) => (
            <li key={title} id={index === 2 ? "programmes" : undefined}>
              <span className={s.stepNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className={s.stepDetail}>{detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
