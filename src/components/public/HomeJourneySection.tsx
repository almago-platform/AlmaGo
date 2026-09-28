import Image from "next/image";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const steps = [
  {
    title: "Poser votre projet",
    text: "Le diplôme, le domaine, la langue et la rentrée qui donnent une direction à vos recherches.",
    detail: "Votre point de départ",
    image: "https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants relisent ensemble des documents à l’extérieur d’un bâtiment universitaire.",
  },
  {
    title: "Établir votre base académique",
    text: "Vos diplômes et justificatifs, avec ce qui est acquis et ce qui reste à vérifier.",
    detail: "Les éléments de votre parcours",
    image: "https://images.pexels.com/photos/6207367/pexels-photo-6207367.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des documents et un stylo sont posés sur une table de travail.",
  },
  {
    title: "Explorer les programmes",
    text: "Des pistes à examiner selon votre profil, leurs critères, leurs échéances et leurs sources.",
    detail: "Des choix à comparer",
    id: "programmes",
    image: "https://images.pexels.com/photos/31039023/pexels-photo-31039023.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants marchent devant l’entrée d’un campus universitaire moderne.",
  },
  {
    title: "Préparer vos candidatures",
    text: "Les pièces, les statuts et la prochaine action de chaque candidature, réunis au même endroit.",
    detail: "Un suivi pour chaque dossier",
    image: "https://images.pexels.com/photos/5306450/pexels-photo-5306450.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants travaillent ensemble avec un ordinateur et des notes.",
  },
  {
    title: "Organiser votre préparation",
    text: "Langue, financement et assurance : des besoins à préparer selon votre projet réel.",
    detail: "Les conditions de votre départ",
    image: "https://images.pexels.com/photos/5940705/pexels-photo-5940705.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Un groupe d’étudiants travaille sur des ordinateurs dans une bibliothèque.",
  },
  {
    title: "Suivre la suite du parcours",
    text: "Une checklist pour les démarches qui deviennent pertinentes et les réponses encore attendues.",
    detail: "Le prochain pas, au bon moment",
    image: "https://images.pexels.com/photos/7972361/pexels-photo-7972361.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Deux étudiants échangent pendant une séance de travail sur un campus.",
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
            Vous n’avez pas à tout connaître dès le départ. Chaque étape garde
            le contexte, les pièces et les sources utiles au même endroit.
          </p>
        </div>
        <ol
          className={s.steps}
          aria-label="Les six étapes de votre projet d’études"
        >
          {steps.map((step, i) => (
            <li
              key={step.title}
              id={"id" in step ? step.id : undefined}
              className={s.stepCard}
            >
              <div className={s.stepMedia}>
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(min-width: 1200px) 31vw, (min-width: 700px) 48vw, 100vw"
                />
                <span className={s.stepIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className={s.stepBody}>
                <div className={s.stepTopline}>
                  <span>{step.detail}</span>
                  <HomeIcon name={i === 5 ? "check" : "arrow"} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
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
