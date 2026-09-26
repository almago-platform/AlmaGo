import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const items = [
  { href: "#parcours", title: "Comprendre les étapes", icon: "route" },
  { href: "#espace", title: "Découvrir mon dossier", icon: "folder" },
  { href: "#programmes", title: "Repérer les programmes", icon: "book" },
  { href: "#confiance", title: "Identifier les sources", icon: "source" },
] as const;

export function HomeQuickAccess() {
  return (
    <section className={s.quick} aria-labelledby="quick-title">
      <div className={`${s.container} ${s.quickInner}`}>
        <div className={s.quickIntro}>
          <p className={s.eyebrow}>À votre rythme</p>
          <h2 id="quick-title">
            Par où <br />
            commencer ?
          </h2>
        </div>
        <nav aria-label="Accès rapide" className={s.quickLinks}>
          {items.map((item) => (
            <a href={item.href} key={item.href}>
              <HomeIcon name={item.icon} />
              <span>{item.title}</span>
              <HomeIcon name="arrow" className={s.quickArrow} />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
