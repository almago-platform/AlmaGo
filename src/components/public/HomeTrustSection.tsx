import { HomeSymbol } from "./HomeSymbol";
import s from "./CodexHome.module.css";
export function HomeTrustSection() {
  return (
    <section
      id="confiance"
      className={[s.section, s.trust].join(" ")}
      aria-labelledby="trust-title"
    >
      <div className={s.container}>
        <div className={s.trustGrid}>
          <div>
            <p className={s.eyebrow}>La clarté, aussi sur notre rôle</p>
            <h2 id="trust-title" className={s.title}>
              Vous accompagner
              <br />
              <span>sans vous promettre l’impossible.</span>
            </h2>
            <p className={s.lead}>
              AlmaGo est une plateforme indépendante pour organiser votre
              préparation. Les universités et les autorités compétentes prennent
              les décisions officielles.
            </p>
            <p className={s.trustStatement}>
              <HomeSymbol name="shield" />
              Aucune garantie d’admission, de visa ou de titre de séjour.
            </p>
          </div>
          <div className={s.sourcePanel}>
            <p className={s.sourceHeading}>
              <HomeSymbol name="document" />
              Les bons réflexes pour une information
            </p>
            <dl>
              <div>
                <dt>Une source identifiable</dt>
                <dd>Consulter l’organisme à l’origine de l’information.</dd>
              </div>
              <div>
                <dt>Une date de vérification</dt>
                <dd>
                  Situer un contrôle lorsqu’il existe et revalider les
                  informations anciennes.
                </dd>
              </div>
              <div>
                <dt>Un statut explicite</dt>
                <dd>
                  Distinguer ce qui est connu, à examiner ou encore en attente.
                </dd>
              </div>
              <div>
                <dt>Un responsable clair</dt>
                <dd>
                  Identifier qui doit agir et qui peut prendre la décision.
                </dd>
              </div>
            </dl>
            <a href="https://www.uni-assist.de/en/" className={s.sourceLink}>
              Consulter uni-assist
              <HomeSymbol name="external" />
            </a>
            <p className={s.sourceDisclaimer}>
              Source externe. AlmaGo n’est ni uni-assist, ni une université, ni
              une ambassade et ne prétend à aucune affiliation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
