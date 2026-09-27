import { HomeSymbol, type SymbolName } from "./HomeSymbol";
import s from "./CodexHome.module.css";
const links: {
  name: string;
  detail: string;
  href: string;
  icon: SymbolName;
}[] = [
  {
    name: "Votre espace",
    detail: "Voir le dossier en pratique",
    href: "#espace",
    icon: "folder",
  },
  {
    name: "Votre parcours",
    detail: "Comprendre les six étapes",
    href: "#parcours",
    icon: "route",
  },
  {
    name: "Des repères fiables",
    detail: "Sources et responsabilités",
    href: "#confiance",
    icon: "shield",
  },
  {
    name: "Vos questions",
    detail: "Les réponses pour commencer",
    href: "#faq",
    icon: "book",
  },
];
export function HomeQuickAccess() {
  return (
    <nav
      className={[s.container, s.quick].join(" ")}
      aria-label="Accès rapides"
    >
      {links.map((link) => (
        <a key={link.href} href={link.href}>
          <HomeSymbol name={link.icon} />
          <span>
            <strong>{link.name}</strong>
            <span>{link.detail}</span>
          </span>
          <HomeSymbol name="arrow" className={s.quickArrow} />
        </a>
      ))}
    </nav>
  );
}
