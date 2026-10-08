// UX-3: a read-only view model over records already loaded by the secured admin dossier.
// A source row is never converted into an unrecorded admission, visa or official decision.
export type DossierHistoryCategory = "suivi" | "messages" | "notes" | "documents" | "candidatures";

export type UnifiedDossierEvent = {
  id: string;
  category: DossierHistoryCategory;
  title: string;
  detail: string | null;
  occurredAt: string;
  recordedAt: string | null;
  actor: string | null;
  source: string;
  currentStatus: string | null;
  href: string;
};

type History = { id: string; event_type: string; message: string; created_at: string };
type Message = {
  id: string; sender_role: string; body: string; created_at: string;
  attachment_name?: string | null;
};
type Note = {
  id: string; kind: string; content: string; occurred_at: string; created_at: string;
  author_name: string;
};
type Document = {
  id: string; category: string; original_filename: string | null;
  status: string; created_at: string;
};
type Application = {
  id: string; created_at: string; programName: string | null;
  application_events?: Array<{
    id: string; event_type: string; message: string | null;
    visible_to_student: boolean; created_at: string;
  }> | null;
};

export type UnifiedDossierInput = {
  history: History[];
  messages: Message[];
  notes: Note[];
  documents: Document[];
  applications: Application[];
  // Preserve factual legacy events shown when the dedicated history is empty.
  legacyFallback?: {
    orientation?: { id: string; createdAt: string; detail: string | null } | null;
    studentResponse?: { createdAt: string; detail: string | null } | null;
    purchase?: { id: string; createdAt: string; detail: string | null } | null;
  };
};

const noteLabels: Record<string, string> = {
  internal_note: "Note interne",
  call: "Appel consigné",
  email: "E-mail consigné",
  whatsapp: "Échange WhatsApp consigné",
  meeting: "Rendez-vous consigné",
  document_request: "Demande de pièce consignée",
  university_contact: "Contact université consigné",
};
const documentLabels: Record<string, string> = {
  approved: "Approuvé",
  pending: "À vérifier",
  reviewed: "Revu",
  replace_required: "Remplacement demandé",
  rejected: "Rejeté",
  quarantined: "En quarantaine",
};

function historyTitle(type: string): string {
  if (type.includes("document")) return "Événement documentaire";
  if (type.includes("application")) return "Événement de candidature";
  if (type.includes("payment") || type.includes("purchase")) return "Événement commercial";
  if (type.includes("orientation") || type.includes("route")) return "Événement de parcours";
  if (type.includes("action")) return "Action de suivi enregistrée";
  return "Événement du dossier";
}

function asValidDate(raw: string): number | null {
  const time = Date.parse(raw);
  return Number.isFinite(time) ? time : null;
}

