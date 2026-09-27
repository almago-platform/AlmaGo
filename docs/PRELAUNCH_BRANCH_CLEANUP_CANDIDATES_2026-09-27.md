# AlmaGo — branch cleanup candidates with exact merged-tip evidence

Date: 27 September 2026

This appendix is evidence only. It does **not** authorize deletion.

Current branches whose **current tip SHA exactly equals the head SHA of a merged pull request**: **103**.

Before deleting any branch, still exclude active automation references, deliberate archive/experiment references and any branch specifically retained by the owner.

| Branch | Merged PR | Tip SHA | Merged at |
| --- | ---: | --- | --- |
| `agent/chatgpt/245-lot3-workflow-recovery` | #261 | `e8bbc9131040` | 2026-09-26T10:27:01Z |
| `agent/chatgpt/249-germany-integration-flat` | #278 | `ef4ef932dac6` | 2026-09-26T11:24:55Z |
| `agent/chatgpt/254-operational-academic-evidence` | #273 | `ee82e3d0fd01` | 2026-09-26T10:49:29Z |
| `agent/chatgpt/255-visible-academic-evidence` | #276 | `a7b79f7b3de7` | 2026-09-26T11:12:58Z |
| `agent/chatgpt/257-lot0-4-integration-regression` | #262 | `9061e68c01d0` | 2026-09-26T10:25:22Z |
| `agent/chatgpt/258-admin-application-ops-ux` | #267 | `a79073c47f38` | 2026-09-26T10:36:31Z |
| `agent/chatgpt/263-academic-evidence-concurrency-fix` | #265 | `4104cc99e2af` | 2026-09-26T10:34:47Z |
| `agent/chatgpt/263-academic-evidence-concurrency-fix-v2` | #268 | `4989cf87199b` | 2026-09-26T10:36:38Z |
| `agent/chatgpt/264-lot5-student-language-read` | #272 | `bb0faab512a9` | 2026-09-26T10:44:43Z |
| `agent/chatgpt/274-student-language-courses-ux` | #275 | `6cd0730270fb` | 2026-09-26T11:00:25Z |
| `agent/chatgpt/copilot-autopilot-phase1-recovery` | #283 | `334ea714024d` | 2026-09-26T13:10:24Z |
| `agent/chatgpt/manual-germany-lot0-8-main` | #291 | `aafcaf90485d` | 2026-09-26T17:06:54Z |
| `agent/codex-desktop/256-lot5-language-foundation` | #259 | `784c2935c8db` | 2026-09-26T10:01:52Z |
| `agent/codex-desktop/260-lot6-regulatory-engine-core` | #271 | `f95052d73180` | 2026-09-26T10:42:50Z |
| `agent/codex-desktop/281-lot8-finance-insurance-foundation` | #282 | `2fe9942997a9` | 2026-09-26T13:06:18Z |
| `agent/codex/242-academic-evidence-persistence` | #243 | `01fe9a0ebb2e` | 2026-09-26T08:38:58Z |
| `brand/v2-final-integration` | #341 | `592838c7fe2f` | 2026-09-27T12:50:56Z |
| `chore/final-gates-a44-a45-prep` | #302 | `4bc41c1d5934` | 2026-09-26T19:33:24Z |
| `chore/v3-a44-observability-readiness-gate-20260925` | #210 | `4b17a74ded18` | 2026-09-25T08:46:17Z |
| `ci/render-prebuild-tests` | #392 | `d3fb309edb31` | 2026-09-27T18:38:36Z |
| `copilot/almago-platform-almago-237` | #244 | `4010cac2723c` | 2026-09-26T08:38:41Z |
| `copilot/almago-platform-execute-issue-236` | #241 | `b1d662d75d86` | 2026-09-26T08:38:38Z |
| `copilot/almago-platformalmago247` | #252 | `60138aea9ef8` | 2026-09-26T09:49:57Z |
| `data/real-germany-university-program-catalog-2026-09-26` | #303 | `52aac76420b0` | 2026-09-26T19:40:40Z |
| `db/v3-null-safe-application-uniqueness-proposal-20260925` | #204 | `2099c91ad33e` | 2026-09-25T08:21:18Z |
| `design/admin-v2-operational-workspace` | #374 | `599591de87cc` | 2026-09-27T17:17:58Z |
| `design/authenticated-entry-v2` | #378 | `676991a62746` | 2026-09-27T17:24:18Z |
| `design/authenticated-surfaces-v2` | #380 | `5493c97759d7` | 2026-09-27T17:30:14Z |
| `design/compact-tools-faq` | #363 | `c21dc24600da` | 2026-09-27T14:50:11Z |
| `design/home-helpful-tools` | #359 | `c84733c2dcf0` | 2026-09-27T14:39:15Z |
| `design/home-trust-polish` | #357 | `dc07c2feeb7f` | 2026-09-27T14:32:30Z |
| `design/homepage-v3-premium-gate` | #326 | `ed8cba360333` | 2026-09-26T21:54:41Z |
| `design/homepage-v5-density-hero` | #347 | `684667510034` | 2026-09-27T13:43:42Z |
| `design/homepage-v6-visual-density` | #349 | `f407df371327` | 2026-09-27T13:54:40Z |
| `design/homepage-v7-1-product-showcase` | #353 | `02e75d044498` | 2026-09-27T14:21:14Z |
| `design/homepage-v7-validated-immersive` | #351 | `4ad627fe680b` | 2026-09-27T14:14:39Z |
| `design/homepage-v8-final-public-polish` | #365 | `254f97947050` | 2026-09-27T15:03:03Z |
| `design/human-pro-h1-h2` | #323 | `db4e833bc689` | 2026-09-26T21:31:02Z |
| `design/human-pro-h3-pages` | #324 | `59bb6d9aa2f4` | 2026-09-26T21:33:05Z |
| `design/pro-wave1-institutional-public` | #311 | `c08ca3671d45` | 2026-09-26T20:41:24Z |
| `design/pro-wave2-student-shell-dashboard` | #312 | `240f71c2de0a` | 2026-09-26T20:43:42Z |
| `design/pro-wave3-pathway-checklist` | #313 | `18b559a3e10a` | 2026-09-26T20:45:28Z |
| `design/pro-wave4-student-operational-surfaces` | #314 | `b435d1d9b448` | 2026-09-26T20:48:28Z |
| `design/pro-wave5-admin-auth-coherence` | #315 | `3c1df800ade3` | 2026-09-26T20:51:12Z |
| `design/pro-wave6-documents-profile-preview` | #316 | `0d07789b5f1d` | 2026-09-26T20:53:37Z |
| `design/pro-wave7-onboarding-project-profile` | #317 | `3186a12e7fd7` | 2026-09-26T20:55:28Z |
| `design/pro-wave8-visual-qa-polish` | #318 | `443e69b0aea6` | 2026-09-26T21:11:19Z |
| `design/public-mobile-final` | #367 | `4b2aadc28345` | 2026-09-27T15:12:47Z |
| `design/remove-home-utility-strip` | #361 | `da9cb7b9634e` | 2026-09-27T14:43:09Z |
| `design/remove-home-why-almago` | #355 | `9f713c47c45b` | 2026-09-27T14:27:04Z |
| `design/signup-professional-v2` | #369 | `8547953b387f` | 2026-09-27T15:30:46Z |
| `design/student-dashboard-v2` | #373 | `f9bd3e384709` | 2026-09-27T16:06:35Z |
| `design/student-journey-v2` | #376 | `7fb17e7adf7f` | 2026-09-27T17:22:02Z |
| `design/student-onboarding-v2` | #371 | `87e6b7fbf7fe` | 2026-09-27T16:01:32Z |
| `design/work-v4-full-rollout` | #339 | `a0c72e597dc5` | 2026-09-27T12:35:50Z |
| `docs/v3-application-insert-rls-boundary-20260925` | #201 | `f564a3b442b5` | 2026-09-25T07:53:36Z |
| `docs/v3-catalogue-rls-read-boundary-20260925` | #199 | `fbb337c97090` | 2026-09-25T07:37:54Z |
| `docs/v3-data-api-write-boundary-20260925` | #200 | `7e58a636455d` | 2026-09-25T07:48:47Z |
| `experiment/homepage-v4-codex-challenger` | #337 | `c6584adf3be8` | 2026-09-27T12:24:29Z |
| `feat/admin-catalog-revalidation-action` | #301 | `e3c3995871f0` | 2026-09-26T19:21:04Z |
| `feat/admin-catalog-revalidation-dashboard` | #300 | `c1d16f686de2` | 2026-09-26T19:19:22Z |
| `feat/admin-germany-catalogues` | #295 | `aa5b6ba1dee8` | 2026-09-26T18:37:42Z |
| `feat/catalog-freshness-expiry` | #299 | `d1ecd1e20e38` | 2026-09-26T19:16:26Z |
| `feat/personalized-germany-checklist` | #305 | `6213b15a9b51` | 2026-09-26T19:53:44Z |
| `feat/student-filing-country-regulatory-scope` | #298 | `de79fe329f38` | 2026-09-26T19:09:31Z |
| `feat/student-finance-insurance-pathway` | #294 | `978c876b795c` | 2026-09-26T18:33:02Z |
| `feat/student-germany-pathway` | #293 | `b75e530faca7` | 2026-09-26T17:58:05Z |
| `feat/student-language-course-selection` | #304 | `f080d5e1be51` | 2026-09-26T19:43:55Z |
| `feat/student-regulatory-source-provenance` | #296 | `a0274f398a1d` | 2026-09-26T18:53:29Z |
| `feat/v3-admin-operations-cockpit-20260924` | #190 | `760bd2bdb6bd` | 2026-09-24T20:54:56Z |
| `feat/v3-admin-student-case-20260924` | #188 | `43cfc938a946` | 2026-09-24T20:40:07Z |
| `feat/v3-germany-academic-visa-path-20260924` | #197 | `7f3bc537086b` | 2026-09-24T21:50:28Z |
| `feat/v3-student-deadlines-center-20260924` | #174 | `8fda846e55bc` | 2026-09-24T20:39:19Z |
| `feat/verified-germany-catalog-seed-2026-09-26` | #297 | `f8d01892c2eb` | 2026-09-26T19:07:06Z |
| `fix/onboarding-null-values` | #321 | `b6191d1dd92a` | 2026-09-26T21:19:08Z |
| `fix/profile-partial-name-hardening` | #234 | `9690b3f9c4b5` | 2026-09-26T16:44:21Z |
| `fix/student-shell-germany-navigation` | #292 | `dea7aa286969` | 2026-09-26T17:50:38Z |
| `fix/v3-catalogue-fixture-cleanup-ui-v2-20260925` | #211 | `bf14d3ef3bc6` | 2026-09-25T08:55:51Z |
| `fix/v3-catalogue-fixture-guard-20260924` | #194 | `a523999824ef` | 2026-09-24T21:25:23Z |
| `fix/v3-catalogue-fixture-prevention-20260924` | #198 | `5ecc58e822f8` | 2026-09-25T07:30:01Z |
| `fix/v3-hide-unverified-orientation-20260924` | #177 | `8acc0865ffea` | 2026-09-24T20:39:19Z |
| `hotfix/profile-upsert-permission` | #409 | `26b50749e04a` | 2026-09-27T19:42:28Z |
| `infra/render-production` | #345 | `8b58b2ad8521` | 2026-09-27T13:18:55Z |
| `integration/v3-deadlines-orientation-20260924` | #187 | `fd1ccb862c91` | 2026-09-24T20:39:17Z |
| `ops/render-health-revision` | #388 | `e656ce6f2559` | 2026-09-27T18:33:09Z |
| `phase6/telemetry-value-boundary` | #94 | `c0e00319ef29` | 2026-09-23T19:20:33Z |
| `polish/brand-v2-1-homepage` | #343 | `86637047f6fd` | 2026-09-27T13:01:11Z |
| `quality/admin-v2-m10-final-20260924` | #136 | `5f59e4c98fd5` | 2026-09-24T08:36:49Z |
| `quality/student-v2-e10-final-20260924` | #124 | `f305d49972d1` | 2026-09-24T07:03:05Z |
| `security/applications-null-safe-uniqueness` | #307 | `1c9b5072a29b` | 2026-09-26T20:02:34Z |
| `security/catalog-rls-and-application-boundary` | #308 | `a978cfcf2fd8` | 2026-09-26T20:05:06Z |
| `security/document-file-signatures` | #386 | `a0f0b13f6242` | 2026-09-27T18:32:06Z |
| `security/prelaunch-database-baseline` | #306 | `55b1cb7869d2` | 2026-09-26T20:01:32Z |
| `security/prelaunch-web-hardening` | #382 | `0534a1dae0bd` | 2026-09-27T18:25:34Z |
| `security/profile-notification-write-boundary` | #309 | `be177e8fc540` | 2026-09-26T20:09:17Z |
| `security/student-admin-isolation-qa` | #319 | `ac475192ec69` | 2026-09-26T21:12:23Z |
| `security/student-api-role-boundary` | #384 | `3e33619a5dcb` | 2026-09-27T18:29:18Z |
| `security/v3-application-rls-verified-program-proposal-20260925` | #203 | `da8614a31f32` | 2026-09-25T08:17:48Z |
| `security/v3-catalogue-read-rls-proposal-20260925` | #208 | `3548921331a4` | 2026-09-25T08:31:01Z |
| `security/v3-notification-profile-data-api-proposal-20260925` | #207 | `4251b1142911` | 2026-09-25T08:27:20Z |
| `security/v3-revoke-unused-authenticated-privileges-proposal-20260925` | #206 | `72be387162f9` | 2026-09-25T08:26:05Z |
| `test/current-main-contract-repair` | #394 | `299a56b406ba` | 2026-09-27T18:41:51Z |
| `test/current-main-contract-repair-2` | #397 | `8a5e03490b31` | 2026-09-27T18:43:33Z |

No branch was deleted while producing this list.
