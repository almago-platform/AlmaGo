import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

type AuthStoryPanelProps = {
  mode: "login" | "signup";
};

const content = {
  login: {
    eyebrow: "Votre espace AlmaGo",
    title: "Retrouvez votre prochaine étape.",
    description: "Votre dossier reste au même endroit.",
    image: "https://images.pexels.com/photos/6684514/pexels-photo-6684514.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants travaillent ensemble dans une bibliothèque universitaire.",
    badge: "Votre dossier reste organisé",
    points: [
      ["01", "Votre prochaine action", "Voyez rapidement ce qu’il faut faire."],
      ["02", "Vos documents", "Retrouvez ce qui est ajouté ou à vérifier."],
      ["03", "Vos candidatures", "Suivez chaque programme au même endroit."],
    ],
  },
  signup: {
    eyebrow: "Votre parcours commence ici",
    title: "Créez votre espace.",
    description: "Vous indiquerez ensuite votre projet et vos documents.",
    image: "https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Des étudiants relisent ensemble des documents devant un bâtiment universitaire.",
    badge: "Étudier en Allemagne, étape par étape",
    points: [
      ["01", "Créer votre compte", "Vos informations de connexion."],
      ["02", "Définir votre projet", "Diplôme, domaine, langue et rentrée."],
      ["03", "Préparer votre dossier", "Documents, programmes et candidatures."],
    ],
  },
} as const;

export function AuthStoryPanel({ mode }: AuthStoryPanelProps) {
  const story = content[mode];

  return (
    <section className="hidden min-h-[700px] overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_28px_70px_-52px_rgba(28,33,36,0.55)] lg:flex lg:flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-7 py-5">
        <Link href="/" className="inline-flex items-center" aria-label="Retour à l'accueil AlmaGo">
          <BrandLogo className="h-auto w-36" />
        </Link>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-600">
          Espace étudiant
        </span>
      </div>

      <div className="relative h-64 shrink-0 overflow-hidden">
        <Image
          src={story.image}
          alt={story.alt}
          fill
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,33,36,0.58)] via-transparent to-transparent" />
        <p className="absolute bottom-5 left-6 right-6 m-0 max-w-sm text-sm font-semibold leading-6 text-white">
          {story.badge}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{story.eyebrow}</p>
        <h1 className="editorial-accent mt-3 max-w-xl text-[2rem] leading-[1.08] text-[var(--foreground)]">
          {story.title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">{story.description}</p>

        <ol className="mt-6 grid gap-2">
          {story.points.map(([number, title, detail]) => (
            <li
              key={number}
              className="grid grid-cols-[2.75rem_1fr] gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3"
            >
              <span className="pt-0.5 text-xs font-bold tracking-[0.14em] text-[var(--brand-strong)]">{number}</span>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-6">
          <div className="border-l-2 border-[var(--brand)] pl-4">
            <p className="text-sm font-bold text-[var(--foreground)]">AlmaGo vous aide à préparer.</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              Les universités et les autorités prennent les décisions officielles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
