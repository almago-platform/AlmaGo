import test from 'node:test';
import assert from 'node:assert/strict';
import { isProtectedPath, isRetryableProviderError, parseTask, promptFor, validatePatch } from './autonomous-propose.mjs';

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
