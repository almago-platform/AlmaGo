import { cookies } from "next/headers";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeQuickAccess } from "@/components/public/HomeQuickAccess";
import { HomeProductPreview } from "@/components/public/HomeProductPreview";
import { HomeJourneySection } from "@/components/public/HomeJourneySection";
import { HomePhotoBand } from "@/components/public/HomePhotoBand";
import { HomeTrustSection } from "@/components/public/HomeTrustSection";
import { HomeFaqSection } from "@/components/public/HomeFaqSection";
import { HomeFinalCta, HomeFooter } from "@/components/public/HomeClosing";
import { getNativeCopy } from "@/content/native-copy";
import { rebrandCopy } from "@/lib/brand";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";
import { isPhase2AccessEnabled } from "@/lib/phase2/config";
import s from "@/components/public/Homepage.module.css";

export default async function Home() {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const copy = rebrandCopy(getNativeCopy(locale));
  const phase2Enabled = isPhase2AccessEnabled();

  return (
    <div className={s.home}>
      <a className={s.skipLink} href="#main-content">
        {copy.common.skip}
      </a>
      <HomeHeader phase2Enabled={phase2Enabled} />
      <main id="main-content" tabIndex={-1}>
        <HomeHero
          hero={copy.home.hero}
          primaryHref={phase2Enabled ? "/orientation" : "/signup"}
          primaryLabel={phase2Enabled ? copy.home.hero.orientationPrimary : copy.home.hero.primary}
        />
        <HomeQuickAccess quick={copy.home.quick} />
        <HomeProductPreview />
        <HomePhotoBand photo={copy.home.photo} />
        <HomeJourneySection
          journey={copy.home.journey}
          primaryHref={phase2Enabled ? "/orientation" : "/signup"}
          primaryLabel={phase2Enabled ? copy.home.hero.orientationPrimary : copy.home.journey.cta}
        />
        <HomeTrustSection
          tools={copy.home.tools}
          primaryHref={phase2Enabled ? "/orientation" : "/signup"}
          primaryLabel={phase2Enabled ? copy.home.hero.orientationPrimary : undefined}
        />
        <HomeFaqSection faq={copy.home.faq} />
        <HomeFinalCta
          closing={copy.home.closing}
          primaryHref={phase2Enabled ? "/orientation" : "/signup"}
          primaryLabel={phase2Enabled ? copy.home.hero.orientationPrimary : copy.home.closing.cta}
        />
      </main>
      <HomeFooter
        footer={copy.home.footer}
        homeAria={copy.common.homeAria}
        phase2Enabled={phase2Enabled}
        orientationLabel={copy.home.nav.orientation}
      />
    </div>
  );
}
