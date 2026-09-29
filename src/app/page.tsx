import { cookies } from "next/headers";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeQuickAccess } from "@/components/public/HomeQuickAccess";
import { HomeJourneySection } from "@/components/public/HomeJourneySection";
import { HomePhotoBand } from "@/components/public/HomePhotoBand";
import { HomeTrustSection } from "@/components/public/HomeTrustSection";
import { HomeFaqSection } from "@/components/public/HomeFaqSection";
import { HomeFinalCta, HomeFooter } from "@/components/public/HomeClosing";
import { getNativeCopy } from "@/content/native-copy";
import { rebrandCopy } from "@/lib/brand";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";
import s from "@/components/public/Homepage.module.css";

export default async function Home() {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const copy = rebrandCopy(getNativeCopy(locale));

  return (
    <div className={s.home}>
      <a className={s.skipLink} href="#main-content">
        {copy.common.skip}
      </a>
      <HomeHeader />
      <main id="main-content" tabIndex={-1}>
        <HomeHero hero={copy.home.hero} />
        <HomeQuickAccess quick={copy.home.quick} />
        <HomePhotoBand photo={copy.home.photo} />
        <HomeJourneySection journey={copy.home.journey} />
        <HomeTrustSection tools={copy.home.tools} />
        <HomeFaqSection faq={copy.home.faq} />
        <HomeFinalCta closing={copy.home.closing} />
      </main>
      <HomeFooter footer={copy.home.footer} homeAria={copy.common.homeAria} />
    </div>
  );
}
