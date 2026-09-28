import Image from "next/image";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const steps = [
  {
    title: "Définir mon projet",
    text: "Choisissez le diplôme, le domaine, la langue et la rentrée qui vous intéressent.",
    detail: "Mon point de départ",
    image: "https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants relisent ensemble des documents à l’extérieur d’un bâtiment universitaire.",
  },
  {
    title: "Préparer mes documents",
    text: "Ajoutez vos diplômes et les documents que vous avez déjà.",
    detail: "Mes études",
    image: "https://images.pexels.com/photos/6207367/pexels-photo-6207367.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des documents et un stylo sont posés sur une table de travail.",
  },
  {
    title: "Comparer les programmes",
    text: "Regardez les critères, les dates et la source officielle.",
    detail: "Mes options",
    id: "programmes",
    image: "https://images.pexels.com/photos/31039023/pexels-photo-31039023.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants marchent devant l’entrée d’un campus universitaire moderne.",
  },
  {
    title: "Préparer mes candidatures",
    text: "Pour chaque programme, voyez les documents et la prochaine action.",
    detail: "Mes dossiers",
    image: "https://images.pexels.com/photos/5306450/pexels-photo-5306450.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants travaillent ensemble avec un ordinateur et des notes.",
  },
  {
    title: "Préparer le départ",
    text: "Voyez ce dont vous aurez besoin selon votre projet.",
    detail: "Langue, budget, assurance",
    image: "https://images.pexels.com/photos/5940705/pexels-photo-5940705.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Un groupe d’étudiants travaille sur des ordinateurs dans une bibliothèque.",
  },
  {
    title: "Suivre mes étapes",
    text: "Voyez ce qui est fait et ce qu’il reste à faire.",
    detail: "La suite",
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
            <p className={s.eyebrow}>Votre parcours, simplement</p>
            <h2 id="journey-title" className={s.sectionTitle}>
              Six étapes
              <br />
              <em>pour avancer.</em>
            </h2>
          </div>
          <p>
            Vous n’avez pas besoin de tout savoir maintenant. Faites une étape
            à la fois.
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
            <HomeIcon name="source" /> AlmaGo vous aide à préparer. Les
            universités et les autorités prennent les décisions.
          </span>
          <a href="/signup">
            Commencer mon dossier
            <HomeIcon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
