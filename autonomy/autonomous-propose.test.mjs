import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPatchFromStructuredEdits, isProtectedPath, isRetryableProviderError, parseTask, promptFor, validatePatch } from './autonomous-propose.mjs';

const issue = {
  number: 17,
  title: 'Improve the landing page',
  body: '<!-- almago-ai-task -->\nFiles:\n- src/app/page.tsx\nGoal: make the next action clear.',
};

test('accepts bounded tasks with exact safe app and content source paths', () => {
  assert.deepEqual(parseTask(issue).files, ['src/app/page.tsx']);
  assert.deepEqual(parseTask({
    ...issue,
    body: '<!-- almago-ai-task -->\nFiles:\n- src/content/student-documents-copy.ts\nGoal: improve Arabic copy.',
  }).files, ['src/content/student-documents-copy.ts']);
});

test('rejects protected paths, infrastructure and traversal', () => {
  for (const file of [
    '.github/workflows/ci.yml',
    'src/app/../../.env',
    'supabase/migrations/a.sql',
    'src/app/api/admin/route.ts',
    'src/app/admin/page.tsx',
    'src/app/login/page.tsx',
    'src/components/auth/AuthForm.tsx',
    'src/components/admin/AdminNav.tsx',
    'src/lib/supabase/server.ts',
    'src/lib/auth.ts',
    'src/lib/permissions.ts',
  ]) {
    assert.throws(() => parseTask({
      ...issue,
      body: `<!-- almago-ai-task -->\nFiles:\n- ${file}\nGoal: change it.`,
    }), file);
  }
});

test('protected path classifier covers auth, admin, API and Supabase boundaries', () => {
  for (const file of [
    'src/app/api/example/route.ts',
    'src/app/admin/page.tsx',
    'src/components/auth/AuthForm.tsx',
    'src/components/admin/AdminNav.tsx',
    'src/lib/supabase/server.ts',
    'src/lib/security.ts',
  ]) {
    assert.equal(isProtectedPath(file), true, file);
  }
  assert.equal(isProtectedPath('src/app/page.tsx'), false);
  assert.equal(isProtectedPath('src/components/ui/Card.tsx'), false);
  assert.equal(isProtectedPath('src/lib/phase4.ts'), false);
});

test('accepts an exact-file unified diff but refuses extra paths and deletions', () => {
  const patch = 'diff --git a/src/app/page.tsx b/src/app/page.tsx\n--- a/src/app/page.tsx\n+++ b/src/app/page.tsx\n@@ -1 +1 @@\n-old\n+new\n';
  assert.deepEqual(validatePatch(patch, ['src/app/page.tsx']), ['src/app/page.tsx']);
  assert.throws(() => validatePatch(
    patch.replaceAll('src/app/page.tsx', 'src/app/login/page.tsx'),
    ['src/app/page.tsx'],
  ));
  assert.throws(() => validatePatch(
    patch.replace('--- a/', 'deleted file mode 100644\n--- a/'),
    ['src/app/page.tsx'],
  ));
  assert.throws(() => validatePatch(
    patch.replace('+++ b/src/app/page.tsx', '+++ b/src/app/other/page.tsx'),
    ['src/app/page.tsx'],
  ));
});

test('refuses secret-like and authorization-sensitive additions', () => {
  const base = 'diff --git a/src/app/page.tsx b/src/app/page.tsx\n--- a/src/app/page.tsx\n+++ b/src/app/page.tsx\n@@ -1 +1 @@\n-old\n';
  for (const addition of [
    '+const key = process.env.OPENAI_API_KEY;\n',
    '+const key = process.env.GROQ_API_KEY;\n',
    '+const role = "service_role";\n',
    '+const table = "user_roles";\n',
    '+const admin = auth.admin;\n',
  ]) {
    assert.throws(() => validatePatch(base + addition, ['src/app/page.tsx']), addition);
  }
});

test('refuses dynamic code execution and oversized autonomous edits', () => {
  const dynamicPatch = 'diff --git a/src/app/page.tsx b/src/app/page.tsx\n--- a/src/app/page.tsx\n+++ b/src/app/page.tsx\n@@ -1 +1 @@\n-old\n+eval(userInput)\n';
  assert.throws(() => validatePatch(dynamicPatch, ['src/app/page.tsx']));

  const lines = Array.from({ length: 301 }, (_, index) => `+line ${index}`).join('\n');
  const largePatch = `diff --git a/src/app/page.tsx b/src/app/page.tsx\n--- a/src/app/page.tsx\n+++ b/src/app/page.tsx\n@@ -1,0 +1,301 @@\n${lines}\n`;
  assert.throws(() => validatePatch(largePatch, ['src/app/page.tsx']));
});


