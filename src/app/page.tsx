"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeQuickAccess } from "@/components/public/HomeQuickAccess";
import { HomeJourneySection } from "@/components/public/HomeJourneySection";
import { HomePhotoBand } from "@/components/public/HomePhotoBand";
import { HomeTrustSection } from "@/components/public/HomeTrustSection";
import { HomeFaqSection } from "@/components/public/HomeFaqSection";
import { HomeFinalCta, HomeFooter } from "@/components/public/HomeClosing";
import s from "@/components/public/Homepage.module.css";

export default function Home() {
  const { copy } = useLocale();

  return (
    <div className={s.home}>
      <a className={s.skipLink} href="#main-content">
        {copy.common.skip}
      </a>
      <HomeHeader />
      <main id="main-content" tabIndex={-1}>
        <HomeHero />
        <HomeQuickAccess />
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
