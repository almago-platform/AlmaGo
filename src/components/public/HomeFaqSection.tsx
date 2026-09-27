import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const faqs = [
  [
    "Puis-je commencer sans avoir d’admission ?",
    "Oui. Commencez par définir votre projet et réunir les documents dont vous disposez. La recherche d’une base académique adaptée vient avant les démarches qui en dépendent.",
  ],
  [
    "Que vais-je retrouver dans mon espace ?",
    "Votre profil, vos documents, les pistes de programmes et vos candidatures. Le dossier relie aussi la préparation linguistique, le financement, l’assurance et les prochaines démarches selon votre situation.",
  ],
  [
    "AlmaGo envoie-t-il ma candidature à ma place ?",
    "L’espace vous aide à préparer et suivre vos candidatures. Leur envoi officiel reste à effectuer selon le canal demandé par l’établissement : candidature directe, uni-assist ou autre procédure indiquée.",
  ],
  [
    "Les informations sont-elles toutes officielles ?",
    "Non. AlmaGo distingue les informations de votre dossier des sources externes. Une fiche vérifiée conserve sa source et sa date de contrôle ; les informations anciennes doivent être revalidées. La source officielle reste la référence.",
  ],
  [
    "AlmaGo garantit-il une admission ou un visa ?",
    "Non. AlmaGo vous aide à organiser votre préparation, sans garantir de résultat. Les décisions appartiennent aux universités, ambassades et autorités compétentes.",
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
        <div>
          <p className={s.eyebrow}>Vos premières questions</p>
          <h2 id="faq-title" className={s.sectionTitle}>
            Avant de faire
            <br />
            <em>le premier pas.</em>
          </h2>
          <p className={s.lead}>
            Vous pouvez commencer avec ce que vous savez déjà.
          </p>
          <a className={s.textLink} href="#parcours">
            Revoir les six étapes
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
