import type { getNativeCopy } from "@/content/native-copy";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

type JourneyCopy = ReturnType<typeof getNativeCopy>["home"]["journey"];
type PhotoCopy = ReturnType<typeof getNativeCopy>["home"]["photo"];

// Preserve anchors used by the homepage quick links and historical URLs.
const stepIds = ["projet", "documents", "programmes", "candidatures", "depart", "suivi"] as const;

export function HomeJourneySection({
  journey,
  photo,
  phaseLabels,
  primaryHref = "/signup",
  primaryLabel,
}: {
  journey: JourneyCopy;
  photo: PhotoCopy;
  phaseLabels: readonly [string, string, string];
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <section id="parcours" className={`${s.section} ${s.journey} ${s.v43Journey}`} aria-labelledby="journey-title">
      <div className={s.container}>
        <div className={s.sectionHeading}>
          <div>
            <p className={s.eyebrow}>{journey.eyebrow}</p>
            <h2 id="journey-title" className={s.sectionTitle}>
              {journey.title1}
              <br />
              <em>{journey.title2}</em>
            </h2>
          </div>
          <div className={s.journeyIntro}>
            <p>{journey.intro}</p>
            <p className={s.journeyContext}>{photo.text}</p>
          </div>
        </div>
        <div className={s.v43Phases} aria-label={journey.aria}>
          {phaseLabels.map((phase, groupIndex) => (
            <section key={phase} className={s.v43Phase} aria-labelledby={`journey-phase-${groupIndex}`}>
              <div className={s.v43PhaseHeading}>
                <span className={s.v43PhaseNumber} aria-hidden="true">{String(groupIndex + 1).padStart(2, "0")}</span>
                <h3 id={`journey-phase-${groupIndex}`}>{phase}</h3>
              </div>
              <ol start={groupIndex * 2 + 1} className={s.v43PhaseSteps}>
                {journey.steps.slice(groupIndex * 2, groupIndex * 2 + 2).map(([title, description], stepIndex) => {
                  const index = groupIndex * 2 + stepIndex;
                  return (
                    <li key={title} id={stepIds[index]} className={s.v43PhaseStep}>
                      <span className={s.v43StepNumber} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h4>{title}</h4>
                        <p>{description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
        <div className={s.journeyFoot}>
          <span><HomeIcon name="source" /> {journey.foot}</span>
          <a href={primaryHref}>{primaryLabel || journey.cta}<HomeIcon name="arrow" /></a>
        </div>
      </div>
    </section>
  );
}
