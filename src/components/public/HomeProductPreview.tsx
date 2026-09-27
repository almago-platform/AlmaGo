"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { HomeIcon, type HomeIconName } from "./HomeIcons";
import s from "./Homepage.module.css";

const tabs = ["Vue d’ensemble", "Documents", "Candidatures"] as const;
const benefits = [
  [
    "01",
    "Tout retrouver au même endroit.",
    "Votre profil, vos pièces et vos candidatures restent reliés à votre projet.",
  ],
  [
    "02",
    "Savoir ce qui mérite votre attention.",
    "Les éléments connus, ceux qui manquent et les prochaines actions sont distingués.",
  ],
  [
    "03",
    "Garder le fil, à votre rythme.",
    "Vous retrouvez le contexte de votre dossier quand vous reprenez vos démarches.",
  ],
] as const;

export function HomeProductPreview() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }
  return (
    <section
      id="espace"
      className={`${s.section} ${s.product}`}
      aria-labelledby="product-title"
    >
      <div className={`${s.container} ${s.productGrid}`}>
        <div className={s.productCopy}>
          <p className={s.eyebrow}>Pourquoi AlmaGo</p>
          <h2 id="product-title" className={s.sectionTitle}>
            Moins d’onglets.
            <br />
            <em>Plus de clarté.</em>
          </h2>
          <p className={s.lead}>
            Votre projet ne devrait pas se perdre entre une note, un e-mail et
            un document. AlmaGo rassemble l’essentiel et met la prochaine
            action en évidence.
          </p>
          <ol className={s.productBenefits}>
            {benefits.map(([n, title, text]) => (
              <li key={n}>
                <span className={s.productBenefitNumber}>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={s.productAssurance}>
            <HomeIcon name="source" />
            <span>
              Votre espace organise la préparation. Les décisions officielles
              restent aux organismes compétents.
            </span>
          </div>
        </div>

        <div className={s.productStage}>
          <div className={s.productStageHead}>
            <div>
              <span className={s.productStageKicker}>Démonstration interactive</span>
              <strong>Votre dossier, en un coup d’œil.</strong>
            </div>
            <span className={s.productStageBadge}>Données fictives</span>
          </div>

          <div className={s.productFrame}>
          <div className={s.previewTop}>
            <div>
              <span className={s.previewLogo}><BrandLogo symbolOnly className={s.previewLogoImage} /></span>
              <strong>Votre espace AlmaGo</strong>
            </div>
            <span className={s.sample}>Démonstration</span>
          </div>
          <div
            className={s.previewTabs}
            role="tablist"
            aria-label="Explorer l’exemple de dossier"
          >
            {tabs.map((tab, i) => (
              <button
                key={tab}
                ref={(element) => {
                  buttons.current[i] = element;
                }}
                id={`preview-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-controls={`preview-panel-${i}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(event) => navigate(event, i)}
              >
                {tab}
              </button>
            ))}
          </div>
          {tabs.map((tab, i) => (
            <div
              key={tab}
              role="tabpanel"
              id={`preview-panel-${i}`}
              aria-labelledby={`preview-tab-${i}`}
              hidden={active !== i}
              tabIndex={0}
              className={s.previewPanel}
            >
              {i === 0 ? (
                <>
                  <div className={s.previewHeading}>
                    <div>
                      <p className={s.overline}>Mon projet d’études</p>
                      <h3>Une vue claire pour avancer.</h3>
                    </div>
                    <span className={s.projectStatus}>En préparation</span>
                  </div>
                  <div className={s.nextAction}>
                    <span className={s.actionIcon}>
                      <HomeIcon name="arrow" />
                    </span>
                    <div>
                      <p className={s.overline}>Prochaine action · Exemple</p>
                      <h4>Ajouter votre relevé de notes</h4>
                      <p>
                        Rassemblez les pièces utiles à l’examen de votre
                        parcours.
                      </p>
                    </div>
                  </div>
                  <div className={s.dossierRows}>
                    <DemoRow
                      icon="check"
                      title="Projet académique"
                      detail="Diplôme, domaine et rentrée"
                      status="Renseigné"
                      ready
                    />
                    <DemoRow
                      icon="document"
                      title="Documents"
                      detail="Les pièces de votre dossier"
                      status="À compléter"
                    />
                    <DemoRow
                      icon="book"
                      title="Programmes"
                      detail="Des pistes à examiner"
                      status="À explorer"
                    />
                  </div>
                  <div className={s.previewNote}>
                    <HomeIcon name="clock" />
                    <span>
                      Une étape enregistrée décrit votre préparation, pas une
                      chance d’admission.
                    </span>
                  </div>
                </>
              ) : i === 1 ? (
                <>
                  <div className={s.previewHeading}>
                    <div>
                      <p className={s.overline}>Mes documents</p>
                      <h3>Chaque pièce à sa place.</h3>
                    </div>
                  </div>
                  <p className={s.panelIntro}>
                    L’exemple distingue un document ajouté d’une pièce encore à
                    rassembler.
                  </p>
                  <div className={s.dossierRows}>
                    <DemoRow
                      icon="document"
                      title="Diplôme"
                      detail="Pièce enregistrée dans le dossier"
                      status="Ajouté"
                      ready
                    />
                    <DemoRow
                      icon="document"
                      title="Relevé de notes"
                      detail="La prochaine pièce à rassembler"
                      status="À ajouter"
                    />
                    <DemoRow
                      icon="document"
                      title="Justificatif de langue"
                      detail="Selon les exigences du programme"
                      status="À examiner"
                    />
                  </div>
                  <div className={s.previewNote}>
                    <HomeIcon name="source" />
                    <span>
                      « Ajouté » ne signifie pas « accepté » par une université.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={s.previewHeading}>
                    <div>
                      <p className={s.overline}>Mes candidatures</p>
                      <h3>Ne perdez plus le fil.</h3>
                    </div>
                  </div>
                  <div className={s.applicationExample}>
                    <span className={s.projectStatus}>
                      Exemple de candidature
                    </span>
                    <h4>Votre programme sélectionné</h4>
                    <dl>
                      <div>
                        <dt>Statut</dt>
                        <dd>En préparation</dd>
                      </div>
                      <div>
                        <dt>Prochaine action</dt>
                        <dd>Vérifier les pièces demandées</dd>
                      </div>
                      <div>
                        <dt>Échéance</dt>
                        <dd>À confirmer à la source</dd>
                      </div>
                      <div>
                        <dt>Décision d’admission</dt>
                        <dd>Université concernée</dd>
                      </div>
                    </dl>
                  </div>
                  <div className={s.previewNote}>
                    <HomeIcon name="source" />
                    <span>
                      La candidature officielle suit le canal demandé par
                      l’établissement.
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
          <p className={s.previewCaption}>
            Aperçu illustratif · Données fictives · Votre dossier dépend de
            votre situation.
          </p>
          </div>

          <div className={s.productStageFoot}>
            <span>
              <HomeIcon name="check" /> Projet
            </span>
            <span>
              <HomeIcon name="document" /> Documents
            </span>
            <span>
              <HomeIcon name="route" /> Candidatures
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoRow({
  icon,
  title,
  detail,
  status,
  ready = false,
}: {
  icon: HomeIconName;
  title: string;
  detail: string;
  status: string;
  ready?: boolean;
}) {
  return (
    <div className={s.dossierRow}>
      <span className={s.rowIcon}>
        <HomeIcon name={icon} />
      </span>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <span className={ready ? s.statusReady : s.statusPending}>{status}</span>
    </div>
  );
}
