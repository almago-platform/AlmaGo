import type { getNativeCopy } from "@/content/native-copy";
import { HomeIcon, type HomeIconName } from "./HomeIcons";
import s from "./Homepage.module.css";

type QuickCopy = ReturnType<typeof getNativeCopy>["home"]["quick"];

const meta: Array<{ href: string; icon: HomeIconName }> = [
  { href: "#programmes", icon: "book" },
  { href: "#parcours", icon: "route" },
  { href: "#documents", icon: "document" },
  { href: "#depart", icon: "globe" },
  { href: "#faq", icon: "question" },
];

export function HomeQuickAccess({ quick }: { quick: QuickCopy }) {
  return (
    <section className={s.quick} aria-label={quick.aria}>
      <div className={`${s.container} ${s.quickImmersive}`}>
        <nav aria-label={quick.navAria} className={s.quickLinks}>
          {quick.items.map(([title, detail], index) => (
            <a href={meta[index].href} key={title}>
              <HomeIcon name={meta[index].icon} />
              <span className={s.quickCopy}>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
              <HomeIcon name="arrow" className={s.quickArrow} />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
