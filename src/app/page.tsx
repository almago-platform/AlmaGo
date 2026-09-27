import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeQuickAccess } from "@/components/public/HomeQuickAccess";
import { HomeProductPreview } from "@/components/public/HomeProductPreview";
import { HomeJourneySection } from "@/components/public/HomeJourneySection";
import { HomePhotoBand } from "@/components/public/HomePhotoBand";
import { HomeTrustSection } from "@/components/public/HomeTrustSection";
import { HomeFaqSection } from "@/components/public/HomeFaqSection";
import { HomeFinalCta, HomeFooter } from "@/components/public/HomeClosing";
import s from "@/components/public/Homepage.module.css";

export default function Home() {
  return (
    <div className={s.home}>
      <a className={s.skipLink} href="#main-content">
        Aller au contenu
      </a>
      <HomeHeader />
      <main id="main-content" tabIndex={-1}>
        <HomeHero />
        <HomeQuickAccess />
        <HomeProductPreview />
        <HomePhotoBand />
        <HomeJourneySection />
        <HomeTrustSection />
        <HomeFaqSection />
        <HomeFinalCta />
      </main>
      <HomeFooter />
    </div>
  );
}
