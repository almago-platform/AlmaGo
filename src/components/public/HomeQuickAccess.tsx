"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { HomeIcon, type HomeIconName } from "./HomeIcons";
import s from "./Homepage.module.css";

const meta: Array<{ href: string; icon: HomeIconName }> = [
  { href: "#programmes", icon: "book" },
  { href: "#parcours", icon: "route" },
  { href: "#parcours", icon: "document" },
  { href: "#parcours", icon: "source" },
  { href: "#faq", icon: "plus" },
];

export function HomeQuickAccess() {
  const { copy } = useLocale();
  const quick = copy.home.quick;

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
