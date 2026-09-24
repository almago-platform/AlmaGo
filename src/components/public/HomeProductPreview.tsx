const previewMetrics = [
  ["À traiter", "Actions enregistrées"],
  ["En attente AlmaGo", "Étapes suivies"],
  ["Recommandations", "Pistes d’études"],
  ["Candidatures", "Dossiers enregistrés"],
] as const;

export function HomeProductPreview() {
  return (
    <section id="espace" className="border-y border-[var(--border)] bg-[var(--surface-muted)] py-16 sm:py-20 lg:py-24" aria-labelledby="product-preview-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-14 lg:px-8">
        <div>
          <p className="eyebrow">Votre espace AlmaGo</p>
          <h2 id="product-preview-title" className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.8rem]">
            Votre dossier, en un coup d’œil.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            L’espace étudiant est construit autour d’une question simple : qu’est-ce qui est enregistré dans mon dossier, et quelle action est utile maintenant ?
          </p>

          <ul className="mt-7 space-y-4">
            <PreviewBenefit title="Une prochaine action visible" text="Le dashboard met en avant l’action enregistrée comme prioritaire dans votre dossier." />
            <PreviewBenefit title="Une progression expliquée" text="Le suivi concerne les étapes enregistrées ; il n’est jamais présenté comme une probabilité d’admission." />
            <PreviewBenefit title="Vos informations reliées" text="Documents, recommandations, candidatures et échéances restent accessibles depuis le même espace." />
          </ul>
        </div>

        <div className="overflow-hidden rounded-[calc(var(--radius-panel)+0.2rem)] border border-[var(--brand-border)] bg-white shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] md:hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-xs font-bold text-white">A</span>
              <div>
                <p className="text-sm font-bold text-slate-950">AlmaGo</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Espace étudiant</p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--brand)]">
              Exemple
            </span>
          </div>

          <div className="bg-[#fcfcfd] p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">Votre dossier</p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Ce qui compte maintenant</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Une vue compacte des prochaines actions et éléments enregistrés.</p>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white p-4 shadow-sm">
              <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
              <div className="pl-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">À suivre maintenant</span>
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">Action à faire</span>
                </div>
                <p className="mt-3 text-base font-bold text-slate-950">Votre prochaine étape</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">L’action prioritaire enregistrée apparaît ici avec son contexte.</p>
                <span className="mt-3 inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-3 text-xs font-bold text-white">
                  Continuer ma checklist
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {previewMetrics.map(([title, detail]) => (
                <div key={title} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                  <p className="text-xs font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-900">Étapes du dossier</p>
                <span className="text-[10px] font-bold text-[var(--brand)]">Suivi visible</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div aria-hidden="true" className="h-full w-3/5 rounded-full bg-[var(--brand)]" />
              </div>
              <p className="mt-2 text-[10px] leading-4 text-slate-500">Illustration d’un suivi interne, jamais d’une probabilité d’admission.</p>
            </div>
          </div>

          <div className="border-t border-[var(--border)] px-4 py-3">
            <p className="text-[10px] leading-4 text-slate-500">Aperçu d’exemple : les informations réelles dépendent de chaque dossier.</p>
          </div>
        </div>

        <div className="hidden md:block overflow-hidden rounded-[calc(var(--radius-panel)+0.3rem)] border border-[var(--brand-border)] bg-white shadow-[0_34px_80px_-44px_rgba(15,23,42,0.52)]">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </div>
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
              Aperçu d’exemple
            </span>
          </div>

          <div className="grid min-h-[34rem] sm:grid-cols-[10.5rem_1fr]">
            <aside className="hidden border-r border-[var(--border)] bg-[#fbfbfd] p-4 sm:block" aria-label="Navigation illustrative AlmaGo">
              <div className="flex items-center gap-2.5 px-2 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-xs font-bold text-white">A</span>
                <span className="text-sm font-bold text-slate-950">AlmaGo</span>
              </div>
              <div className="mt-6 space-y-2 text-xs font-semibold">
                <PreviewNav active label="Mon dossier" />
                <PreviewNav label="Documents" />
                <PreviewNav label="Orientation" />
                <PreviewNav label="Candidatures" />
                <PreviewNav label="Démarches" />
              </div>
            </aside>

            <div className="bg-[#fcfcfd] p-4 sm:p-5 lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Espace étudiant</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Votre dossier</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Démarches, documents et candidatures réunis au même endroit.</p>
                </div>
                <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[10px] font-bold text-slate-600">
                  Exemple visuel
                </span>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1.35fr_0.85fr]">
                <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white p-4 shadow-sm">
                  <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
                  <div className="pl-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">À suivre maintenant</span>
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">Action à faire</span>
                    </div>
                    <p className="mt-4 text-lg font-bold text-slate-950">Votre prochaine étape</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      L’action prioritaire enregistrée dans votre dossier apparaît ici avec son contexte.
                    </p>
                    <span className="mt-4 inline-flex min-h-9 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-3 text-xs font-bold text-white">
                      Continuer ma checklist
                    </span>
                  </div>
                </div>

                <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Préparation</p>
                  <p className="mt-2 text-sm font-bold text-slate-950">Étapes du dossier</p>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <span className="text-lg font-bold text-slate-950">Suivi visible</span>
                    <span className="text-xs font-bold text-[var(--brand)]">Exemple</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div aria-hidden="true" className="h-full w-3/5 rounded-full bg-[var(--brand)]" />
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-slate-500">
                    Ce suivi illustre des étapes enregistrées, pas une chance d’admission.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">Vue d’ensemble</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {previewMetrics.map(([title, detail]) => (
                    <div key={title} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                      <p className="text-[11px] font-bold text-slate-800">{title}</p>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col justify-between gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center">
                <div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">Prochaine échéance</span>
                  <p className="mt-2 text-sm font-bold text-slate-950">Une date enregistrée apparaît ici</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">Avec la prochaine action associée lorsqu’elle est connue.</p>
                </div>
                <span className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-xs font-bold text-slate-700">
                  Voir mes candidatures
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] bg-white px-5 py-3">
            <p className="text-[11px] leading-5 text-slate-500">
              Illustration fidèle à la structure du dashboard AlmaGo. Les statuts, actions et informations réelles dépendent de chaque dossier.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewBenefit({ title, text }: { title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">✓</span>
      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </li>
  );
}

function PreviewNav({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`rounded-[var(--radius-control)] px-3 py-2.5 ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-slate-500"}`}>
      {label}
    </div>
  );
}
