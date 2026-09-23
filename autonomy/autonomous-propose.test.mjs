import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTask, validatePatch } from './autonomous-propose.mjs';

const issue = { number: 17, title: 'Improve the landing page', body: '<!-- almago-ai-task -->\nFiles:\n- src/app/page.tsx\nGoal: make the next action clear.' };

test('accepts a bounded task with an exact source path', () => {
  assert.deepEqual(parseTask(issue).files, ['src/app/page.tsx']);
});

test('rejects protected paths and traversal', () => {
  for (const file of ['.github/workflows/ci.yml', 'src/app/../../.env', 'supabase/migrations/a.sql']) {
    assert.throws(() => parseTask({ ...issue, body: `<!-- almago-ai-task -->\nFiles:\n- ${file}\nGoal: change it.` }));
  }
});

test('accepts an exact-file unified diff but refuses extra paths and deletions', () => {
  const patch = 'diff --git a/src/app/page.tsx b/src/app/page.tsx\n--- a/src/app/page.tsx\n+++ b/src/app/page.tsx\n@@ -1 +1 @@\n-old\n+new\n';
  assert.deepEqual(validatePatch(patch, ['src/app/page.tsx']), ['src/app/page.tsx']);
  assert.throws(() => validatePatch(patch.replaceAll('src/app/page.tsx', 'src/app/login/page.tsx'), ['src/app/page.tsx']));
  assert.throws(() => validatePatch(patch.replace('--- a/', 'deleted file mode 100644\n--- a/'), ['src/app/page.tsx']));
  assert.throws(() => validatePatch(patch.replace('+++ b/src/app/page.tsx', '+++ b/src/app/login/page.tsx'), ['src/app/page.tsx']));
});
