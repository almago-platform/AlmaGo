import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeValueSection } from "@/components/public/HomeValueSection";
import { HomeHumanSupportSection } from "@/components/public/HomeHumanSupportSection";
import { HomeJourneySection } from "@/components/public/HomeJourneySection";
import { HomeProductPreview } from "@/components/public/HomeProductPreview";
import { HomeTrustSection } from "@/components/public/HomeTrustSection";
import { HomeFaqSection } from "@/components/public/HomeFaqSection";
import { HomeFinalCta, HomeFooter } from "@/components/public/HomeClosing";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <HomeHero />
      <HomeValueSection />
      <HomeHumanSupportSection />
      <HomeJourneySection />
      <HomeProductPreview />
      <HomeTrustSection />
      <HomeFaqSection />
      <HomeFinalCta />
      <HomeFooter />
    </main>
  );
}
