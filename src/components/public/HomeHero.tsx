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
            <span className={s.dot} /> Étudier en Allemagne, étape par étape.
          </p>
          <h1 id="home-title">
            Votre projet d’études
            <br />
            en Allemagne,
            <br />
            <em>plus clair.</em>
          </h1>
          <p className={s.heroLead}>
            AlmaGo vous aide à préparer votre dossier, comparer des programmes
            et savoir quoi faire ensuite.
          </p>
          <div className={s.heroActions}>
            <Link className={s.button} href="/signup">
              Créer mon dossier
              <HomeIcon name="arrow" />
            </Link>
            <a className={s.heroTextLink} href="#parcours">
              Voir les étapes
              <HomeIcon name="arrow" />
            </a>
          </div>
          <div className={s.heroProof}>
            <span>
              <HomeIcon name="check" /> 6 étapes simples
            </span>
            <span>
              <HomeIcon name="check" /> Documents au même endroit
            </span>
            <span>
              <HomeIcon name="check" /> Sources officielles à vérifier
            </span>
          </div>
        </div>

        <aside className={s.heroDossier} aria-label="Exemple de dossier AlmaGo">
          <div className={s.miniHead}>
            <span>
              <HomeIcon name="folder" /> Votre dossier avance
            </span>
            <span className={s.sample}>Exemple</span>
          </div>
          <div className={s.miniRow}>
            <span className={s.miniCheck}>
              <HomeIcon name="check" />
            </span>
            <div>
              <strong>Mon projet</strong>
              <span>Objectif indiqué</span>
            </div>
            <span className={s.miniStatus}>Indiqué</span>
          </div>
          <div className={s.miniRow}>
            <span className={s.miniNext}>02</span>
            <div>
              <strong>Mes documents</strong>
              <span>À préparer maintenant</span>
            </div>
            <HomeIcon name="arrow" />
          </div>
          <div className={s.miniRow}>
            <span className={s.miniLater}>03</span>
            <div>
              <strong>Mes candidatures</strong>
              <span>À suivre</span>
            </div>
            <HomeIcon name="arrow" />
          </div>
        </aside>
      </div>
    </section>
  );
}
