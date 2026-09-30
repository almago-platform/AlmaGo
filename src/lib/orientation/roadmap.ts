import type {
  PublicDiagnosticItem,
  PublicOrientationDiagnostic,
} from "@/lib/orientation/diagnostic";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export type ProspectRoadmap = {
  now: PublicDiagnosticItem[];
  afterResults: PublicDiagnosticItem[];
  verifyNext: PublicDiagnosticItem[];
};

const deferredForFutureBac = new Set(["finish_bac", "add_average"]);

function unique(items: PublicDiagnosticItem[]) {
  return items.filter(
    (item, index) => items.findIndex((candidate) => candidate.code === item.code) === index,
  );
}

export function buildProspectRoadmap(
  answers: PublicOrientationAnswers,
  diagnostic: PublicOrientationDiagnostic,
): ProspectRoadmap {
  if (answers.bacStatus !== "preparing") {
    return {
      now: unique(diagnostic.priorities),
      afterResults: [],
      verifyNext: unique(diagnostic.checks),
    };
  }

  const futureBacPath = diagnostic.paths.find(
    (item) => item.code === "future_bac_roadmap",
  );

  const now = unique([
    ...(futureBacPath ? [futureBacPath] : []),
    ...diagnostic.priorities.filter(
      (item) => !deferredForFutureBac.has(item.code),
    ),
  ]);

  // These are milestones derived from the user's declared "Bac in preparation"
  // state. No calendar date, application deadline or official rule is inferred.
  const afterResults: PublicDiagnosticItem[] = unique([
    { code: "finish_bac", status: "known_gap" },
    { code: "add_average", status: "needs_information" },
  ]);

  return {
    now,
    afterResults,
    verifyNext: unique(diagnostic.checks),
  };
}
