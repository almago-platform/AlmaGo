import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeFinalCta() {
  return (
    <section className={s.finalCta} aria-labelledby="final-title">
      <div className={`${s.container} ${s.finalInner}`}>
        <div className={s.finalCopy}>
          <p className={s.eyebrow}>Commencez simplement</p>
          <h2 id="final-title">
            Commencez
            <br />
            <em>par votre projet.</em>
          </h2>
          <p>
            Créez votre dossier. Vous ajouterez vos documents et vos prochaines
            étapes ensuite.
          </p>
          <div className={s.finalProof} aria-label="Ce que votre dossier rassemble">
            <span>
              <HomeIcon name="check" /> Projet
            </span>
            <span>
              <HomeIcon name="check" /> Documents
            </span>
            <span>
              <HomeIcon name="check" /> Prochaines étapes
            </span>
          </div>
        </div>

        <div className={s.finalActions}>
          <Link className={s.button} href="/signup">
            Créer mon dossier
            <HomeIcon name="arrow" />
          </Link>
          <p>
            <Link href="/login">J’ai déjà un compte</Link>
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
              <BrandLogo variant="reverse" className={s.footerLogoImage} />
            </Link>
            <p>Votre dossier d’études, étape par étape.</p>
            <span className={s.footerIndependence}>Plateforme indépendante</span>
          </div>

          <FooterColumn
            title="Parcours"
            links={[
              ["Les six étapes", "#parcours"],
              ["Outils utiles", "#outils"],
              ["Questions fréquentes", "#faq"],
            ]}
          />

          <FooterColumn
            title="Préparer"
            links={[
              ["Mon espace", "/login"],
              ["Comparer les programmes", "#programmes"],
              ["Créer mon dossier", "/signup"],
            ]}
          />

          <FooterColumn
            title="Repères"
            links={[
              ["Se connecter", "/login"],
              ["uni-assist · source externe", "https://www.uni-assist.de/en/"],
            ]}
          />
        </div>

        <div className={s.footerBottom}>
          <p>© AlmaGo</p>
          <p>
            AlmaGo organise votre préparation. Les décisions officielles
            appartiennent aux organismes compétents.
          </p>
        </div>

        <p className={s.photoCredit}>
          Photographies d’illustration :{" "}
          <a href="https://www.pexels.com/license/">Pexels</a>. Les personnes
          représentées ne sont pas présentées comme utilisatrices d’AlmaGo.
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
