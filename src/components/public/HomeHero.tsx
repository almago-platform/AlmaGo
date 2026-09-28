import Image from "next/image";
import Link from "next/link";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeHero() {
  return (
    <section className={s.hero} aria-labelledby="home-title">
      <div className={s.heroBackdrop} aria-hidden="true">
        <Image
          src="https://images.pexels.com/photos/7972313/pexels-photo-7972313.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
        />
      </div>
      <div className={s.heroShade} aria-hidden="true" />
      <div className={`${s.container} ${s.heroImmersiveInner}`}>
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
            <a className={s.heroTextLink} href="#parcours">
              Comprendre le parcours
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

        <aside className={s.heroDossier} aria-label="Exemple de dossier AlmaGo">
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
          <div className={s.miniRow}>
            <span className={s.miniLater}>03</span>
            <div>
              <strong>Vos candidatures</strong>
              <span>À structurer selon vos choix</span>
            </div>
            <HomeIcon name="arrow" />
          </div>
        </aside>
      </div>
    </section>
  );
}
