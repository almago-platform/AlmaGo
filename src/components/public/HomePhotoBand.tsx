import Image from "next/image";
import s from "./Homepage.module.css";

const moments = [
  {
    label: "Préparer",
    title: "Rassembler les bonnes pièces.",
    image: "https://images.pexels.com/photos/6684514/pexels-photo-6684514.jpeg",
    alt: "Des étudiants travaillent ensemble dans une bibliothèque universitaire.",
  },
  {
    label: "Comparer",
    title: "Garder vos options visibles.",
    image: "https://images.pexels.com/photos/5965674/pexels-photo-5965674.jpeg",
    alt: "Deux étudiantes se déplacent sur un campus avec un ordinateur et des documents.",
  },
  {
    label: "Avancer",
    title: "Savoir ce qui vient ensuite.",
    image: "https://images.pexels.com/photos/5553958/pexels-photo-5553958.jpeg",
    alt: "Deux étudiants discutent devant l’entrée d’un établissement universitaire.",
  },
] as const;

export function HomePhotoBand() {
  return (
    <section className={s.photoBand} aria-labelledby="photo-band-title">
      <div className={s.container}>
        <div className={s.photoBandHeading}>
          <div>
            <p className={s.eyebrow}>Un projet réel</p>
            <h2 id="photo-band-title" className={s.sectionTitle}>
              Des décisions concrètes.
              <br />
              <em>Un fil pour les relier.</em>
            </h2>
          </div>
          <p>
            AlmaGo ne remplace pas les organismes officiels. Il vous aide à
            garder ensemble les éléments utiles de votre préparation.
          </p>
        </div>
        <div className={s.photoBandGrid}>
          {moments.map((moment) => (
            <figure className={s.photoTile} key={moment.label}>
              <Image
                src={moment.image}
                alt={moment.alt}
                fill
                sizes="(min-width: 1000px) 33vw, (min-width: 650px) 50vw, 100vw"
              />
              <figcaption>
                <span>{moment.label}</span>
                <strong>{moment.title}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
