import Link from "next/link";
import type { HomepageV42Copy } from "@/content/homepage-v42-copy";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const valueIcons = ["profile", "route", "source"] as const;

export function HomeAboutSection({ copy }: { copy: HomepageV42Copy["about"] }) {
  return (
    <section id="apropos" className={s.v42About} aria-labelledby="v42-about-title">
      <span id="outils" className={s.v42Anchor} aria-hidden="true" />
      <div className={s.container}>
        <div className={s.v42AboutMain}>
          <div>
            <p className={s.v42Eyebrow}>{copy.eyebrow}</p>
            <h2 id="v42-about-title" className={s.v42Heading}>{copy.title}</h2>
            <p className={s.v42Intro}>{copy.intro}</p>
            <div className={s.v43AboutContact}>
              <Link href="/contact">{copy.contactLabel}<HomeIcon name="arrow" /></Link>
              <a href="mailto:contact@campus-allemagne.info">contact@campus-allemagne.info</a>
            </div>
          </div>
          <aside className={s.v42Mission}>
            <span className={s.v42MissionIcon} aria-hidden="true"><HomeIcon name="compass" /></span>
            <p className={s.v42MissionLabel}>{copy.missionLabel}</p>
            <p className={s.v42MissionText}>{copy.mission}</p>
          </aside>
        </div>
        <h3 className={s.v42ValuesHeading}>{copy.valuesTitle}</h3>
        <div className={s.v42Values}>
          {copy.values.map(([title, text], index) => (
            <article className={s.v42ValueCard} key={title}>
              <span className={s.v42ValueIcon} aria-hidden="true"><HomeIcon name={valueIcons[index]} /></span>
              <h4>{title}</h4>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className={s.v42Independent}><HomeIcon name="source" /> {copy.independence}</p>
      </div>
    </section>
  );
}
