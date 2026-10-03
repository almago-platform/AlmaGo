import type { getNativeCopy } from "@/content/native-copy";
import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

type FaqCopy = ReturnType<typeof getNativeCopy>["home"]["faq"];

export function HomeFaqSection({ faq }: { faq: FaqCopy }) {
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
          {faq.items.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                <span className={s.faqQuestion}>
                  <span className={s.faqNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{question}</span>
                </span>
                <span className={s.faqToggle} aria-hidden="true">
                  <HomeIcon name="plus" />
                </span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
