import Link from "next/link";
import type { HomepageV42Copy } from "@/content/homepage-v42-copy";
import { HomeIcon, type HomeIconName } from "./HomeIcons";
import s from "./Homepage.module.css";

const serviceIcons: readonly HomeIconName[] = ["compass", "profile", "source"];

export function HomeServicesSection({
  copy,
  orientationHref,
}: {
  copy: HomepageV42Copy["services"];
  orientationHref: string;
}) {
  const links = [orientationHref, "/signup", "/contact"] as const;

  return (
    <section id="services" className={s.v42Services} aria-labelledby="v42-services-title">
      <div className={s.container}>
        <div className={s.v42ServicesHeading}>
          <p className={s.v42Eyebrow}>{copy.eyebrow}</p>
          <h2 id="v42-services-title" className={s.v42Heading}>{copy.title}</h2>
          <p className={s.v42Intro}>{copy.intro}</p>
        </div>
        <div className={s.v42ServiceGrid}>
          {copy.options.map(([tag, title, description, cta], index) => (
            <article key={title} className={s.v42ServiceCard}>
              <span className={s.v42ServiceTag}>{tag}</span>
              <span className={s.v42ServiceIcon} aria-hidden="true"><HomeIcon name={serviceIcons[index]} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link className={s.v42ServiceAction} href={links[index]}>
                {cta}<HomeIcon name="arrow" />
              </Link>
            </article>
          ))}
        </div>
        <p className={s.v42ServiceNote}><HomeIcon name="source" />{copy.note}</p>
      </div>
    </section>
  );
}
