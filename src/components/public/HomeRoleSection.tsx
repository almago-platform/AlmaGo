import type { ReactNode } from "react";

export function HomeRoleSection() {
  return (
    <section id="role" className="bg-[#fbfaf8] py-16 sm:py-20 lg:py-24" aria-labelledby="role-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="eyebrow">Notre rôle</p>
            <h2 id="role-title" className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.8rem]">
              Un accompagnement clair, avec des responsabilités bien définies.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:justify-self-end">
            AlmaGo vous aide à préparer et suivre votre projet d’études. Les conditions officielles, les décisions d’admission et les décisions des autorités restent toujours du ressort des organismes compétents.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] font-bold text-[var(--brand)]">A</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Avec AlmaGo</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Votre dossier reste organisé et compréhensible.</h3>
              </div>
            </div>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
              <RoleItem>Réunir votre profil, vos documents, vos démarches et vos candidatures dans un même espace.</RoleItem>
              <RoleItem>Voir ce qui demande votre attention et la prochaine étape enregistrée dans votre dossier.</RoleItem>
              <RoleItem>Examiner des pistes d’orientation avec des critères présentés de façon lisible.</RoleItem>
              <RoleItem>Garder vos échéances et le suivi de vos candidatures plus faciles à retrouver.</RoleItem>
            </ul>
          </article>

          <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">✓</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">La référence officielle</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Les décisions restent celles des organismes compétents.</h3>
              </div>
            </div>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
              <RoleItem>Les universités et organismes concernés fixent leurs propres conditions d’admission.</RoleItem>
              <RoleItem>Une piste d’orientation AlmaGo ne constitue ni une admission ni une décision d’éligibilité.</RoleItem>
              <RoleItem>Les décisions de visa, de séjour ou d’autres autorités ne sont pas prises par AlmaGo.</RoleItem>
              <RoleItem>Pour une condition, une date limite ou une formalité, la source officielle reste la référence.</RoleItem>
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 px-5 py-4 sm:px-6">
          <p className="text-sm font-bold text-[var(--brand)]">Pourquoi cette distinction est importante</p>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-700">
            Vous devez pouvoir comprendre à tout moment ce qu’AlmaGo organise dans votre dossier et ce qui doit être vérifié ou décidé auprès d’une source officielle.
          </p>
        </div>
      </div>
    </section>
  );
}

function RoleItem({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
      <span>{children}</span>
    </li>
  );
}
