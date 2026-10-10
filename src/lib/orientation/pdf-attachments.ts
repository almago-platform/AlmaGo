import "server-only";

import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { orientationCandidatePriority } from "@/lib/orientation-engine/writer/candidate-priority";
import { findCuratedUniversityMedia } from "@/lib/orientation-engine/discovery/curated-university-media";
import type { ResearchPiste } from "@/lib/orientation-engine/discovery/research-pistes";
import type { Locale } from "@/lib/i18n";
import type {
  PublicOrientationAnswers,
  PublicOrientationIdentity,
} from "@/lib/orientation/public";
import type { PublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import type {
  OrientationPublicPersonalizedResult,
} from "@/lib/orientation-engine/result/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 46;
const TOP_Y = PAGE_HEIGHT - 48;
const BOTTOM_Y = 48;

const NAVY = [0.07, 0.13, 0.19] as const;
const RED = [0.86, 0.02, 0.14] as const;
const GOLD = [0.96, 0.66, 0.05] as const;
const MUTED = [0.36, 0.40, 0.44] as const;
const LIGHT = [0.96, 0.94, 0.90] as const;
const WHITE = [1, 1, 1] as const;

type PdfLocale = Exclude<Locale, "ar">;
type PdfColor = readonly [number, number, number];
type PdfImage = { name: string; bytes: Buffer; width: number; height: number };

type PdfAttachment = {
  filename: string;
  contentBase64: string;
  contentType: "application/pdf";
};

type PdfCopy = {
  candidateReport: string;
  orientationReport: string;
  generated: string;
  identity: string;
  studies: string;
  languages: string;
  project: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  bacStatus: string;
  bacYear: string;
  bacTrack: string;
  average: string;
  diploma: string;
  currentStudies: string;
  semesters: string;
  german: string;
  english: string;
  studyLanguage: string;
  degree: string;
  field: string;
  specialization: string;
  intake: string;
  budget: string;
  cities: string;
  headline: string;
  priority: string;
  programmes: string;
  roadmap: string;
  nextStep: string;
  disclaimer: string;
  arabicFallback: string;
  bacStatuses: Record<string, string>;
  intakeSeasons: Record<string, string>;
};

const COPY: Record<PdfLocale, PdfCopy> = {
  fr: {
    candidateReport: "Rapport candidat",
    orientationReport: "Rapport d'orientation",
    generated: "Généré le",
    identity: "Identité",
    studies: "Parcours scolaire",
    languages: "Langues",
    project: "Projet d'études",
    firstName: "Prénom",
    lastName: "Nom",
    birthDate: "Date de naissance",
    email: "Adresse e-mail",
    bacStatus: "Situation scolaire",
    bacYear: "Année du Bac",
    bacTrack: "Section du Bac",
    average: "Moyenne",
    diploma: "Dernier diplôme",
    currentStudies: "Études actuelles",
    semesters: "Semestres universitaires",
    german: "Allemand",
    english: "Anglais",
    studyLanguage: "Langue d'études",
    degree: "Diplôme visé",
    field: "Domaine",
    specialization: "Spécialisation",
    intake: "Rentrée souhaitée",
    budget: "Budget",
    cities: "Villes préférées",
    headline: "Lecture de votre projet",
    priority: "Votre priorité maintenant",
    programmes: "Programmes qui ressortent",
    roadmap: "Prochaines étapes",
    nextStep: "Prochaine étape",
    disclaimer: "Cette orientation est basée sur les informations fournies. Elle ne garantit ni admission, ni visa, ni inscription universitaire.",
    arabicFallback: "La version PDF jointe est générée en français. La version arabe complète reste disponible via le lien sécurisé dans l'e-mail.",
    bacStatuses: {
      obtained: "Baccalauréat obtenu",
      preparing: "Baccalauréat en préparation",
      no_bac: "Sans Baccalauréat",
    },
    intakeSeasons: { winter: "Semestre d'hiver", summer: "Semestre d'été" },
  },
  en: {
    candidateReport: "Candidate report",
    orientationReport: "Orientation report",
    generated: "Generated on",
    identity: "Identity",
    studies: "Education",
    languages: "Languages",
    project: "Study project",
    firstName: "First name",
    lastName: "Last name",
    birthDate: "Date of birth",
    email: "Email address",
    bacStatus: "School status",
    bacYear: "Baccalaureate year",
    bacTrack: "Baccalaureate track",
    average: "Average",
    diploma: "Latest qualification",
    currentStudies: "Current studies",
    semesters: "University semesters",
    german: "German",
    english: "English",
    studyLanguage: "Study language",
    degree: "Target degree",
    field: "Field",
    specialization: "Specialisation",
    intake: "Preferred intake",
    budget: "Budget",
    cities: "Preferred cities",
    headline: "Your project now",
    priority: "Your priority now",
    programmes: "Programmes that stand out",
    roadmap: "Next steps",
    nextStep: "Next step",
    disclaimer: "This orientation is based on the information provided. It does not guarantee admission, a visa, or university enrolment.",
    arabicFallback: "",
    bacStatuses: {
      obtained: "Baccalaureate obtained",
      preparing: "Preparing the Baccalaureate",
      no_bac: "No Baccalaureate",
    },
    intakeSeasons: { winter: "Winter semester", summer: "Summer semester" },
  },
  de: {
    candidateReport: "Bewerberbericht",
    orientationReport: "Orientierungsbericht",
    generated: "Erstellt am",
    identity: "Identität",
    studies: "Ausbildung",
    languages: "Sprachen",
    project: "Studienprojekt",
    firstName: "Vorname",
    lastName: "Nachname",
    birthDate: "Geburtsdatum",
    email: "E-Mail-Adresse",
    bacStatus: "Schulstatus",
    bacYear: "Baccalauréat-Jahr",
    bacTrack: "Baccalauréat-Zweig",
    average: "Durchschnitt",
    diploma: "Letzter Abschluss",
    currentStudies: "Aktuelles Studium",
    semesters: "Hochschulsemester",
    german: "Deutsch",
    english: "Englisch",
    studyLanguage: "Studiensprache",
    degree: "Zielabschluss",
    field: "Fachgebiet",
    specialization: "Spezialisierung",
    intake: "Gewünschter Studienstart",
    budget: "Budget",
    cities: "Bevorzugte Städte",
    headline: "Einordnung deines Projekts",
    priority: "Deine Priorität jetzt",
    programmes: "Passende Programme",
    roadmap: "Nächste Schritte",
    nextStep: "Nächster Schritt",
    disclaimer: "Diese Orientierung basiert auf deinen Angaben. Sie garantiert weder Zulassung noch Visum oder Einschreibung.",
    arabicFallback: "",
    bacStatuses: {
      obtained: "Baccalauréat abgeschlossen",
      preparing: "Baccalauréat in Vorbereitung",
      no_bac: "Ohne Baccalauréat",
    },
    intakeSeasons: { winter: "Wintersemester", summer: "Sommersemester" },
  },
};

const CP1252 = new Map<string, number>([
  ["€", 0x80],
  ["‚", 0x82],
  ["ƒ", 0x83],
  ["„", 0x84],
  ["…", 0x85],
  ["†", 0x86],
  ["‡", 0x87],
  ["ˆ", 0x88],
  ["‰", 0x89],
  ["Š", 0x8a],
  ["‹", 0x8b],
  ["Œ", 0x8c],
  ["Ž", 0x8e],
  ["‘", 0x91],
  ["’", 0x92],
  ["“", 0x93],
  ["”", 0x94],
  ["•", 0x95],
  ["–", 0x96],
  ["—", 0x97],
  ["˜", 0x98],
  ["™", 0x99],
  ["š", 0x9a],
  ["›", 0x9b],
  ["œ", 0x9c],
  ["ž", 0x9e],
  ["Ÿ", 0x9f],
]);

function collapseWhitespace(value: string) {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

function safeText(value: unknown) {
  if (value === null || value === undefined) return "—";
  const text = collapseWhitespace(String(value));
  if (!text) return "—";

  return Array.from(text)
    .map((character) => {
      const code = character.codePointAt(0) || 0;
      if (CP1252.has(character)) return character;
      if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) return character;
      if (character === "\u00a0" || character === "\u202f") return " ";
      return "?";
    })
    .join("");
}

function pdfHex(value: string) {
  const bytes: number[] = [];
  for (const character of Array.from(safeText(value))) {
    const mapped = CP1252.get(character);
    if (mapped !== undefined) {
      bytes.push(mapped);
      continue;
    }
    const code = character.codePointAt(0) || 0x3f;
    bytes.push(code <= 0xff ? code : 0x3f);
  }
  return `<${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}>`;
}

function rgb(color: PdfColor) {
  return `${color[0]} ${color[1]} ${color[2]}`;
}

function estimateWidth(text: string, size: number, bold = false) {
  return safeText(text).length * size * (bold ? 0.55 : 0.5);
}

function wrapText(text: string, maxWidth: number, size: number, bold = false) {
  const clean = safeText(text);
  if (clean === "—") return [clean];

  const words = clean.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || estimateWidth(candidate, size, bold) <= maxWidth) {
      line = candidate;
      continue;
    }

    lines.push(line);
    line = word;

    while (estimateWidth(line, size, bold) > maxWidth && line.length > 2) {
      let cut = Math.max(2, Math.floor(line.length * maxWidth / estimateWidth(line, size, bold)));
      while (cut > 2 && estimateWidth(line.slice(0, cut), size, bold) > maxWidth) cut -= 1;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : ["—"];
}

class PdfLayout {
  readonly pages: string[][] = [[]];
  readonly images: PdfImage[] = [];
  private pageIndex = 0;
  y = TOP_Y;

  private get commands() {
    return this.pages[this.pageIndex];
  }

  newPage() {
    this.pages.push([]);
    this.pageIndex += 1;
    this.y = TOP_Y;
    this.drawPageBrand();
  }

  ensure(height: number) {
    if (this.y - height < BOTTOM_Y) this.newPage();
  }

  rect(x: number, y: number, width: number, height: number, color: PdfColor) {
    this.commands.push(`${rgb(color)} rg ${x} ${y} ${width} ${height} re f`);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: PdfColor, width = 1) {
    this.commands.push(`${rgb(color)} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  }

  text(
    value: string,
    x: number,
    y: number,
    size: number,
    options: { bold?: boolean; color?: PdfColor } = {},
  ) {
    const font = options.bold ? "F2" : "F1";
    const color = options.color || NAVY;
    this.commands.push(
      `BT /${font} ${size} Tf ${rgb(color)} rg 1 0 0 1 ${x} ${y} Tm ${pdfHex(value)} Tj ET`,
    );
  }

  wrapped(
    value: string,
    x: number,
    width: number,
    size: number,
    options: {
      bold?: boolean;
      color?: PdfColor;
      lineHeight?: number;
      gapAfter?: number;
    } = {},
  ) {
    const lines = wrapText(value, width, size, Boolean(options.bold));
    const lineHeight = options.lineHeight || size * 1.35;
    this.ensure(lines.length * lineHeight + (options.gapAfter || 0));

    for (const line of lines) {
      this.text(line, x, this.y, size, options);
      this.y -= lineHeight;
    }
    this.y -= options.gapAfter || 0;
  }

  heading(value: string, size = 16) {
    this.ensure(size * 1.8);
    this.text(value, MARGIN_X, this.y, size, { bold: true, color: NAVY });
    this.y -= size * 1.45;
    this.line(MARGIN_X, this.y + 4, PAGE_WIDTH - MARGIN_X, this.y + 4, LIGHT, 1);
    this.y -= 7;
  }

  labelValue(label: string, value: string) {
    this.ensure(29);
    const labelWidth = 170;
    this.text(label, MARGIN_X, this.y, 8.5, { bold: true, color: MUTED });
    const lines = wrapText(value, PAGE_WIDTH - (MARGIN_X * 2) - labelWidth, 10, true);
    for (const [index, line] of lines.entries()) {
      this.text(line, MARGIN_X + labelWidth, this.y - index * 13, 10, { bold: true, color: NAVY });
    }
    this.y -= Math.max(22, lines.length * 13 + 7);
    this.line(MARGIN_X, this.y + 6, PAGE_WIDTH - MARGIN_X, this.y + 6, LIGHT, 0.6);
  }

  drawPhoto(bytes: Buffer, imageWidth: number, imageHeight: number, x: number, y: number, width: number, height: number) {
    const name = `Im${this.images.length + 1}`;
    this.images.push({ name, bytes, width: imageWidth, height: imageHeight });
    this.commands.push(`q ${width} 0 0 ${height} ${x} ${y} cm /${name} Do Q`);
  }

  drawPageBrand() {
    this.rect(0, PAGE_HEIGHT - 10, PAGE_WIDTH, 10, RED);
    this.text("CAMPUS", MARGIN_X, PAGE_HEIGHT - 31, 8.5, { bold: true, color: NAVY });
    this.text("ALLEMAGNE", MARGIN_X + 42, PAGE_HEIGHT - 31, 8.5, { bold: true, color: RED });
    this.y = PAGE_HEIGHT - 54;
  }
}

function buildPdf(pages: string[][], images: readonly PdfImage[] = []) {
  const objects = new Map<number, Buffer>();
  const pageIds: number[] = [];

  objects.set(1, Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "ascii"));
  objects.set(3, Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>", "ascii"));
  objects.set(4, Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>", "ascii"));

  let nextId = 5;
  const imageResourceIds = new Map<string, number>();
  for (const image of images) {
    const imageId = nextId++;
    imageResourceIds.set(image.name, imageId);
    objects.set(imageId, Buffer.concat([
      Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`, "ascii"),
      image.bytes,
      Buffer.from("\nendstream", "ascii"),
    ]));
  }
  const resources = imageResourceIds.size
    ? ` /XObject << ${[...imageResourceIds].map(([name, id]) => `/${name} ${id} 0 R`).join(" ")} >>`
    : "";
  for (const commands of pages) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageIds.push(pageId);

    const stream = Buffer.from(commands.join("\n"), "ascii");
    objects.set(
      contentId,
      Buffer.concat([
        Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, "ascii"),
        stream,
        Buffer.from("\nendstream", "ascii"),
      ]),
    );

    objects.set(
      pageId,
      Buffer.from(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${resources} >> /Contents ${contentId} 0 R >>`,
        "ascii",
      ),
    );
  }

  objects.set(
    2,
    Buffer.from(
      `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`,
      "ascii",
    ),
  );

  const maxId = nextId - 1;
  const header = Buffer.from("%PDF-1.4\n%AlmaGo\n", "ascii");
  const chunks: Buffer[] = [header];
  const offsets = new Array<number>(maxId + 1).fill(0);
  let offset = header.length;

  for (let id = 1; id <= maxId; id += 1) {
    const body = objects.get(id);
    if (!body) throw new Error(`Missing PDF object ${id}`);
    const prefix = Buffer.from(`${id} 0 obj\n`, "ascii");
    const suffix = Buffer.from("\nendobj\n", "ascii");
    offsets[id] = offset;
    chunks.push(prefix, body, suffix);
    offset += prefix.length + body.length + suffix.length;
  }

  const xrefOffset = offset;
  const xrefLines = [
    "xref",
    `0 ${maxId + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((value) => `${String(value).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${maxId + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ];

  chunks.push(Buffer.from(xrefLines.join("\n"), "ascii"));
  return Buffer.concat(chunks);
}

function pdfLocale(locale: Locale): PdfLocale {
  return locale === "ar" ? "fr" : locale;
}

function nameForPdf(identity: PublicOrientationIdentity | null, email: string) {
  const full = identity
    ? [identity.firstName, identity.lastName].filter(Boolean).join(" ").trim()
    : "";
  const safe = safeText(full);
  return safe.includes("?") || safe === "—" ? email : safe;
}

function generatedDate(locale: PdfLocale, generatedAt: Date) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(generatedAt);
}

function projectRows(
  copy: PdfCopy,
  answers: PublicOrientationAnswers,
) {
  const intakeSeason = answers.targetIntakeSeason
    ? copy.intakeSeasons[answers.targetIntakeSeason] || answers.targetIntakeSeason
    : "—";
  const intake = answers.targetIntakeYear
    ? `${intakeSeason} ${answers.targetIntakeYear}`
    : intakeSeason;
  const specialization = answers.targetSpecialization
    || answers.engineeringSpecialty
    || answers.scienceSpecialty
    || "—";

  return [
    [copy.degree, answers.targetDegree || "—"],
    [copy.field, answers.targetField || "—"],
    [copy.specialization, specialization],
    [copy.intake, intake],
    [copy.budget, answers.budgetRange || "—"],
    [copy.cities, answers.preferredCities.length ? answers.preferredCities.join(", ") : "—"],
  ] as const;
}

function drawReportHeader(
  layout: PdfLayout,
  reportTitle: string,
  candidate: string,
  email: string,
  copy: PdfCopy,
  date: string,
) {
  layout.drawPageBrand();
  layout.rect(MARGIN_X, layout.y - 92, PAGE_WIDTH - MARGIN_X * 2, 92, NAVY);
  layout.text(reportTitle, MARGIN_X + 18, layout.y - 32, 20, { bold: true, color: WHITE });
  layout.text(candidate, MARGIN_X + 18, layout.y - 55, 11, { bold: true, color: WHITE });
  layout.text(email, MARGIN_X + 18, layout.y - 72, 8.5, { color: WHITE });
  layout.text(`${copy.generated} ${date}`, PAGE_WIDTH - MARGIN_X - 155, layout.y - 72, 8, { color: GOLD });
  layout.y -= 112;
}

function buildCandidatePdf(input: {
  locale: Locale;
  answers: PublicOrientationAnswers;
  identity: PublicOrientationIdentity | null;
  email: string;
  generatedAt: Date;
}) {
  const locale = pdfLocale(input.locale);
  const copy = COPY[locale];
  const layout = new PdfLayout();
  const candidate = nameForPdf(input.identity, input.email);
  const date = generatedDate(locale, input.generatedAt);

  drawReportHeader(layout, copy.candidateReport, candidate, input.email, copy, date);

  if (input.locale === "ar") {
    layout.wrapped(copy.arabicFallback, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 9.5, {
      color: MUTED,
      gapAfter: 9,
    });
  }

  layout.heading(copy.identity);
  layout.labelValue(copy.firstName, input.identity?.firstName || "—");
  layout.labelValue(copy.lastName, input.identity?.lastName || "—");
  layout.labelValue(copy.birthDate, input.identity?.birthDate || "—");
  layout.labelValue(copy.email, input.email);

  layout.heading(copy.studies);
  layout.labelValue(copy.bacStatus, copy.bacStatuses[input.answers.bacStatus] || "—");
  layout.labelValue(copy.bacYear, input.answers.bacYear || "—");
  layout.labelValue(copy.bacTrack, input.answers.bacTrack || "—");
  layout.labelValue(copy.average, input.answers.generalAverage ? `${input.answers.generalAverage}/20` : "—");
  layout.labelValue(copy.diploma, input.answers.lastDiploma || "—");
  layout.labelValue(copy.currentStudies, input.answers.currentStudyField || "—");
  layout.labelValue(copy.semesters, input.answers.universitySemesters || "—");

  layout.heading(copy.languages);
  layout.labelValue(copy.german, input.answers.germanLevel || "—");
  layout.labelValue(copy.english, input.answers.englishLevel || "—");
  layout.labelValue(copy.studyLanguage, input.answers.studyLanguage || "—");

  layout.heading(copy.project);
  for (const [label, value] of projectRows(copy, input.answers)) {
    layout.labelValue(label, value);
  }

  layout.ensure(58);
  layout.wrapped(copy.disclaimer, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8.3, {
    color: MUTED,
    gapAfter: 0,
  });

  return buildPdf(layout.pages);
}

function drawDiagnosticList(
  layout: PdfLayout,
  title: string,
  items: { title: string; body: string }[],
) {
  if (!items.length) return;
  layout.heading(title, 14);
  for (const item of items) {
    layout.ensure(50);
    layout.wrapped(`- ${item.title}`, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 10.5, {
      bold: true,
      gapAfter: 2,
    });
    layout.wrapped(item.body, MARGIN_X + 12, PAGE_WIDTH - MARGIN_X * 2 - 12, 9, {
      color: MUTED,
      gapAfter: 8,
    });
  }
}

function buildOrientationPdf(input: {
  locale: Locale;
  answers: PublicOrientationAnswers;
  identity: PublicOrientationIdentity | null;
  email: string;
  diagnostic: PublicOrientationDiagnostic;
  personalized: OrientationPublicPersonalizedResult | null;
  generatedAt: Date;
}) {
  const locale = pdfLocale(input.locale);
  const copy = COPY[locale];
  const diagnosticCopy = orientationDiagnosticCopy[locale];
  const layout = new PdfLayout();
  const candidate = nameForPdf(input.identity, input.email);
  const date = generatedDate(locale, input.generatedAt);

  drawReportHeader(layout, copy.orientationReport, candidate, input.email, copy, date);

  if (input.locale === "ar") {
    layout.wrapped(copy.arabicFallback, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 9.5, {
      color: MUTED,
      gapAfter: 9,
    });
  }

  const headline = diagnosticCopy.headlines[input.diagnostic.headlineCode];
  layout.heading(copy.headline);
  layout.wrapped(headline.title, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 14, {
    bold: true,
    gapAfter: 5,
  });
  layout.wrapped(headline.body, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 9.5, {
    color: MUTED,
    gapAfter: 10,
  });

  if (input.personalized && input.locale !== "ar") {
    const content = input.personalized.content;
    const candidatePriority = orientationCandidatePriority(input.answers, input.locale);

    layout.wrapped(content.opening, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 10, {
      gapAfter: 7,
    });
    layout.wrapped(content.projectStatus, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 10, {
      bold: true,
      gapAfter: 10,
    });

    layout.heading(copy.priority, 14);
    layout.wrapped(candidatePriority?.title || content.mainPriority.title, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 12, {
      bold: true,
      gapAfter: 4,
    });
    layout.wrapped(candidatePriority?.text || content.mainPriority.text, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 9.5, {
      gapAfter: 4,
    });
    layout.wrapped(
      `${copy.nextStep}: ${candidatePriority?.yourStep || content.mainPriority.nextStep}`,
      MARGIN_X,
      PAGE_WIDTH - MARGIN_X * 2,
      9.5,
      { bold: true, color: RED, gapAfter: 10 },
    );

    if (content.studyOptions.length) {
      layout.heading(copy.programmes, 14);
      for (const option of content.studyOptions.slice(0, 4)) {
        layout.ensure(65);
        layout.wrapped(
          `${option.position}. ${option.programme} - ${option.institution}${option.city ? ` - ${option.city}` : ""}`,
          MARGIN_X,
          PAGE_WIDTH - MARGIN_X * 2,
          10.5,
          { bold: true, gapAfter: 3 },
        );
        layout.wrapped(option.whyItFits, MARGIN_X + 12, PAGE_WIDTH - MARGIN_X * 2 - 12, 9, {
          color: MUTED,
          gapAfter: 7,
        });
      }
    }

    if (content.roadmap.length) {
      layout.heading(copy.roadmap, 14);
      for (const [index, step] of content.roadmap.slice(0, 6).entries()) {
        layout.wrapped(
          `${index + 1}. ${step.label}: ${step.text}`,
          MARGIN_X,
          PAGE_WIDTH - MARGIN_X * 2,
          9.5,
          { gapAfter: 6 },
        );
      }
    }

    layout.ensure(45);
    layout.wrapped(content.reassurance, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 9.5, {
      bold: true,
      gapAfter: 8,
    });
  } else {
    drawDiagnosticList(
      layout,
      diagnosticCopy.sections.paths,
      input.diagnostic.paths.map((item) => diagnosticCopy.items[item.code]),
    );
    drawDiagnosticList(
      layout,
      diagnosticCopy.sections.priorities,
      input.diagnostic.priorities.map((item) => diagnosticCopy.items[item.code]),
    );
    drawDiagnosticList(
      layout,
      diagnosticCopy.sections.checks,
      input.diagnostic.checks.map((item) => diagnosticCopy.items[item.code]),
    );
  }

  layout.ensure(55);
  layout.wrapped(copy.disclaimer, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8.3, {
    color: MUTED,
  });

  return buildPdf(layout.pages);
}

export function buildOrientationEmailPdfAttachments(input: {
  locale: Locale;
  answers: PublicOrientationAnswers;
  identity: PublicOrientationIdentity | null;
  email: string;
  diagnostic: PublicOrientationDiagnostic;
  personalized: OrientationPublicPersonalizedResult | null;
  generatedAt?: Date;
}): PdfAttachment[] {
  const generatedAt = input.generatedAt || new Date();
  const orientation = buildOrientationPdf({ ...input, generatedAt });
  const candidate = buildCandidatePdf({
    locale: input.locale,
    answers: input.answers,
    identity: input.identity,
    email: input.email,
    generatedAt,
  });

  return [
    {
      filename: "orientation-campus-allemagne.pdf",
      contentBase64: orientation.toString("base64"),
      contentType: "application/pdf",
    },
    {
      filename: "rapport-candidat-campus-allemagne.pdf",
      contentBase64: candidate.toString("base64"),
      contentType: "application/pdf",
    },
  ];
}


/**
 * Third email attachment: a bounded, server-generated, multi-page dossier.
 * Does not depend on Chromium, third-party PDF services or user-provided image URLs.
 * Curated Wikimedia pictures are optional. The two existing attachments remain unchanged.
 */
type DetailedPdfInput = {
  locale: Locale;
  answers: PublicOrientationAnswers;
  identity: PublicOrientationIdentity | null;
  email: string;
  personalized: OrientationPublicPersonalizedResult;
  supplemental: readonly ResearchPiste[];
  generatedAt?: Date;
};

const DETAIL_NAVY: PdfColor = [0.075, 0.13, 0.20];
const DETAIL_SOFT: PdfColor = [0.965, 0.95, 0.93];
const DETAIL_GREEN: PdfColor = [0.14, 0.38, 0.28];
const MAX_IMAGE_BYTES = 900_000;

/** Supports ordinary 8-bit RGB JPEG; rejects oversized / unusual images. */
function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 100 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let index = 2;
  while (index + 10 < bytes.length) {
    if (bytes[index] !== 0xff) return null;
    while (bytes[index] === 0xff) index += 1;
    const marker = bytes[index++];
    if (marker === 0xd9 || marker === 0xda) break;
    if ([0x01, ...Array.from({ length: 8 }, (_, n) => 0xd0 + n)].includes(marker)) continue;
    const length = bytes.readUInt16BE(index);
    if (length < 2 || index + length > bytes.length) return null;
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      const height = bytes.readUInt16BE(index + 3);
      const width = bytes.readUInt16BE(index + 5);
      const channels = bytes[index + 7];
      return width > 0 && height > 0 && width <= 3000 && height <= 3000 && channels === 3
        ? { width, height } : null;
    }
    index += length;
  }
  return null;
}

async function licensedCuratedJpeg(institution: string, city: string | null) {
  const media = findCuratedUniversityMedia(institution, city);
  if (!media || !/^(?:CC0|CC BY(?:-SA)?\s)/i.test(media.coverImageLicense || "")) return null;
  const link = media.coverImageUrl;
  if (!link) return null;
  const url = new URL(link);
  if (url.protocol !== "https:" || url.hostname !== "upload.wikimedia.org") return null;
  try {
    const response = await fetch(url.toString(), {
      redirect: "error", cache: "no-store", signal: AbortSignal.timeout(3500),
      headers: { Accept: "image/jpeg" },
    });
    if (!response.ok || !/^image\/jpeg/i.test(response.headers.get("content-type") || "")) return null;
    if (Number(response.headers.get("content-length") || "0") > MAX_IMAGE_BYTES) return null;
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.length;
      if (size > MAX_IMAGE_BYTES) { await reader.cancel(); return null; }
      chunks.push(next.value);
    }
    const bytes = Buffer.concat(chunks);
    const geometry = jpegSize(bytes);
    return geometry ? { bytes, ...geometry, media } : null;
  } catch {
    // Network/media failure never prevents the confidential orientation email.
    return null;
  }
}

function detailTitle(locale: PdfLocale) {
  return locale === "fr" ? "Votre projet pour l'Allemagne prend forme."
    : locale === "de" ? "Dein Studienprojekt in Deutschland nimmt Form an."
    : "Your study project in Germany is taking shape.";
}

function detailLabel(locale: PdfLocale, fr: string, en: string, de: string) {
  return locale === "fr" ? fr : locale === "de" ? de : en;
}

function detailDivider(layout: PdfLayout, label: string) {
  layout.ensure(39);
  layout.rect(MARGIN_X, layout.y - 24, PAGE_WIDTH - MARGIN_X * 2, 30, DETAIL_NAVY);
  layout.text(label, MARGIN_X + 13, layout.y - 13, 13, { bold: true, color: WHITE });
  layout.y -= 44;
}

function detailParagraph(layout: PdfLayout, label: string, body: string, maxLines = 6) {
  layout.ensure(30);
  layout.text(label, MARGIN_X, layout.y, 9, { bold: true, color: RED });
  layout.y -= 16;
  const lines = wrapText(body, PAGE_WIDTH - MARGIN_X * 2, 9.4).slice(0, maxLines);
  for (const line of lines) {
    layout.ensure(13);
    layout.text(line, MARGIN_X, layout.y, 9.4, { color: NAVY });
    layout.y -= 13;
  }
  layout.y -= 9;
}

function safePdfSource(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.hostname : null;
  } catch { return null; }
}

export async function buildDetailedOrientationEmailPdfAttachment(
  input: DetailedPdfInput,
): Promise<PdfAttachment | null> {
  if (!input.personalized.selected.length) return null;
  const locale = pdfLocale(input.locale);
  const copy = COPY[locale];
  const layout = new PdfLayout();
  const content = input.personalized.content;
  const student = nameForPdf(input.identity, input.email);
  const priority = orientationCandidatePriority(input.answers, input.locale);
  const selected = [...input.personalized.selected].sort((a, b) => a.position - b.position).slice(0, 6);
  const supplemental = input.supplemental.slice(0, Math.max(0, 3 - selected.length));
  const entries = [...selected, ...supplemental];
  const photos = await Promise.all(entries.map((entry) => licensedCuratedJpeg(entry.institution, entry.city)));

  // Page 1: website-inspired branded dossier cover and personalised project plan.
  layout.drawPageBrand();
  layout.rect(MARGIN_X, layout.y - 164, PAGE_WIDTH - MARGIN_X * 2, 164, DETAIL_NAVY);
  layout.rect(MARGIN_X, layout.y - 4, PAGE_WIDTH - MARGIN_X * 2, 4, RED);
  layout.text("CAMPUS ALLEMAGNE", MARGIN_X + 18, layout.y - 28, 10, { bold: true, color: GOLD });
  layout.y -= 51;
  for (const line of wrapText(detailTitle(locale), PAGE_WIDTH - MARGIN_X * 2 - 38, 19, true).slice(0, 3)) {
    layout.text(line, MARGIN_X + 18, layout.y, 19, { bold: true, color: WHITE });
    layout.y -= 27;
  }
  layout.y = PAGE_HEIGHT - 54 - 151;
  layout.text(student, MARGIN_X + 18, layout.y, 10, { bold: true, color: WHITE });
  layout.y -= 37;
  layout.text(copy.generated + " " + generatedDate(locale, input.generatedAt || new Date()), MARGIN_X, layout.y, 9, { color: MUTED });
  layout.y -= 25;
  layout.heading(detailLabel(locale, "Votre profil", "Your profile", "Dein Profil"), 15);
  layout.labelValue(copy.degree, input.answers.targetDegree);
  layout.labelValue(copy.field, input.answers.targetField);
  layout.labelValue(copy.german, input.answers.germanLevel);
  layout.labelValue(copy.cities, input.answers.preferredCities.join(", ") || "—");

  detailDivider(layout, copy.priority);
  detailParagraph(layout, priority?.title || content.mainPriority.title,
    priority?.text || content.mainPriority.text, 8);
  detailParagraph(layout, copy.nextStep,
    priority?.yourStep || content.mainPriority.nextStep, 5);
  detailParagraph(layout, detailLabel(locale, "Notre suivi", "Our support", "Unsere Begleitung"),
    content.campusValue, 5);
  layout.wrapped(copy.disclaimer, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8.5, {
    color: MUTED,
  });

  // Subsequent pages: primary recommendations and separate, research-only programmes.
  for (let index = 0; index < entries.length; index += 1) {
    const option = entries[index];
    const primary = index < selected.length;
    const image = photos[index];
    layout.newPage();
    detailDivider(layout, primary
      ? detailLabel(locale, "Formation prioritaire", "Primary programme", "Vorrangiger Studiengang")
      : detailLabel(locale, "Université à découvrir", "University to explore", "Weitere Hochschule"));
    layout.text(String(index + 1).padStart(2, "0"), MARGIN_X, layout.y, 13, { bold: true, color: RED });
    layout.y -= 25;
    layout.wrapped(option.programme, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 17, {
      bold: true, gapAfter: 3, lineHeight: 21,
    });
    layout.wrapped(option.institution + (option.city ? " - " + option.city : ""),
      MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 11, { bold: true, gapAfter: 10 });
    if (image) {
      const photoHeight = 185;
      layout.ensure(photoHeight + 50);
      // Letterbox (no unlicensed crop or misleading enlargement).
      const ratio = image.width / image.height;
      const width = Math.min(PAGE_WIDTH - MARGIN_X * 2, photoHeight * ratio);
      layout.drawPhoto(image.bytes, image.width, image.height, MARGIN_X, layout.y - photoHeight, width, photoHeight);
      layout.y -= photoHeight + 8;
      layout.wrapped(
        "Photo: " + (image.media.coverImageAttribution || "Wikimedia Commons") + " - "
          + image.media.coverImageLicense + " - " + image.media.coverImageSourceUrl,
        MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 7, { color: MUTED, gapAfter: 10 },
      );
    } else {
      layout.wrapped(detailLabel(locale, "Photo autorisée indisponible", "Licensed photo unavailable", "Lizenziertes Foto nicht verfügbar"),
        MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8, { color: MUTED, gapAfter: 10 });
    }
    const writer = primary ? content.studyOptions.find((item) => item.optionId === selected[index].optionId) : null;
    const reason = primary ? writer?.whyItFits || ""
      : detailLabel(locale,
        "Piste documentée dans notre catalogue, à vérifier avec l'université avant toute candidature.",
        "Documented research option; university requirements remain to be checked.",
        "Dokumentierte Möglichkeit, Zulassungsvoraussetzungen müssen geprüft werden.");
    detailParagraph(layout, detailLabel(locale, "Pourquoi cette piste ?", "Why explore this option?", "Warum diese Option?"),
      reason.split(/première estimation campus allemagne|first campus allemagne estimate|erste einschätzung campus allemagne/i)[0], 7);
    const status = primary && selected[index].overallStatus === "verified"
      ? detailLabel(locale, "Informations vérifiées", "Verified information", "Verifizierte Angaben")
      : detailLabel(locale, "Vérification nécessaire", "Confirmation needed", "Prüfung erforderlich");
    layout.text(status, MARGIN_X, layout.y, 10, { bold: true, color: primary ? DETAIL_GREEN : RED });
    layout.y -= 19;
    if (primary) {
      const facts = selected[index].facts.filter((fact) => fact.status === "verified").slice(0, 5);
      for (const fact of facts) {
        const value = typeof fact.value === "string" ? fact.value
          : Array.isArray(fact.value) ? fact.value.join(", ") : String(fact.value);
        layout.wrapped(fact.field.replaceAll("_", " ") + ": " + value,
          MARGIN_X + 7, PAGE_WIDTH - MARGIN_X * 2 - 7, 8.6, { gapAfter: 3 });
      }
      const origins = [...new Set(facts.map((fact) => safePdfSource(fact.sourceUrl)).filter(Boolean))];
      if (origins.length) layout.wrapped(copy.project + ": " + origins.join(" / "),
        MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8.5, { color: MUTED, gapAfter: 3 });
    } else {
      layout.wrapped(detailLabel(locale, "Programme officiel", "Official programme", "Offizieller Studiengang")
        + ": " + ("officialUrl" in option ? option.officialUrl : ""),
      MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8.3, { color: RED, gapAfter: 5 });
    }
    layout.wrapped(copy.disclaimer, MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8, { color: MUTED });
  }

  layout.ensure(100);
  detailDivider(layout, copy.roadmap);
  for (const [index, step] of content.roadmap.slice(0, 5).entries()) {
    layout.wrapped(String(index + 1) + ". " + step.label + ": "
      + (index === 0 && priority ? priority.yourStep : step.text),
      MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8.8, { gapAfter: 6 });
  }
  layout.wrapped("Campus Allemagne - https://campusallemagne.tn/orientation",
    MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 10.2, { color: RED, bold: true });
  if (input.locale === "ar") layout.wrapped(copy.arabicFallback,
    MARGIN_X, PAGE_WIDTH - MARGIN_X * 2, 8, { color: MUTED });

  return {
    filename: "dossier-detaille-campus-allemagne.pdf",
    contentBase64: buildPdf(layout.pages, layout.images).toString("base64"),
    contentType: "application/pdf",
  };
}
