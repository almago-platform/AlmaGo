# Automation failure handling

AlmaGo watches canonical PR CI and Browser Quality results for bounded automation branches named `automation/issue-N`.

If either workflow fails, the linked Master Plan issue is moved to `almago-ai-blocked`, stale `almago-ai-running` / `almago-ai-proposed` labels are removed, and the failed workflow run is linked in a deduplicated comment.

The watcher deliberately does **not** spend another Gemini/Grok call. Recovery stays explicit and cannot create a paid retry loop.

Browser Quality also includes a compact Chromium project at **320 × 720** in addition to the standard mobile and desktop projects, so small-screen overflow and accessibility regressions are checked continuously.
