import Image from "next/image";
import type { getNativeCopy } from "@/content/native-copy";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

type JourneyCopy = ReturnType<typeof getNativeCopy>["home"]["journey"];

const images = [
  "https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6207367/pexels-photo-6207367.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/31039023/pexels-photo-31039023.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5306450/pexels-photo-5306450.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5940705/pexels-photo-5940705.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7972361/pexels-photo-7972361.jpeg?auto=compress&cs=tinysrgb&w=1200",
] as const;

const stepIds = ["projet", "documents", "programmes", "candidatures", "depart", "suivi"] as const;

export function HomeJourneySection({
  journey,
  primaryHref = "/signup",
  primaryLabel,
}: {
  journey: JourneyCopy;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <section id="parcours" className={`${s.section} ${s.journey}`} aria-labelledby="journey-title">
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
          <p>{journey.intro}</p>
        </div>
        <div className={s.journeyRail} aria-hidden="true">
          {journey.steps.map(([title], index) => (
            <div className={s.journeyRailStep} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{title}</small>
            </div>
          ))}
        </div>
        <ol className={s.steps} aria-label={journey.aria}>
          {journey.steps.map(([title, text, detail], index) => (
            <li
              key={title}
              id={stepIds[index]}
              className={s.stepCard}
              data-step={String(index + 1).padStart(2, "0")}
            >
              <span className={s.stepIndex} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={s.stepMedia}>
                <Image
                  src={images[index]}
                  alt={journey.imageAlts[index]}
                  fill
                  sizes="(min-width: 1200px) 31vw, (min-width: 700px) 48vw, 100vw"
                />
              </div>
              <div className={s.stepBody}>
                <div className={s.stepTopline}>
                  <span>{detail}</span>
                  <HomeIcon name={index === 5 ? "check" : "arrow"} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className={s.journeyFoot}>
          <span>
            <HomeIcon name="source" /> {journey.foot}
          </span>
          <a href={primaryHref}>
            {primaryLabel || journey.cta}
            <HomeIcon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
