# AlmaGo Arabic UX & Editorial Guide

Status: active reference for Arabic product work.

## Purpose

The Arabic version of AlmaGo must feel designed in Arabic from the start. It is not a line-by-line translation of the French, German, or English interfaces.

Use the non-Arabic product copy as the source of product meaning and functional constraints. Use Arabic-native editorial judgment for wording, hierarchy, rhythm, and RTL presentation.

DW Arabic is a visual/editorial reference for readable Modern Standard Arabic, concise headings, strong RTL hierarchy, and comfortable reading rhythm. Do not copy DW branding, layouts, components, or content. AlmaGo keeps its own brand identity.

## Audience

Primary Arabic audience: students in Tunisia and the wider Arabic-speaking region preparing to study in Germany.

Assume that users may understand French but may not be comfortable with advanced administrative or academic language.

## Voice

Use clear Modern Standard Arabic.

Prefer:
- short sentences;
- familiar verbs;
- direct calls to action;
- one idea per sentence;
- concrete next steps;
- explanations of German administrative terms when needed.

Avoid:
- literal French or German syntax;
- inflated administrative wording;
- unnecessary passive voice;
- long noun chains;
- Latin-style uppercase, tracking, or fake italic treatment in Arabic;
- dialect in core product navigation or official guidance.

## Core UX questions

Every important section should help the student answer quickly:

1. ماذا يعني هذا؟
2. هل ينطبق عليّ؟
3. ماذا أفعل الآن؟

## Product terminology

Use consistently:

- ملف / ملفك: the student's organised AlmaGo file or workspace when the context is clear.
- أنشئ ملفك: creation CTA.
- مسار: the ordered study journey.
- مشروع الدراسة: the student's study objective/plan.
- مستندات: documents.
- طلبات التقديم: applications.
- برنامج دراسي / برنامج: study programme.
- الشروط: requirements.
- الموعد النهائي: deadline.
- المصدر الرسمي: official source.
- تحقق / راجع: use according to action; "تحقق" when confirmation is required, "راجع" when reading/reviewing is sufficient.

Keep official names such as uni-assist, VPD, Bewerberbestätigung, APS, or legal section references when their official identity matters. Explain them in Arabic instead of replacing them with an invented Arabic official name.

## Calls to action

Prefer action verbs that describe the actual result.

Examples:
- أنشئ ملفك
- قارن البرامج
- جهّز مستنداتك
- اعرف خطوتك التالية
- استعرض الخطوات
- اعرض المصدر الرسمي
- تحقق من الشروط

Avoid vague CTAs such as "المزيد" when a specific action is available.

## Typography

Arabic body/UI text:
- Noto Sans Arabic via `--font-arabic`.

Arabic display headings:
- Noto Kufi Arabic via `--font-arabic-display`.

Do not inherit Latin serif/italic display treatments into Arabic. Use weight, scale, spacing, and brand colour for emphasis instead.

Arabic interfaces must not use Latin uppercase or letter-spacing conventions.

## RTL

Arabic pages use real `dir="rtl"` composition.

Requirements:
- text alignment follows RTL;
- directional arrows mirror;
- primary reading content starts on the right;
- supporting panels may sit on the left when the composition benefits from it;
- logical CSS properties are preferred where practical;
- desktop, tablet, and mobile must be checked independently;
- no horizontal overflow is acceptable.

Do not merely reverse an LTR screenshot mechanically. Preserve reading priority.

## Numbers and technical tokens

Technical values such as email addresses, URLs, ECTS, dates in machine formats, currency amounts, or codes may remain LTR inside an RTL interface when that improves legibility.

Use Unicode isolation or explicit direction where mixed Arabic/Latin values could reorder incorrectly.

## Trust and official decisions

Never imply that AlmaGo grants admission, visas, eligibility, or official approval.

Use clear boundaries such as:

"يساعدك AlmaGo على التحضير. القرارات الرسمية تتخذها الجامعات والجهات المختصة."

When a source can change, tell the user to verify the official source before acting.

## Images and icons

Icons must support meaning, not decorate blindly.

Prefer:
- question icon for FAQ;
- source/verification icon for official-source guidance;
- profile/student icon for personal starting point;
- document icon for documents;
- route icon for journey/progress.

Directional icons must mirror in RTL.

Photography should remain human, international, and study-related, while respecting AlmaGo's existing image-credit and representation rules.

## Review checklist

For every Arabic public or authenticated surface:

- Does the copy sound originally written in Arabic?
- Can the heading be understood without reading the paragraph?
- Is the next action explicit?
- Are German terms preserved/explained correctly?
- Is the wording shorter than an administrative translation would be?
- Are headings using the Arabic display font rather than a Latin serif/italic?
- Are arrows and spatial hierarchy correct in RTL?
- Is mixed Arabic/Latin content stable?
- Is there no horizontal overflow at 360, 390, 430, 768, 1440, and 1920 px where applicable?
- Are accessibility labels Arabic and meaningful?
- Are official-source and no-guarantee boundaries still intact?

## Current homepage direction

Hero:
- "طريقك إلى الدراسة في ألمانيا."
- "خطّط لدراستك في ألمانيا خطوة بخطوة."
- CTA: "أنشئ ملفك"

The homepage should prioritize:
programme choice → documents → applications → preparation → progress.

The Arabic homepage may change line breaks, spacing, emphasis, and information order when needed for Arabic comprehension, while preserving the same product meaning and capabilities.
