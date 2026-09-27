import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const items = [
  {
    href: "#programmes",
    title: "Découvrir les programmes",
    detail: "Licences, Masters, écoles",
    icon: "book",
  },
  {
    href: "#parcours",
    title: "Comprendre la procédure",
    detail: "Étapes et conseils",
    icon: "route",
  },
  {
    href: "#espace",
    title: "Préparer mes documents",
    detail: "Listes et suivi",
    icon: "document",
  },
  {
    href: "#parcours",
    title: "Organiser ma préparation",
    detail: "Langue, financement, assurance",
    icon: "source",
  },
  {
    href: "#faq",
    title: "Nos réponses à vos questions",
    detail: "FAQ",
    icon: "plus",
  },
] as const;

export function HomeQuickAccess() {
  return (
    <section className={s.quick} aria-label="Accès rapides">
      <div className={`${s.container} ${s.quickImmersive}`}>
        <nav aria-label="Accès rapide" className={s.quickLinks}>
          {items.map((item) => (
            <a href={item.href} key={item.title}>
              <HomeIcon name={item.icon} />
              <span className={s.quickCopy}>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
              <HomeIcon name="arrow" className={s.quickArrow} />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
