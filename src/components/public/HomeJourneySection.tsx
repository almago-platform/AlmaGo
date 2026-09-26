import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const steps = [
  {
    title: "Poser votre projet",
    text: "Le diplôme, le domaine, la langue et la rentrée qui donnent une direction à vos recherches.",
    detail: "Votre point de départ",
  },
  {
    title: "Établir votre base académique",
    text: "Vos diplômes et justificatifs, avec ce qui est acquis et ce qui reste à vérifier.",
    detail: "Les éléments de votre parcours",
  },
  {
    title: "Explorer les programmes",
    text: "Des pistes à examiner selon votre profil, leurs critères, leurs échéances et leurs sources.",
    detail: "Des choix à comparer",
    id: "programmes",
  },
  {
    title: "Préparer vos candidatures",
    text: "Les pièces, les statuts et la prochaine action de chaque candidature, réunis au même endroit.",
    detail: "Un suivi pour chaque dossier",
  },
  {
    title: "Organiser votre préparation",
    text: "Langue, financement et assurance : des besoins à préparer selon votre projet réel.",
    detail: "Les conditions de votre départ",
  },
  {
    title: "Suivre la suite du parcours",
    text: "Une checklist pour les démarches qui deviennent pertinentes et les réponses encore attendues.",
    detail: "Le prochain pas, au bon moment",
  },
] as const;

export function HomeJourneySection() {
  return (
    <section
      id="parcours"
      className={`${s.section} ${s.journey}`}
      aria-labelledby="journey-title"
    >
      <div className={s.container}>
        <div className={s.sectionHeading}>
          <div>
            <p className={s.eyebrow}>Le parcours, simplement</p>
            <h2 id="journey-title" className={s.sectionTitle}>
              Un grand projet.
              <br />
              <em>Six étapes pour avancer.</em>
            </h2>
          </div>
          <p>
            Vous n’avez pas à tout connaître dès le départ. Commencez par votre
            projet académique, puis préparez les démarches qui en découlent.
          </p>
        </div>
        <ol
          className={s.steps}
          aria-label="Les six étapes de votre projet d’études"
        >
          {steps.map((step, i) => (
            <li key={step.title} id={"id" in step ? step.id : undefined}>
              <div className={s.stepNumber}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <HomeIcon name={i === 5 ? "check" : "arrow"} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className={s.stepDetail}>{step.detail}</span>
            </li>
          ))}
        </ol>
        <div className={s.journeyFoot}>
          <span>
            <HomeIcon name="source" /> Votre préparation avance. Les décisions
            restent aux organismes compétents.
          </span>
          <a href="/signup">
            Commencer par mon projet
            <HomeIcon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
