import Image from "next/image";
import Link from "next/link";
import { HomeSymbol } from "./HomeSymbol";
import s from "./CodexHome.module.css";
export function HomeHero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className={s.heroInner}>
        <div className={s.heroCopy}>
          <a href="#confiance" className={s.independent}>
            <span aria-hidden="true" />
            AlmaGo · plateforme indépendante
            <HomeSymbol name="external" />
          </a>
          <h1 id="hero-title">
            Vos études en
            <br />
            Allemagne.<span>La suite au clair.</span>
          </h1>
          <p className={s.heroLead}>
            Un espace pour organiser votre projet d’études, réunir vos documents
            et préparer vos candidatures. Avec une prochaine étape toujours
            identifiable.
          </p>
          <div className={s.heroActions}>
            <Link
              href="/signup"
              className={[s.button, s.apricotButton].join(" ")}
            >
              Créer mon dossier
              <HomeSymbol name="arrow" />
            </Link>
            <a className={s.heroLink} href="#espace">
              Explorer l’espace étudiant
              <HomeSymbol name="arrow" />
            </a>
          </div>
          <p className={s.heroNote}>
            <HomeSymbol name="check" />
            Commencez avec ce que vous savez déjà.
          </p>
        </div>
        <div className={s.heroVisual}>
          <figure className={s.heroPhoto}>
            <Image
              src="/images/homepage/codex-campus.webp"
              alt="Trois étudiants réunis autour d’un ordinateur à une table en extérieur."
              fill
              priority
              sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1100px) 43vw, 540px"
            />
            <figcaption>Le début d’un nouveau chapitre.</figcaption>
          </figure>
          <div className={s.heroCard}>
            <div className={s.heroCardTop}>
              <span>
                <HomeSymbol name="folder" />
                Mon projet d’études
              </span>
              <span className={s.exampleLabel}>Exemple</span>
            </div>
            <div className={s.heroCardBody}>
              <span className={s.actionMark}>
                <HomeSymbol name="document" />
              </span>
              <div>
                <span className={s.smallLabel}>La prochaine étape</span>
                <strong>Rassembler mes documents</strong>
                <span className={s.heroCardSub}>
                  Un point de départ concret.
                </span>
              </div>
              <a href="#espace" aria-label="Découvrir l’exemple de dossier">
                <HomeSymbol name="arrow" />
              </a>
            </div>
          </div>
          <span className={s.visualTag}>
            <HomeSymbol name="pin" />
            Votre projet, votre direction.
          </span>
        </div>
      </div>
      <div className={s.heroBottom}>
        <span>Pour les étudiants internationaux</span>
        <span>
          Projet académique
          <HomeSymbol name="arrow" />
          Candidatures
          <HomeSymbol name="arrow" />
          Préparation
        </span>
      </div>
    </section>
  );
}
