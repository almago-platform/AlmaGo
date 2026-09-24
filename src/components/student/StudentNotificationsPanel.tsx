"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type StudentNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: unknown;
  read_at: string | null;
  created_at: string;
};

type Feedback = {
  tone: "success" | "error";
  message: string;
} | null;

function notificationHref(type: string) {
  if (type.startsWith("document_")) return "/student/documents";
  if (type.startsWith("application_")) return "/student/applications";
  if (type.startsWith("orientation_") || type.startsWith("recommendation_")) return "/student/orientation";
  return "/student";
}

function notificationArea(type: string) {
  if (type.startsWith("document_")) return "Documents";
  if (type.startsWith("application_")) return "Candidatures";
  if (type.startsWith("orientation_") || type.startsWith("recommendation_")) return "Orientation";
  return "Mon dossier";
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function StudentNotificationsPanel({
  notifications,
}: {
  notifications: StudentNotification[];
}) {
  const [items, setItems] = useState(notifications);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const unreadCount = useMemo(
    () => items.filter((notification) => !notification.read_at).length,
    [items],
  );

  async function markRead(id: string) {
    setBusyId(id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/student/notifications/${id}`, {
        method: "PATCH",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({
          tone: "error",
          message: result.error || "Impossible de marquer cette notification comme lue.",
        });
        return;
      }

      const readAt = typeof result.read_at === "string" ? result.read_at : new Date().toISOString();
      setItems((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read_at: notification.read_at || readAt }
            : notification,
        ),
      );
    } catch {
      setFeedback({
        tone: "error",
        message: "Erreur réseau. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function markAllRead() {
    if (!unreadCount) return;

    setMarkingAll(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/student/notifications/read-all", {
        method: "PATCH",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({
          tone: "error",
          message: result.error || "Impossible de marquer les notifications comme lues.",
        });
        return;
      }

      const readAt = typeof result.read_at === "string" ? result.read_at : new Date().toISOString();
      setItems((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at || readAt,
        })),
      );
      setFeedback({
        tone: "success",
        message: "Les notifications visibles sont maintenant marquées comme lues.",
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "Erreur réseau. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Résumé des notifications">
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Non lues</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{unreadCount}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Notifications de dossier qui n’ont pas encore été marquées comme lues.
          </p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Affichées</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{items.length}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Les 50 notifications les plus récentes au maximum.
          </p>
        </Card>
      </section>

      {feedback && (
        <div
          role={feedback.tone === "error" ? "alert" : "status"}
          className={
            "rounded-[var(--radius-control)] border p-4 text-sm " +
            (feedback.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800")
          }
        >
          {feedback.message}
        </div>
      )}

      <section aria-labelledby="student-notifications-list-title">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Mises à jour</p>
            <h2 id="student-notifications-list-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Notifications de mon dossier
            </h2>
          </div>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={markAllRead}
              disabled={markingAll}
              className="w-full justify-center sm:w-auto"
            >
              {markingAll ? "Enregistrement…" : "Tout marquer comme lu"}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="border-dashed bg-white/70 py-9 text-center shadow-none">
            <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              ✓
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Aucune notification pour le moment.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Les mises à jour enregistrées pour vos documents, candidatures ou autres parties de votre dossier apparaîtront ici lorsqu’une notification sera créée.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((notification) => {
              const unread = !notification.read_at;
              const href = notificationHref(notification.type);

              return (
                <Card
                  as="article"
                  key={notification.id}
                  className={unread ? "border-[var(--brand-border)] bg-[var(--brand-soft)]/25" : "bg-white shadow-none"}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={unread ? "info" : "neutral"}>
                          {unread ? "Non lue" : "Lue"}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-500">
                          {notificationArea(notification.type)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold leading-6 text-slate-950 [overflow-wrap:anywhere]">
                        {notification.title}
                      </h3>
                      {notification.body && (
                        <p className="mt-2 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                          {notification.body}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-slate-400">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
                      <Link
                        href={href}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white px-4 text-sm font-bold text-[var(--brand)] transition-colors hover:border-[var(--brand)] sm:w-auto"
                      >
                        Voir {notificationArea(notification.type).toLocaleLowerCase("fr")}
                      </Link>
                      {unread && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full justify-center sm:w-auto"
                          disabled={busyId === notification.id}
                          onClick={() => markRead(notification.id)}
                        >
                          {busyId === notification.id ? "Enregistrement…" : "Marquer comme lue"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        Cette page montre des notifications de suivi et ne remplace pas les statuts détaillés visibles dans Documents, Orientation et Candidatures.
      </p>
    </div>
  );
}
