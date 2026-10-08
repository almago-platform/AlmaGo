"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import type { HomepageV42Copy } from "@/content/homepage-v42-copy";
import { HomeIcon, type HomeIconName } from "./HomeIcons";
import s from "./Homepage.module.css";

const freeIcons: readonly HomeIconName[] = ["profile", "university", "route"];
const clientIcons: readonly HomeIconName[] = ["document", "book", "clock", "question"];

export function HomeExperiencePreview({
  copy,
  freeHref,
  rtl = false,
}: {
  copy: HomepageV42Copy["experience"];
  freeHref: string;
  rtl?: boolean;
}) {
  const [active, setActive] = useState<"free" | "client">("free");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = [copy.freeTab, copy.clientTab] as const;
  const isFree = active === "free";

  function handleTabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    let target: number | null = null;
    if (event.key === forward) target = (index + 1) % tabs.length;
    if (event.key === backward) target = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = tabs.length - 1;
    if (target === null) return;
    event.preventDefault();
    setActive(target === 0 ? "free" : "client");
    refs.current[target]?.focus();
  }

  const items = isFree ? copy.freeItems : copy.clientItems;
  const icons = isFree ? freeIcons : clientIcons;

  return (
    <section id="espace" className={s.v42Experience} aria-labelledby="v42-experience-title">
      <div className={s.container}>
        <div className={s.v42ExperienceHeading}>
          <p className={s.v42Eyebrow}>{copy.eyebrow}</p>
          <h2 id="v42-experience-title" className={s.v42Heading}>{copy.title}</h2>
          <p className={s.v42Intro}>{copy.intro}</p>
        </div>
        <div className={s.v42ExperienceShell}>
          <div className={s.v42ExperienceTop}>
            <div className={s.v42Tablist} role="tablist" aria-label={copy.eyebrow}>
              {tabs.map((label, index) => {
                const selected = active === (index === 0 ? "free" : "client");
                return (
                  <button
                    key={label}
                    ref={(el) => { refs.current[index] = el; }}
                    type="button"
                    id={`v42-tab-${index}`}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`v42-panel-${index}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(index === 0 ? "free" : "client")}
                    onKeyDown={(event) => handleTabKeys(event, index)}
                  >{label}</button>
                );
              })}
            </div>
            <span className={s.v42Fiction}><HomeIcon name="source" /> {copy.illustration}</span>
          </div>
          {tabs.map((tab, index) => {
            const visible = active === (index === 0 ? "free" : "client");
            const localItems = index === 0 ? copy.freeItems : copy.clientItems;
            return (
              <div
                key={tab}
                id={`v42-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`v42-tab-${index}`}
                tabIndex={0}
                hidden={!visible}
                className={s.v42ExperiencePanel}
              >
                <div className={s.v42ExperiencePanelHead}>
                  <div>
                    <p className={s.v42PanelKicker}>{index === 0 ? copy.freeTab : copy.clientTab}</p>
                    <h3>{index === 0 ? copy.freeTitle : copy.clientTitle}</h3>
                    <p>{index === 0 ? copy.freeIntro : copy.clientIntro}</p>
                  </div>
                  <span className={s.v42PanelSymbol} aria-hidden="true">
                    <HomeIcon name={index === 0 ? "compass" : "folder"} />
                  </span>
                </div>
                <div className={s.v42FeatureGrid}>
                  {localItems.map(([title, detail], itemIndex) => (
                    <article className={s.v42Feature} key={title}>
                      <span className={s.v42FeatureIcon} aria-hidden="true">
                        <HomeIcon name={(index === 0 ? freeIcons : clientIcons)[itemIndex]} />
                      </span>
                      <h4>{title}</h4>
                      <p>{detail}</p>
                    </article>
                  ))}
                </div>
                <div className={s.v42PanelFoot}>
                  <p><HomeIcon name="source" /> {index === 0 ? copy.freeNote : copy.clientNote}</p>
                  <Link href={index === 0 ? freeHref : "/contact"} className={s.v42PanelAction}>
                    {index === 0 ? copy.freeCta : copy.clientCta}<HomeIcon name="arrow" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
