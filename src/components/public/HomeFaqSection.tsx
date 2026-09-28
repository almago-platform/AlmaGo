import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const faqs = [
  [
    "Puis-je commencer sans admission ?",
    "Oui. Commencez par votre projet et les documents que vous avez. Cherchez ensuite une admission adaptée avant les démarches qui en dépendent.",
  ],
  [
    "Que vais-je retrouver dans mon espace ?",
    "Votre projet, vos documents, vos programmes, vos candidatures et vos prochaines étapes.",
  ],
  [
    "AlmaGo dépose-t-il mes candidatures ?",
    "Non. AlmaGo vous aide à préparer et suivre vos candidatures. Vous les envoyez par le canal demandé par l’université, par exemple directement ou via uni-assist.",
  ],
  [
    "Les informations sont-elles officielles ?",
    "AlmaGo indique la source et la date de contrôle quand elles sont disponibles. Vérifiez toujours la source officielle avant une démarche.",
  ],
  [
    "AlmaGo garantit-il une admission ou un visa ?",
    "Non. AlmaGo organise votre préparation. Les universités, ambassades et autorités prennent les décisions.",
  ],
] as const;

export function HomeFaqSection() {
  return (
    <section
      id="faq"
      className={`${s.section} ${s.faq}`}
      aria-labelledby="faq-title"
    >
      <div className={`${s.container} ${s.faqGrid}`}>
        <div className={s.faqIntro}>
          <p className={s.eyebrow}>Questions utiles</p>
          <h2 id="faq-title" className={s.sectionTitle}>
            Avant de faire
            <br />
            <em>le premier pas.</em>
          </h2>
          <p className={s.lead}>
            Les réponses aux questions les plus fréquentes.
          </p>
          <a className={s.textLink} href="#parcours">
            Voir les étapes
            <HomeIcon name="arrow" />
          </a>
        </div>
        <div className={s.faqList}>
          {faqs.map(([question, answer], i) => (
            <details key={question} open={i === 0}>
              <summary>
                <span>{question}</span>
                <HomeIcon name="plus" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