// Only exact, attributable mirrors can be collapsed across different tables.
// Similar-looking events without a shared proof are kept rather than silently erased.
export function buildUnifiedDossierHistory(input: UnifiedDossierInput): UnifiedDossierEvent[] {
  const events: UnifiedDossierEvent[] = [];
  const seenIds = new Set<string>();
  const add = (event: UnifiedDossierEvent) => {
    if (seenIds.has(event.id)) return;
    seenIds.add(event.id);
    events.push(event);
  };

  const recordedApplicationEvents = new Set(
    input.applications.flatMap((app) =>
      (app.application_events || [])
        .filter((event) => Boolean(event.message?.trim()))
        .map((event) => event.created_at + "|" + event.message?.trim())
    )
  );

  for (const item of input.history) {
    if (item.event_type.includes("application") &&
      recordedApplicationEvents.has(item.created_at + "|" + item.message.trim())) {
      continue;
    }
    add({
      id: "history:" + item.id,
      category: "suivi",
      title: historyTitle(item.event_type),
      detail: item.message || null,
      occurredAt: item.created_at,
      recordedAt: null,
      actor: null,
      source: "Journal des événements",
      currentStatus: null,
      href: "#history",
    });
  }

  for (const item of input.messages) {
    const role = item.sender_role;
    add({
      id: "message:" + item.id,
      category: "messages",
      title: role === "student" ? "Message reçu de l’étudiant"
        : role === "admin" ? "Message envoyé par Campus" : "Message enregistré",
      detail: [item.body?.trim(), item.attachment_name ? "Pièce jointe : " + item.attachment_name : null]
        .filter(Boolean).join(" · ") || null,
      occurredAt: item.created_at,
      recordedAt: null,
      actor: role === "student" ? "Étudiant" : role === "admin" ? "Équipe Campus" : null,
      source: "Messagerie du dossier",
      currentStatus: null,
      href: "#messages",
    });
  }

  for (const item of input.notes) {
    add({
      id: "note:" + item.id,
      category: "notes",
      title: noteLabels[item.kind] || "Note interne consignée",
      detail: item.content || null,
      occurredAt: item.occurred_at,
      recordedAt: item.created_at,
      actor: item.author_name || null,
      source: "Journal interne · date d’échange déclarée",
      currentStatus: null,
      href: "#journal",
    });
  }

  for (const item of input.documents) {
    add({
      id: "document:" + item.id,
      category: "documents",
      title: "Document enregistré",
      detail: item.original_filename || item.category || null,
      occurredAt: item.created_at,
      recordedAt: null,
      actor: null,
      source: "Dossier documentaire",
      // Current status, NOT an assertion about its state when it was uploaded.
      currentStatus: "État actuel : " + (documentLabels[item.status] || "À vérifier dans Documents"),
      href: "#documents",
    });
  }

  for (const app of input.applications) {
    const items = app.application_events || [];
    const hasCreationEvent = items.some((event) =>
      (event.event_type === "application_created" || event.event_type === "created")
      && event.created_at === app.created_at
    );
    if (!hasCreationEvent) {
      add({
        id: "application:" + app.id,
        category: "candidatures",
        title: "Candidature enregistrée",
        detail: app.programName || null,
        occurredAt: app.created_at,
        recordedAt: null,
        actor: null,
        source: "Registre des candidatures",
        currentStatus: null,
        href: "#applications",
      });
    }
    for (const event of items) {
      add({
        id: "application-event:" + event.id,
        category: "candidatures",
        title: event.event_type === "application_status_changed"
          ? "Mise à jour de candidature" : "Événement de candidature enregistré",
        detail: [app.programName, event.message?.trim()].filter(Boolean).join(" · ") || null,
        occurredAt: event.created_at,
        recordedAt: null,
        actor: null,
        source: event.visible_to_student
          ? "Événement de candidature" : "Événement interne de candidature",
        currentStatus: null,
        href: "#applications",
      });
    }
  }

  if (!input.history.length && input.legacyFallback) {
    const { orientation, studentResponse, purchase } = input.legacyFallback;
    if (orientation?.createdAt) {
      add({
        id: "orientation:" + orientation.id, category: "suivi",
        title: "Orientation enregistrée", detail: orientation.detail,
        occurredAt: orientation.createdAt, recordedAt: null, actor: null,
        source: "Orientation du dossier", currentStatus: null, href: "#orientation",
      });
    }
    if (studentResponse?.createdAt) {
      add({
        id: "intake-response:" + studentResponse.createdAt, category: "suivi",
        title: "Réponse de l’étudiant enregistrée", detail: studentResponse.detail,
        occurredAt: studentResponse.createdAt, recordedAt: null, actor: "Étudiant",
        source: "Réponse du dossier", currentStatus: null, href: "#overview",
      });
    }
    if (purchase?.createdAt) {
      add({
        id: "purchase:" + purchase.id, category: "suivi",
        title: "Achat créé", detail: purchase.detail,
        occurredAt: purchase.createdAt, recordedAt: null, actor: null,
        source: "Achat enregistré", currentStatus: null, href: "#commercial",
      });
    }
  }

  return events.sort((a, b) => {
    const aTime = asValidDate(a.occurredAt) ?? -Infinity;
    const bTime = asValidDate(b.occurredAt) ?? -Infinity;
    return bTime - aTime || a.id.localeCompare(b.id);
  });
}
