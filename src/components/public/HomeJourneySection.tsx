"use client";

import Image from "next/image";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const images = [
  ["https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg?auto=compress&cs=tinysrgb&w=1200", "Students reviewing documents outside a university building."],
  ["https://images.pexels.com/photos/6207367/pexels-photo-6207367.jpeg?auto=compress&cs=tinysrgb&w=1200", "Documents and a pen on a desk."],
  ["https://images.pexels.com/photos/31039023/pexels-photo-31039023.jpeg?auto=compress&cs=tinysrgb&w=1200", "Students walking outside a modern university campus."],
  ["https://images.pexels.com/photos/5306450/pexels-photo-5306450.jpeg?auto=compress&cs=tinysrgb&w=1200", "Students working together with a laptop and notes."],
  ["https://images.pexels.com/photos/5940705/pexels-photo-5940705.jpeg?auto=compress&cs=tinysrgb&w=1200", "Students working on laptops in a library."],
  ["https://images.pexels.com/photos/7972361/pexels-photo-7972361.jpeg?auto=compress&cs=tinysrgb&w=1200", "Two students talking during a study session."],
] as const;

export function HomeJourneySection() {
  const { copy } = useLocale();
  const journey = copy.home.journey;

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
        <ol className={s.steps} aria-label={journey.aria}>
          {journey.steps.map(([title, text, detail], index) => (
            <li key={title} id={index === 2 ? "programmes" : undefined} className={s.stepCard}>
              <div className={s.stepMedia}>
                <Image
                  src={images[index][0]}
                  alt={images[index][1]}
                  fill
                  sizes="(min-width: 1200px) 31vw, (min-width: 700px) 48vw, 100vw"
                />
                <span className={s.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
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
          <a href="/signup">
            {journey.cta}
            <HomeIcon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
