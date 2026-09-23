# Automation failure handling

If canonical CI or Browser Quality fails on an `automation/issue-N` PR, AlmaGo marks the associated Master Plan issue `almago-ai-blocked`, removes running/proposed labels, and links the failed run.

The watcher deliberately does **not** spend another Gemini/Grok call. This keeps failure recovery explicit and prevents retry loops from consuming the provider budget.
