"use client";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { HomeSymbol, type SymbolName } from "./HomeSymbol";
import s from "./CodexHome.module.css";
const tabs: { id: string; label: string; icon: SymbolName }[] = [
  { id: "projet", label: "Mon projet", icon: "folder" },
  { id: "documents", label: "Mes documents", icon: "document" },
  { id: "candidatures", label: "Mes candidatures", icon: "book" },
];
export function HomeProductPreview() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % tabs.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
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
      className={[s.section, s.workspaceSection].join(" ")}
      aria-labelledby="workspace-title"
    >
      <div className={s.container}>
        <div className={s.sectionHeading}>
          <div>
            <p className={s.eyebrow}>Votre espace, en pratique</p>
            <h2 id="workspace-title" className={s.title}>
              Un projet qui avance.
              <br />
              <span>Un dossier qui suit.</span>
            </h2>
          </div>
          <p className={s.lead}>
            Moins de notes éparpillées, plus de visibilité. Retrouvez les
            informations qui comptent, au même endroit.
          </p>
        </div>
        <div className={s.workspace}>
          <div className={s.workspaceBar}>
            <span>
              <span className={s.miniLogo}>A</span>Votre espace AlmaGo
            </span>
            <span className={s.exampleLabel}>Démonstration</span>
          </div>
          <div className={s.workspaceBody}>
            <div className={s.workspaceSide}>
              <p className={s.smallLabel}>Mon dossier</p>
              <div
                role="tablist"
                aria-label="Explorer la démonstration du dossier"
                aria-orientation="vertical"
                className={s.workspaceTabs}
              >
                {tabs.map((tab, index) => (
                  <button
                    ref={(node) => {
                      buttons.current[index] = node;
                    }}
                    key={tab.id}
                    id={"demo-tab-" + tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active === index}
                    aria-controls={"demo-panel-" + tab.id}
                    tabIndex={active === index ? 0 : -1}
                    onClick={() => setActive(index)}
                    onKeyDown={(event) => move(event, index)}
                  >
                    <HomeSymbol name={tab.icon} />
                    <span>{tab.label}</span>
                    <HomeSymbol name="arrow" />
                  </button>
                ))}
              </div>
              <p className={s.sidebarNote}>
                <HomeSymbol name="shield" />
                Un aperçu illustratif.
                <br />
                Vos informations restent liées à votre situation.
              </p>
            </div>
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                id={"demo-panel-" + tab.id}
                role="tabpanel"
                aria-labelledby={"demo-tab-" + tab.id}
                tabIndex={0}
                hidden={active !== index}
                className={s.workspacePanel}
              >
                {index === 0 && (
                  <>
                    <div className={s.panelHeading}>
                      <div>
                        <p className={s.smallLabel}>Vue de mon projet</p>
                        <h3>Un point de départ. Une direction.</h3>
                      </div>
                      <span className={s.status}>En préparation</span>
                    </div>
                    <div className={s.projectFields}>
                      <div>
                        <span>Destination</span>
                        <strong>Allemagne</strong>
                      </div>
                      <div>
                        <span>Diplôme envisagé · exemple</span>
                        <strong>Master</strong>
                      </div>
                      <div>
                        <span>Domaine</span>
                        <strong>À préciser</strong>
                      </div>
                    </div>
                    <div className={s.nextAction}>
                      <span className={s.actionMark}>
                        <HomeSymbol name="arrow" />
                      </span>
                      <div>
                        <p className={s.smallLabel}>
                          Prochaine action · exemple
                        </p>
                        <h4>Rassembler vos justificatifs académiques</h4>
                        <p>
                          Préparez vos diplômes et relevés de notes pour
                          préciser la suite de votre parcours.
                        </p>
                      </div>
                    </div>
                    <div className={s.panelRows}>
                      <div>
                        <HomeSymbol name="check" />
                        <span>Les premiers repères de votre projet</span>
                        <span className={s.rowStatus}>Renseignés</span>
                      </div>
                      <div>
                        <HomeSymbol name="clock" />
                        <span>Les exigences des programmes</span>
                        <span className={s.rowStatus}>À examiner</span>
                      </div>
                    </div>
                  </>
                )}
                {index === 1 && (
                  <>
                    <div className={s.panelHeading}>
                      <div>
                        <p className={s.smallLabel}>Mes pièces académiques</p>
                        <h3>Chaque document trouve sa place.</h3>
                      </div>
                    </div>
                    <p className={s.panelIntro}>
                      Distinguez les pièces déjà ajoutées de celles qu’il vous
                      reste à réunir.
                    </p>
                    <div className={s.documentRows}>
                      {[
                        ["Diplôme", "Ajouté"],
                        ["Relevé de notes", "À rassembler"],
                        ["Justificatif de langue", "À examiner"],
                      ].map(([label, status], index) => (
                        <div key={label}>
                          <span className={s.fileIcon}>
                            <HomeSymbol name="document" />
                          </span>
                          <div>
                            <strong>{label}</strong>
                            <span>
                              {index === 0
                                ? "Exemple de pièce enregistrée"
                                : "Selon votre parcours et le programme"}
                            </span>
                          </div>
                          <span
                            className={
                              index === 0 ? s.readyStatus : s.pendingStatus
                            }
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className={s.panelNote}>
                      <HomeSymbol name="shield" />« Ajouté » ne signifie pas «
                      accepté » par une université.
                    </p>
                  </>
                )}
                {index === 2 && (
                  <>
                    <div className={s.panelHeading}>
                      <div>
                        <p className={s.smallLabel}>Mes candidatures</p>
                        <h3>Voir ce qui reste à préparer.</h3>
                      </div>
                    </div>
                    <div className={s.application}>
                      <div>
                        <HomeSymbol name="book" />
                        <span>
                          <strong>Programme à explorer</strong>
                          <span>
                            Exemple fictif · aucun établissement associé
                          </span>
                        </span>
                        <span className={s.status}>À examiner</span>
                      </div>
                      <dl>
                        <div>
                          <dt>Critères d’accès</dt>
                          <dd>À confirmer à la source</dd>
                        </div>
                        <div>
                          <dt>Échéance</dt>
                          <dd>À vérifier</dd>
                        </div>
                        <div>
                          <dt>Pièces demandées</dt>
                          <dd>À rassembler</dd>
                        </div>
                      </dl>
                    </div>
                    <p className={s.panelNote}>
                      <HomeSymbol name="shield" />
                      Le suivi organise votre préparation. Il ne transmet pas
                      une candidature et ne prédit pas l’admission.
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className={s.workspaceFoot}>
            <span>Données fictives · Aucun dossier réel affiché</span>
            <Link href="/signup">
              Créer mon propre dossier
              <HomeSymbol name="arrow" />
            </Link>
          </div>
        </div>
        <div className={s.benefits}>
          <div>
            <span>01</span>
            <h3>Tout relier.</h3>
            <p>
              Votre profil, vos documents et vos candidatures partagent le même
              contexte.
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>Voir la prochaine action.</h3>
            <p>
              Les éléments à compléter restent visibles, sans confondre
              préparation et décision.
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>Reprendre facilement.</h3>
            <p>Retrouvez vos repères lorsque vous revenez à votre projet.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
