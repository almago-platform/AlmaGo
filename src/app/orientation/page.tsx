import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicOrientationForm } from "@/components/orientation/PublicOrientationForm";
import { isPhase2AccessEnabled, isPhase2ProspectCaptureEnabled } from "@/lib/phase2/config";

export const metadata: Metadata = {
  title: "Orientation gratuite",
  description: "Commencez votre projet d’études en Allemagne avec une orientation courte, sans compte.",
};

export default function OrientationPage() {
  if (!isPhase2AccessEnabled()) notFound();
  return <PublicOrientationForm prospectCaptureEnabled={isPhase2ProspectCaptureEnabled()} />;
}
