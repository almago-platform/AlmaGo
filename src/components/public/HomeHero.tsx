"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeHero() {
  const { copy } = useLocale();
  const hero = copy.home.hero;

  return (
    <section className={s.hero} aria-labelledby="home-title">
      <div className={s.heroBackdrop} aria-hidden="true">
        <Image
          src="https://images.pexels.com/photos/7972313/pexels-photo-7972313.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={90}
          sizes="100vw"
        />
      </div>
      <div className={s.heroShade} aria-hidden="true" />
      <div className={`${s.container} ${s.heroImmersiveInner}`}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>
            <span className={s.dot} /> {hero.eyebrow}
          </p>
          <h1 id="home-title">
            {hero.title1}
            <br />
            {hero.title2}
            <br />
            <em>{hero.title3}</em>
          </h1>
          <p className={s.heroLead}>{hero.lead}</p>
          <div className={s.heroActions}>
            <Link className={s.button} href="/signup">
              {hero.primary}
              <HomeIcon name="arrow" />
            </Link>
            <a className={s.heroTextLink} href="#parcours">
              {hero.secondary}
              <HomeIcon name="arrow" />
            </a>
          </div>
          <div className={s.heroProof}>
            {hero.proof.map((item) => (
              <span key={item}>
                <HomeIcon name="check" /> {item}
              </span>
            ))}
          </div>
        </div>

        <aside className={s.heroDossier} aria-label={hero.exampleAria}>
          <div className={s.miniHead}>
            <span>
              <HomeIcon name="folder" /> {hero.exampleTitle}
            </span>
            <span className={s.sample}>{hero.sample}</span>
          </div>
          {hero.rows.map(([title, detail, status], index) => (
            <div className={s.miniRow} key={title}>
              {index === 0 ? (
                <span className={s.miniCheck}><HomeIcon name="check" /></span>
              ) : (
                <span className={index === 1 ? s.miniNext : s.miniLater}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <div>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
              {status ? <span className={s.miniStatus}>{status}</span> : <HomeIcon name="arrow" />}
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
