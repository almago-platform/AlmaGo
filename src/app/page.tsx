import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeQuickAccess } from "@/components/public/HomeQuickAccess";
import { HomeProductPreview } from "@/components/public/HomeProductPreview";
import { HomeValueSection } from "@/components/public/HomeValueSection";
import { HomeJourneySection } from "@/components/public/HomeJourneySection";
import { HomeHumanSupportSection } from "@/components/public/HomeHumanSupportSection";
import { HomeTrustSection } from "@/components/public/HomeTrustSection";
import { HomeFaqSection } from "@/components/public/HomeFaqSection";
import { HomeFinalCta, HomeFooter } from "@/components/public/HomeClosing";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <HomeHero />
      <HomeQuickAccess />
      <HomeProductPreview />
      <HomeValueSection />
      <HomeJourneySection />
      <HomeHumanSupportSection />
      <HomeTrustSection />
      <HomeFaqSection />
      <HomeFinalCta />
      <HomeFooter />
    </main>
  );
}
