import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

export function HomeTrustSection() {
  return (
    <section
      id="confiance"
      className={`${s.section} ${s.trust}`}
      aria-labelledby="trust-title"
    >
      <div className={`${s.container} ${s.trustGrid}`}>
        <div>
          <p className={s.eyebrow}>La confiance se construit</p>
          <h2 id="trust-title" className={s.sectionTitle}>
            Des sources visibles.
            <br />
            <em>Des rôles clairs.</em>
          </h2>
          <p className={s.lead}>
            Comprendre d’où vient une information est aussi important que
            l’information elle-même.
          </p>
          <div className={s.trustStatement}>
            <HomeIcon name="source" />
            <p>
              <strong>AlmaGo est une plateforme indépendante.</strong> Elle
              organise votre dossier. Elle ne représente ni une université, ni
              uni-assist, ni une ambassade. Les admissions, visas et titres de
              séjour sont décidés par les organismes compétents.
            </p>
          </div>
        </div>
        <div className={s.sourceCard}>
          <div className={s.sourceCardTop}>
            <HomeIcon name="document" />
            <span>Les repères d’une information</span>
          </div>
          <dl>
            <div>
              <dt>Sa provenance</dt>
              <dd>
                Une source identifiable, à consulter pour confirmer les
                exigences.
              </dd>
            </div>
            <div>
              <dt>Sa date de contrôle</dt>
              <dd>
                Lorsqu’une fiche est vérifiée, la date permet de situer
                l’information.
              </dd>
            </div>
            <div>
              <dt>Son statut</dt>
              <dd>
                Une piste, un élément confirmé ou une information à revalider.
              </dd>
            </div>
            <div>
              <dt>Qui décide</dt>
              <dd>
                L’organisme responsable de la règle ou de la décision
                officielle.
              </dd>
            </div>
          </dl>
          <div className={s.sourceLinks}>
            <p>Retrouver une source officielle</p>
            <a href="https://www.uni-assist.de/en/">
              uni-assist
              <HomeIcon name="external" />
            </a>
            <span>Référence externe, sans affiliation à AlmaGo.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
