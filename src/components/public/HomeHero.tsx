import Image from "next/image";
import Link from "next/link";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeHero() {
  return (
    <section className={s.hero} aria-labelledby="home-title">
      <div className={`${s.container} ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>
            <span className={s.dot} /> Votre projet. Votre avenir.
          </p>
          <h1 id="home-title">
            Étudier en <br />
            Allemagne,
            <br />
            <em>avec un cap clair.</em>
          </h1>
          <p className={s.heroLead}>
            Programmes, documents, candidatures : AlmaGo rassemble votre projet
            dans un seul espace et vous aide à savoir quoi faire ensuite.
          </p>
          <div className={s.heroActions}>
            <Link className={s.button} href="/signup">
              Créer mon dossier
              <HomeIcon name="arrow" />
            </Link>
            <a className={s.textLink} href="#espace">
              Découvrir l’espace étudiant
              <HomeIcon name="arrow" />
            </a>
          </div>
          <div className={s.heroProof}>
            <span>
              <HomeIcon name="check" /> Parcours en 6 étapes
            </span>
            <span>
              <HomeIcon name="check" /> Un dossier structuré
            </span>
            <span>
              <HomeIcon name="check" /> Des sources identifiées
            </span>
          </div>
        </div>
        <div className={s.heroVisual}>
          <figure className={s.heroPhoto}>
            <Image
              src="https://images.pexels.com/photos/7683694/pexels-photo-7683694.jpeg"
              alt="Un groupe d’étudiants échange devant un bâtiment universitaire moderne."
              fill
              priority
              sizes="(min-width: 1400px) 760px, (min-width: 900px) 58vw, (min-width: 600px) 82vw, 100vw"
              quality={90}
            />
            <figcaption>Votre projet. Une direction claire.</figcaption>
          </figure>
          <div className={s.heroDossier}>
            <div className={s.miniHead}>
              <span>
                <HomeIcon name="folder" /> Votre projet prend forme
              </span>
              <span className={s.sample}>Exemple</span>
            </div>
            <div className={s.miniRow}>
              <span className={s.miniCheck}>
                <HomeIcon name="check" />
              </span>
              <div>
                <strong>Votre projet d’études</strong>
                <span>Une direction définie</span>
              </div>
              <span className={s.miniStatus}>Renseigné</span>
            </div>
            <div className={s.miniRow}>
              <span className={s.miniNext}>02</span>
              <div>
                <strong>Vos documents</strong>
                <span>La prochaine étape à préparer</span>
              </div>
              <HomeIcon name="arrow" />
            </div>
          </div>
          <span className={s.heroSideNote} aria-hidden="true">
            D’un projet à un parcours.
          </span>
        </div>
      </div>
    </section>
  );
}
