import Link from "next/link";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeFinalCta() {
  return (
    <section className={s.finalCta} aria-labelledby="final-title">
      <div className={`${s.container} ${s.finalInner}`}>
        <div>
          <p className={s.eyebrow}>À vous d’écrire la suite</p>
          <h2 id="final-title">
            Votre projet mérite
            <br />
            <em>un point de départ clair.</em>
          </h2>
          <p>
            Un dossier pour rassembler vos idées, vos documents et votre
            prochaine étape.
          </p>
        </div>
        <div className={s.finalActions}>
          <Link className={s.button} href="/signup">
            Créer mon dossier
            <HomeIcon name="arrow" />
          </Link>
          <p>
            Déjà un espace ? <Link href="/login">Me connecter</Link>
          </p>
        </div>
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
            <Link href="/" className={s.logo} aria-label="AlmaGo accueil">
              <span className={s.logoMark}>A</span>
              <span>
                AlmaGo
                <span className={s.logoSubtitle}>Études en Allemagne</span>
              </span>
            </Link>
            <p>
              Un espace pour votre projet.
              <br />
              Des repères pour avancer.
            </p>
          </div>
          <FooterColumn
            title="Découvrir"
            links={[
              ["Le parcours en six étapes", "#parcours"],
              ["L’espace étudiant", "#espace"],
              ["Explorer les programmes", "#programmes"],
            ]}
          />
          <FooterColumn
            title="Comprendre"
            links={[
              ["Sources et responsabilités", "#confiance"],
              ["Questions fréquentes", "#faq"],
              ["uni-assist · source externe", "https://www.uni-assist.de/en/"],
            ]}
          />
          <FooterColumn
            title="Mon espace"
            links={[
              ["Créer mon dossier", "/signup"],
              ["Me connecter", "/login"],
            ]}
          />
        </div>
        <div className={s.footerBottom}>
          <p>© AlmaGo · Plateforme indépendante</p>
          <p>
            Les décisions officielles appartiennent aux organismes compétents.
          </p>
        </div>
        <p className={s.photoCredit}>
          Photographie d’illustration :{" "}
          <a href="https://www.pexels.com/photo/college-students-studying-in-a-library-7777713/">
            Mikhail Nilov / Pexels
          </a>
          . Les personnes représentées ne sont pas présentées comme
          utilisatrices d’AlmaGo.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <nav aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
