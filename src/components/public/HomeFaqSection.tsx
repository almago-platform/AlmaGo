import { HomeSymbol } from "./HomeSymbol";
import s from "./CodexHome.module.css";
const questions = [
  [
    "Puis-je commencer sans avoir choisi d’université ?",
    "Oui. Commencez par votre diplôme visé, votre domaine et vos besoins linguistiques. Vous pourrez ensuite examiner les programmes et préciser votre projet.",
  ],
  [
    "Qu’est-ce que je retrouve dans mon dossier ?",
    "Votre projet académique, vos documents, vos pistes de programmes, vos candidatures et les actions utiles à votre préparation. Les informations sont reliées pour vous aider à garder le fil.",
  ],
  [
    "AlmaGo envoie-t-il mes candidatures ?",
    "Le dossier AlmaGo organise votre préparation et votre suivi. Il ne remplace pas les démarches demandées sur les portails des universités ou de leurs organismes de candidature.",
  ],
  [
    "Comment vérifier une information ?",
    "Consultez sa source, son statut et sa date de contrôle lorsqu’elle est indiquée. Confirmez toujours une exigence ou une échéance auprès de l’organisme responsable.",
  ],
  [
    "AlmaGo garantit-il une admission ou un visa ?",
    "Non. AlmaGo vous aide à structurer votre dossier, sans garantir de résultat. Les décisions appartiennent aux universités, ambassades et autorités compétentes.",
  ],
] as const;
export function HomeFaqSection() {
  return (
    <section
      id="faq"
      className={[s.section, s.faq].join(" ")}
      aria-labelledby="faq-title"
    >
      <div className={[s.container, s.faqGrid].join(" ")}>
        <div>
          <p className={s.eyebrow}>Avant de vous lancer</p>
          <h2 id="faq-title" className={s.title}>
            Des questions ?<br />
            <span>C’est normal.</span>
          </h2>
          <p className={s.lead}>
            Quelques réponses pour commencer avec des repères clairs.
          </p>
          <a className={s.textLink} href="#parcours">
            Revoir le parcours
            <HomeSymbol name="arrow" />
          </a>
        </div>
        <div className={s.faqList}>
          {questions.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                <span>{question}</span>
                <HomeSymbol name="plus" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
