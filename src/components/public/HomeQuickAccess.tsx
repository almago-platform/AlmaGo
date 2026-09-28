import { HomeIcon } from "./HomeIcons";
import s from "./Homepage.module.css";

const items = [
  {
    href: "#programmes",
    title: "Trouver un programme",
    detail: "Programmes et critères",
    icon: "book",
  },
  {
    href: "#parcours",
    title: "Voir les étapes",
    detail: "Ce qu’il faut faire",
    icon: "route",
  },
  {
    href: "#parcours",
    title: "Préparer mes documents",
    detail: "Documents à ajouter",
    icon: "document",
  },
  {
    href: "#parcours",
    title: "Préparer mon départ",
    detail: "Langue, financement, assurance",
    icon: "source",
  },
  {
    href: "#faq",
    title: "Voir les questions",
    detail: "Réponses utiles",
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
