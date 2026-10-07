import {
  isActiveApplication,
  isSubmittedApplicationStatus,
} from "@/lib/application-workflow";

export type ApplicationRouteRiskKind = "uni_assist" | "vpd_then_direct";

export type ApplicationRouteRisk = {
  kind: ApplicationRouteRiskKind;
  targetDate: string;
  officialDeadline: string;
  leadDays: 56 | 70;
};

type ApplicationRouteRiskInput = {
  status: string;
  application_method: string | null | undefined;
  deadline: string | null | undefined;
  deadline_kind: string | null | undefined;
  deadlineTrusted: boolean;
};

function shiftDateKey(value: string, days: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function applicationRouteRisk(
  application: ApplicationRouteRiskInput,
  todayKey: string,
): ApplicationRouteRisk | null {
  if (!isActiveApplication(application.status)) return null;
  if (isSubmittedApplicationStatus(application.status)) return null;
  if (!application.deadline || !application.deadlineTrusted) return null;
  if (application.deadline_kind !== "official_hard_deadline") return null;

  const method: ApplicationRouteRiskKind | null =
    application.application_method === "uni_assist"
      ? "uni_assist"
      : application.application_method === "vpd_then_direct"
        ? "vpd_then_direct"
        : null;
  if (!method) return null;

  const leadDays: 56 | 70 = method === "uni_assist" ? 56 : 70;
  const targetDate = shiftDateKey(application.deadline, -leadDays);
  if (!targetDate || todayKey < targetDate) return null;

  return {
    kind: method,
    targetDate,
    officialDeadline: application.deadline,
    leadDays,
  };
}

export function applicationRouteRiskLabel(kind: ApplicationRouteRiskKind) {
  return kind === "vpd_then_direct" ? "VPD à risque" : "uni-assist à risque";
}


export type ApplicationOfficialDeadlineUrgencyKind =
  | "overdue"
  | "d3"
  | "d7"
  | "d14"
  | "d30";

export type ApplicationOfficialDeadlineUrgency = {
  kind: ApplicationOfficialDeadlineUrgencyKind;
  daysRemaining: number;
  officialDeadline: string;
};

type ApplicationOfficialDeadlineUrgencyInput = {
  status: string;
  deadline: string | null | undefined;
  deadline_kind: string | null | undefined;
  deadlineTrusted: boolean;
};

function dateKeyDayNumber(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return Math.floor(timestamp / 86_400_000);
}

export function applicationOfficialDeadlineUrgency(
  application: ApplicationOfficialDeadlineUrgencyInput,
  todayKey: string,
): ApplicationOfficialDeadlineUrgency | null {
  if (!isActiveApplication(application.status)) return null;
  if (isSubmittedApplicationStatus(application.status)) return null;
  if (!application.deadline || !application.deadlineTrusted) return null;
  if (application.deadline_kind !== "official_hard_deadline") return null;

  const deadlineDay = dateKeyDayNumber(application.deadline);
  const todayDay = dateKeyDayNumber(todayKey);
  if (deadlineDay === null || todayDay === null) return null;

  const daysRemaining = deadlineDay - todayDay;
  const kind: ApplicationOfficialDeadlineUrgencyKind | null =
    daysRemaining < 0
      ? "overdue"
      : daysRemaining <= 3
        ? "d3"
        : daysRemaining <= 7
          ? "d7"
          : daysRemaining <= 14
            ? "d14"
            : daysRemaining <= 30
              ? "d30"
              : null;

  return kind
    ? {
        kind,
        daysRemaining,
        officialDeadline: application.deadline,
      }
    : null;
}

export function applicationOfficialDeadlineUrgencyLabel(
  urgency: ApplicationOfficialDeadlineUrgency,
) {
  if (urgency.kind === "overdue") return "Deadline officielle dépassée";
  if (urgency.kind === "d3") return `Deadline officielle · J-${urgency.daysRemaining}`;
  if (urgency.kind === "d7") return "Deadline officielle · ≤ 7 j";
  if (urgency.kind === "d14") return "Deadline officielle · ≤ 14 j";
  return "Deadline officielle · ≤ 30 j";
}
