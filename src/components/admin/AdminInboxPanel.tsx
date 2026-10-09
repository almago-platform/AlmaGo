"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";

export type AdminInboxItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatDate(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}

function studentIdFromMetadata(metadata: Record<string, unknown> | null) {
  const value = metadata?.student_id;
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

function notificationHref(item: AdminInboxItem) {
  const studentId = studentIdFromMetadata(item.metadata);
  if (studentId) return `/admin/dossiers/${studentId}`;
  if (item.type === "admin_payment_validation_required") return "/admin/payments";
  if (item.type === "admin_student_question" || item.type === "admin_route_accepted") return "/admin/intake";
  return "/admin/people";
}

function notificationTone(item: AdminInboxItem): "warning" | "info" | "neutral" | "success" {
  if (item.type === "admin_payment_validation_required") return "warning";
  if (item.type === "admin_student_question") return "warning";
  if (item.type === "admin_route_accepted") return "info";
  return item.read_at ? "neutral" : "info";
}

export function AdminInboxPanel({
  items,
  unreadCount,
}: {
  items: AdminInboxItem[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const unread = useMemo(() => items.filter((item) => !item.read_at), [items]);
  const read = useMemo(() => items.filter((item) => item.read_at), [items]);

  async function markRead(notificationId?: string) {
    setBusy(notificationId || "all");
    setNotice(null);

    const response = await fetch("/api/admin/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationId ? { notification_id: notificationId } : { all: true }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string; updated?: number };

    if (!response.ok) {
      setNotice(payload.error || "Impossible de mettre à jour la boîte de réception.");
      setBusy(null);
      return;
    }

    setNotice(notificationId ? "Notification marquée comme lue." : "Toutes les notifications ont été marquées comme lues.");
    setBusy(null);
    router.refresh();
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">À traiter</p>
            <Badge variant={unreadCount ? "warning" : "success"}>
              {unreadCount ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "À jour"}
            </Badge>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">Événements récents</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chaque administrateur possède sa propre boîte de réception. Ouvrir un dossier ne marque pas automatiquement la notification comme lue.
          </p>
        </div>

        {unreadCount ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy === "all"}
            onClick={() => markRead()}
            className="shrink-0"
          >
            {busy === "all" ? "Mise à jour…" : "Tout marquer comme lu"}
          </Button>
        ) : null}
      </div>

      {notice ? (
        <p role="status" className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm font-semibold text-slate-700 sm:px-5">
          {notice}
        </p>
      ) : null}

      {!items.length ? (
        <div className="p-8 text-center">
          <p className="text-lg font-bold text-slate-950">Aucun événement</p>
          <p className="mt-2 text-sm text-slate-600">Les nouvelles réponses étudiantes et validations apparaîtront ici.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[var(--border)]">
            {unread.map((item) => (
              <InboxRow key={item.id} item={item} busy={busy === item.id} onRead={() => markRead(item.id)} />
            ))}
          </div>

          {read.length ? (
            <details className="border-t border-[var(--border)]">
              <summary className="cursor-pointer bg-[var(--surface-subtle)] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-5">
                Déjà lues · {read.length}
              </summary>
              <div className="divide-y divide-[var(--border)]">
                {read.map((item) => (
                  <InboxRow key={item.id} item={item} busy={false} onRead={null} />
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}

function InboxRow({
  item,
  busy,
  onRead,
}: {
  item: AdminInboxItem;
  busy: boolean;
  onRead: (() => void) | null;
}) {
  return (
    <article className={`grid gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center ${item.read_at ? "bg-white" : "bg-amber-50/35"}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={notificationTone(item)}>{item.read_at ? "Lu" : "Nouveau"}</Badge>
          <time className="text-xs font-semibold text-slate-500" dateTime={item.created_at}>
            {formatDate(item.created_at)}
          </time>
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-950">{item.title}</h3>
        {item.body ? <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p> : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
        <Link href={notificationHref(item)} className={buttonClassName("secondary", "w-full px-3 sm:w-auto")}>
          Ouvrir
        </Link>
        {onRead ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onRead}
            className="w-full px-3 sm:w-auto"
          >
            {busy ? "Mise à jour…" : "Marquer comme lue"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
