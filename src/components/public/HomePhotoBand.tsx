"use client";

import Image from "next/image";
import { useLocale } from "@/components/i18n/LocaleProvider";
import s from "./Homepage.module.css";

const images = [
  "https://images.pexels.com/photos/5965674/pexels-photo-5965674.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6684514/pexels-photo-6684514.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5553958/pexels-photo-5553958.jpeg?auto=compress&cs=tinysrgb&w=1200",
] as const;

export function HomePhotoBand() {
  const { copy } = useLocale();
  const photo = copy.home.photo;

  return (
    <section className={s.photoBand} aria-labelledby="photo-band-title">
      <div className={`${s.container} ${s.photoBandLayout}`}>
        <div className={s.photoBandHeading}>
          <p className={s.eyebrow}>
            <span className={s.dot} /> {photo.eyebrow}
          </p>
          <h2 id="photo-band-title" className={s.photoBandTitle}>
            {photo.title1}
            <br />
            <em>{photo.title2}</em>
          </h2>
          <p>{photo.text}</p>
        </div>

        <div className={s.photoBandGrid} tabIndex={0} role="region" aria-label={photo.regionAria}>
          {photo.cards.map((title, index) => (
            <article className={s.photoCard} key={title}>
              <div className={s.photoCardMedia}>
                <Image
                  src={images[index]}
                  alt={photo.alts[index]}
                  fill
                  sizes="(min-width: 1200px) 21vw, (min-width: 700px) 33vw, 100vw"
                />
              </div>
              <div className={s.photoCardBody}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{title}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
