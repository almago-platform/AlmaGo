# AlmaGo V3 — Public translation readiness

**Status:** implementation guard for V3-11.

AlmaGo plans public support for:

- French;
- English;
- German;
- Arabic.

Only **French** is currently marked as public-ready.

## Activation rule

A planned language must not be switched to `ready` until all of the following are complete:

1. Homepage translated and reviewed;
2. Notre rôle / trust copy translated and reviewed;
3. Centre d’aide translated and reviewed;
4. Comprendre les démarches translated and reviewed;
5. Selon votre pays de diplôme translated and reviewed;
6. Signup/login public copy translated where applicable;
7. metadata title/description reviewed;
8. navigation/footer reviewed;
9. legal pages handled separately and not assumed from the marketing translation;
10. responsive/browser accessibility checks pass in the target language;
11. terminology reviewed by a fluent human;
12. Arabic layout verified in RTL.

## Language quality rule

Do not translate mechanically word-for-word.

Preserve:
- institutional tone;
- clear student actions;
- official German administrative terms when useful;
- distinction between AlmaGo guidance and official decisions;
- source attribution.

Avoid:
- machine-sounding copy;
- invented administrative equivalents;
- translating official institution names when that would make them harder to identify;
- activating a language with partially French fallback copy in the same public journey.

## Current state

| Language | Status | Direction |
| --- | --- | --- |
| Français | ready | LTR |
| English | planned | LTR |
| Deutsch | planned | LTR |
| العربية | planned | RTL |

The public interface must not present planned languages as available yet.
