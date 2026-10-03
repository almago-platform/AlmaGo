import { cookies } from "next/headers";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeLanding } from "@/components/public/HomeLanding";
import { HomeFooter } from "@/components/public/HomeClosing";
import { homepageRedesignCopy } from "@/content/homepage-redesign-copy";
import { getNativeCopy } from "@/content/native-copy";
import { rebrandCopy } from "@/lib/brand";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";
import { isPhase2AccessEnabled } from "@/lib/phase2/config";
import s from "@/components/public/Homepage.module.css";

export default async function Home() {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const nativeCopy = rebrandCopy(getNativeCopy(locale));
  const landingCopy = rebrandCopy(homepageRedesignCopy[locale]);
  const phase2Enabled = isPhase2AccessEnabled();
  const primaryHref = phase2Enabled ? "/orientation" : "/signup";

  return (
    <div className={s.home}>
      <a className={s.skipLink} href="#main-content">
        {nativeCopy.common.skip}
      </a>
      <HomeHeader phase2Enabled={phase2Enabled} />
      <main id="main-content" tabIndex={-1}>
        <HomeLanding copy={landingCopy} primaryHref={primaryHref} />
      </main>
      <HomeFooter
        footer={nativeCopy.home.footer}
        homeAria={nativeCopy.common.homeAria}
        phase2Enabled={phase2Enabled}
        orientationLabel={nativeCopy.home.nav.orientation}
      />
    </div>
  );
}
