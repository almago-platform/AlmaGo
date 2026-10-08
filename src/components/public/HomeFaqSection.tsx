import type { getNativeCopy } from "@/content/native-copy";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

type FaqCopy = ReturnType<typeof getNativeCopy>["home"]["faq"];
type ExtraQuestions = readonly (readonly [string, string])[];

export function HomeFaqSection({ faq, extraQuestions = [] }: { faq: FaqCopy; extraQuestions?: ExtraQuestions }) {
  return (
    <section id="faq" className={`${s.section} ${s.faq}`} aria-labelledby="faq-title">
      <div className={`${s.container} ${s.faqGrid}`}>
        <div className={s.faqIntro}>
          <p className={s.eyebrow}>{faq.eyebrow}</p>
          <h2 id="faq-title" className={s.sectionTitle}>
            {faq.title1}
            <br />
            <em>{faq.title2}</em>
          </h2>
          <p className={s.lead}>{faq.intro}</p>
          <a className={s.textLink} href="#parcours">
            {faq.cta}
            <HomeIcon name="arrow" />
          </a>
        </div>
        <div className={s.faqList}>
          {[...extraQuestions, ...faq.items].map(([question, answer], index) => (
            <details key={question} open={index === 0}>
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
