/**
 * Small, reusable, editorially curated portfolio of REAL campus-life photos.
 * Wikimedia file metadata and licenses were reviewed on 2026-10-10.
 * Image bytes remain on Wikimedia; the stable source/credit metadata is stored
 * here until AlmaGo deploys a licensed local-media ingestion pipeline.
 * CC licenses do not imply endorsement by pictured students or universities.
 */
import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export type CuratedLifePhoto = {
  id: string;
  imageUrl: string;
  sourceUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  description: string;
  place: string;
};

export const STUDENT_LIFE_PHOTOS: readonly CuratedLifePhoto[] = [
  {
    id: "bayreuth-campus",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Studierende-campus-rondell.jpg/1280px-Studierende-campus-rondell.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Studierende-campus-rondell.jpg",
    author: "Olga Gassan BT",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    description: "Étudiants sur un campus universitaire à Bayreuth",
    place: "Bayreuth, Allemagne",
  },
  {
    id: "augsburg-campus",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/db/Campus_impressionen.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Campus_impressionen.jpg",
    author: "Fotostelle der Universität Augsburg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    description: "Étudiants sur le campus universitaire d'Augsbourg",
    place: "Augsbourg, Allemagne",
  },
] as const;

/** Matches the student journey, not any inferred personal characteristic. */
export function selectStudentLifePhoto(
  answers?: Pick<PublicOrientationAnswers, "bacStatus" | "targetDegree"> | null,
): CuratedLifePhoto {
  if (answers?.bacStatus === "preparing") return STUDENT_LIFE_PHOTOS[1];
  return STUDENT_LIFE_PHOTOS[0];
}
