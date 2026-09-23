# Automation failure handling

AlmaGo watches canonical **PR CI** and **Browser Quality** results for bounded automation branches named `automation/issue-N`.

If either workflow fails on the exact current PR HEAD:

- the linked Master Plan issue must carry `almago-plan`;
- stale `almago-ai-running` / `almago-ai-proposed` labels are removed;
- `almago-ai-blocked` is added;
- the workflow name, exact HEAD SHA and failed run are recorded once;
- **no extra Gemini/Grok provider call is spent automatically**.

Recovery stays explicit: inspect the failure, fix the cause, then deliberately return the task to `almago-ai-ready`.

The watcher ignores ordinary manual branches such as `plan/*`, `fix/*` and `chore/*`.

Browser Quality already includes a compact Chromium project at **320 × 720**, plus standard mobile and desktop projects, so small-screen overflow and accessibility regressions are checked continuously.