test('classifies only transient provider failures as retryable', () => {
  assert.equal(isRetryableProviderError({ retryable:true, message:'Provider HTTP 429' }), true);
  assert.equal(isRetryableProviderError({ name:'AbortError', message:'aborted' }), true);
  assert.equal(isRetryableProviderError({ message:'network connection failed' }), true);
  assert.equal(isRetryableProviderError({ status:401, message:'Provider HTTP 401' }), false);
});


test('Groq fallback prompt compacts large Arabic UX sources under the free-tier budget', () => {
  const compactTask = {
    number: 526,
    title: 'Arabic UX audit — Applications',
    body: '<!-- almago-ai-task -->\nFiles:\n- src/content/student-applications-copy.ts\n- src/components/student/StudentApplicationsPanel.tsx\nGoal: polish Arabic UX.',
    files: [
      'src/content/student-applications-copy.ts',
      'src/components/student/StudentApplicationsPanel.tsx',
    ],
  };
  const prompt = promptFor(compactTask, 15000);
  assert.match(prompt, /context compacted for free-provider limit/);
  assert.match(prompt, /const ar/);
  assert.ok(prompt.length < 20000, `compact prompt too large: ${prompt.length}`);
});


test('rejects provider diffs without a standard unified-diff hunk header', () => {
  const malformed = [
    'diff --git a/src/app/page.tsx b/src/app/page.tsx',
    '--- a/src/app/page.tsx',
    '+++ b/src/app/page.tsx',
    '-old',
    '+new',
    '',
  ].join('\n');
  assert.throws(
    () => validatePatch(malformed, ['src/app/page.tsx']),
    /missing a valid unified-diff hunk header/,
  );
});


test('provider-output validation errors can be classified for retry by the proposal loop', () => {
  const error = new Error('Patch is missing a valid unified-diff hunk header.');
  error.retryable = true;
  assert.equal(isRetryableProviderError(error), true);
});


test('Gemini prompt budget can carry the larger bounded orientation task without free-provider compaction', () => {
  const task = {
    number: 527,
    title: 'Arabic UX audit — Orientation',
    body: '<!-- almago-ai-task -->\nFiles:\n- src/content/student-orientation-copy.ts\n- src/components/student/StudentOrientationPanel.tsx\nGoal: polish Arabic UX.',
    files: [
      'src/content/student-orientation-copy.ts',
      'src/components/student/StudentOrientationPanel.tsx',
    ],
  };
  const prompt = promptFor(task, 120000);
  assert.doesNotMatch(prompt, /context compacted for free-provider limit/);
  assert.match(prompt, /FILE src\/content\/student-orientation-copy\.ts/);
  assert.match(prompt, /FILE src\/components\/student\/StudentOrientationPanel\.tsx/);
});


test('builds a valid git patch from strict Groq structured edits and restores the working tree', () => {
  const file = 'src/lib/phase4.ts';
  const original = 'export const universityTypes = ["Universität", "TU", "Hochschule", "FH"] as const;';
  const task = { files:[file] };
  const patch = buildPatchFromStructuredEdits(task, {
    edits:[{
      path:file,
      old_text:original,
      new_text:'export const universityTypes = ["Universität", "TU", "Hochschule", "FH"] as const; // bounded-test',
    }],
  });
  assert.match(patch, /^diff --git a\/src\/lib\/phase4\.ts b\/src\/lib\/phase4\.ts/m);
  assert.match(patch, /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/m);
  assert.doesNotMatch(readFileSync(file, 'utf8'), /bounded-test/);
});

test('rejects ambiguous or out-of-scope Groq structured edits', () => {
  const file = 'src/lib/phase4.ts';
  assert.throws(() => buildPatchFromStructuredEdits({ files:[file] }, {
    edits:[{ path:'src/lib/i18n.ts', old_text:'x', new_text:'y' }],
  }), /outside the approved file list/);
  assert.throws(() => buildPatchFromStructuredEdits({ files:[file] }, {
    edits:[{ path:file, old_text:'export', new_text:'changed' }],
  }), /match exactly once/);
});
