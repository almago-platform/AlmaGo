import type { getNativeCopy } from "@/content/native-copy";
import { HomeIcon, type HomeIconName } from "./HomeIcons";
import s from "./Homepage.module.css";

type QuickCopy = ReturnType<typeof getNativeCopy>["home"]["quick"];

// A concise navigation choice; the full six-step route is shown below.
const shortcuts: ReadonlyArray<{ index: number; href: string; icon: HomeIconName }> = [
  { index: 1, href: "#parcours", icon: "route" },
  { index: 0, href: "#programmes", icon: "book" },
  { index: 4, href: "#faq", icon: "question" },
];

export function HomeQuickAccess({ quick }: { quick: QuickCopy }) {
  return (
    <section className={s.quick} aria-label={quick.aria}>
      <div className={`${s.container} ${s.quickImmersive}`}>
        <nav aria-label={quick.navAria} className={s.quickLinks}>
          {shortcuts.map(({ index, href, icon }) => {
            const [title, detail] = quick.items[index];
            return (
              <a href={href} key={href}>
                <HomeIcon name={icon} />
                <span className={s.quickCopy}>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
                <HomeIcon name="arrow" className={s.quickArrow} />
              </a>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
