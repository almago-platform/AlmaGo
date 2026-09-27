import Link from "next/link";
import { HomeSymbol } from "./HomeSymbol";
import s from "./CodexHome.module.css";
export function HomeFinalCta() {
  return (
    <section
      className={[s.container, s.finalCta].join(" ")}
      aria-labelledby="final-title"
    >
      <div>
        <p className={s.eyebrow}>Votre prochain pas</p>
        <h2 id="final-title">
          Un projet en tête.
          <br />
          <span>Un dossier pour avancer.</span>
        </h2>
        <p>
          Posez les premiers repères aujourd’hui. Construisez la suite à votre
          rythme.
        </p>
      </div>
      <div className={s.finalActions}>
        <Link href="/signup" className={[s.button, s.apricotButton].join(" ")}>
          Créer mon dossier
          <HomeSymbol name="arrow" />
        </Link>
        <Link href="/login">
          J’ai déjà un espace
          <HomeSymbol name="arrow" />
        </Link>
      </div>
    </section>
  );
}
export function HomeFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footerGrid}>
          <div className={s.footerBrand}>
            <Link href="/" className={s.logo} aria-label="AlmaGo, accueil">
              <span className={s.logoMark}>A</span>
              <span>
                AlmaGo<span className={s.logoSub}>Études en Allemagne</span>
              </span>
            </Link>
            <p>
              Votre avenir se prépare.
              <br />
              Un repère après l’autre.
            </p>
          </div>
          <nav aria-label="Découvrir AlmaGo">
            <h2>Découvrir</h2>
            <a href="#espace">L’espace étudiant</a>
            <a href="#parcours">Le parcours en six étapes</a>
            <a href="#programmes">Explorer les programmes</a>
          </nav>
          <nav aria-label="Comprendre AlmaGo">
            <h2>Comprendre</h2>
            <a href="#confiance">Sources et responsabilités</a>
            <a href="#faq">Questions fréquentes</a>
            <a href="https://www.uni-assist.de/en/">
              uni-assist · site externe
              <HomeSymbol name="external" />
            </a>
          </nav>
          <nav aria-label="Votre compte">
            <h2>Votre espace</h2>
            <Link href="/signup">Créer mon dossier</Link>
            <Link href="/login">Me connecter</Link>
          </nav>
        </div>
        <div className={s.footerBottom}>
          <p>© AlmaGo · Plateforme indépendante</p>
          <p>Les décisions officielles restent aux organismes compétents.</p>
        </div>
        <p className={s.photoCredit}>
          Photographie d’illustration :{" "}
          <a href="https://www.pexels.com/photo/students-studying-on-laptop-outdoors-together-7972949/">
            George Pak / Pexels
          </a>
          . Les personnes représentées ne sont pas présentées comme
          utilisatrices d’AlmaGo.
        </p>
      </div>
    </footer>
  );
}
