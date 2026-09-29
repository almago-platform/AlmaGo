import type { getNativeCopy } from "@/content/native-copy";
import { HomeIcon, type HomeIconName } from "./HomeIcons";
import s from "./Homepage.module.css";

type ToolsCopy = ReturnType<typeof getNativeCopy>["home"]["tools"];

const meta: Array<{ href: string; icon: HomeIconName }> = [
  { href: "/signup", icon: "profile" },
  { href: "#programmes", icon: "university" },
  { href: "#faq", icon: "source" },
];

export function HomeTrustSection({ tools }: { tools: ToolsCopy }) {
  return (
    <section id="outils" className={`${s.section} ${s.helpfulTools}`} aria-labelledby="helpful-tools-title">
      <div className={s.container}>
        <div className={s.helpfulToolsHeading}>
          <p className={s.eyebrow}>{tools.eyebrow}</p>
          <h2 id="helpful-tools-title">{tools.title}</h2>
          <p>{tools.intro}</p>
        </div>

        <div className={s.helpfulToolsGrid}>
          {tools.items.map(([title, text, cta], index) => (
            <a className={s.helpfulToolCard} href={meta[index].href} key={title}>
              <span className={s.helpfulToolIcon} aria-hidden="true">
                <HomeIcon name={meta[index].icon} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className={s.helpfulToolAction}>
                {cta}
                <HomeIcon name="arrow" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
