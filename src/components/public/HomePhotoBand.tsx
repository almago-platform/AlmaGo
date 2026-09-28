import Image from "next/image";
import s from "./Homepage.module.css";

const moments = [
  {
    label: "01",
    title: "Je m’informe sur les programmes",
    image: "https://images.pexels.com/photos/5965674/pexels-photo-5965674.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiantes se déplacent sur un campus avec un ordinateur et des documents.",
  },
  {
    label: "02",
    title: "Je prépare mes documents",
    image: "https://images.pexels.com/photos/6684514/pexels-photo-6684514.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants travaillent ensemble dans une bibliothèque universitaire.",
  },
  {
    label: "03",
    title: "Je structure mes candidatures",
    image: "https://images.pexels.com/photos/5553958/pexels-photo-5553958.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Deux étudiants discutent devant l’entrée d’un établissement universitaire.",
  },
] as const;

export function HomePhotoBand() {
  return (
    <section className={s.photoBand} aria-labelledby="photo-band-title">
      <div className={`${s.container} ${s.photoBandLayout}`}>
        <div className={s.photoBandHeading}>
          <p className={s.eyebrow}>
            <span className={s.dot} /> Un accompagnement à chaque étape
          </p>
          <h2 id="photo-band-title" className={s.photoBandTitle}>
            Un parcours clair pour réaliser
            <br />
            votre projet <em>en Allemagne.</em>
          </h2>
          <p>
            Votre projet académique d’abord. Les démarches administratives
            viennent ensuite, au bon moment et avec leurs sources.
          </p>
        </div>

        <div className={s.photoBandGrid} tabIndex={0} role="region" aria-label="Étapes du parcours étudiant, faites défiler horizontalement">
          {moments.map((moment) => (
            <article className={s.photoCard} key={moment.label}>
              <div className={s.photoCardMedia}>
                <Image
                  src={moment.image}
                  alt={moment.alt}
                  fill
                  sizes="(min-width: 1200px) 21vw, (min-width: 700px) 33vw, 100vw"
                />
              </div>
              <div className={s.photoCardBody}>
                <span>{moment.label}</span>
                <strong>{moment.title}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
