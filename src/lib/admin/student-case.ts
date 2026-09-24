export type StudentCaseDocument = {
  status: string;
};

export type StudentCaseChecklistItem = {
  status: string;
  due_date?: string | null;
  created_at?: string | null;
};

export type StudentCaseApplication = {
  deadline?: string | null;
  next_action?: string | null;
  created_at?: string | null;
};

function isDateOnly(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

export function countDocumentsNeedingStudentAction(documents: StudentCaseDocument[]) {
  return documents.filter((document) =>
    ["rejected", "replace_required"].includes(document.status),
  ).length;
}

export function countDocumentsWithAlmaGo(documents: StudentCaseDocument[]) {
  return documents.filter((document) =>
    ["pending", "reviewed"].includes(document.status),
  ).length;
}

export function summarizeChecklist(items: StudentCaseChecklistItem[]) {
  return {
    todo: items.filter((item) => item.status === "todo").length,
    completed: items.filter((item) => item.status === "completed").length,
  };
}

export function selectNextKnownDeadline<T extends StudentCaseApplication>(applications: T[]) {
  return applications
    .filter((application) => isDateOnly(application.deadline))
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))[0];
}

export function selectRecordedNextAction<T extends StudentCaseApplication>(applications: T[]) {
  return applications
    .filter((application) => Boolean(application.next_action?.trim()))
    .sort((a, b) => {
      const aHasDeadline = isDateOnly(a.deadline);
      const bHasDeadline = isDateOnly(b.deadline);

      if (aHasDeadline && bHasDeadline) {
        const byDeadline = String(a.deadline).localeCompare(String(b.deadline));
        if (byDeadline !== 0) return byDeadline;
      } else if (aHasDeadline !== bHasDeadline) {
        return aHasDeadline ? -1 : 1;
      }

      return String(a.created_at || "").localeCompare(String(b.created_at || ""));
    })[0];
}

export function selectNextChecklistDueDate<T extends StudentCaseChecklistItem>(items: T[]) {
  return items
    .filter((item) => item.status === "todo" && isDateOnly(item.due_date))
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))[0];
}
