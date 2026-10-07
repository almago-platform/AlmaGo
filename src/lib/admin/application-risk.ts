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

  const method = application.application_method;
  const leadDays = method === "uni_assist"
    ? 56
    : method === "vpd_then_direct"
      ? 70
      : null;

  if (!leadDays) return null;

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
