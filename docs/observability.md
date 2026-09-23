# AlmaGo observability contract

A44 must remain **disabled by default** until a production observability/analytics provider is connected and the privacy/legal review in A38 is complete.

## Privacy boundary

Telemetry is allow-list only. The canonical contract is:

`config/telemetry-events.json`

Allowed initial events:

- `route_render_failed`
- `api_request_failed`
- `form_submit_result`
- `navigation_action`
- `web_vital`

Only the properties listed for each event may be sent.

## Never send

Do not send:

- names, email addresses, phone numbers or postal addresses;
- internal/user IDs or student IDs;
- passwords, auth tokens, cookies, API keys or Authorization headers;
- uploaded document contents, file names or free-form notes/messages;
- nationality, birth information or other profile values;
- full URLs containing identifiers or query strings;
- raw IP addresses from application code.

Provider-side defaults must also be reviewed before production activation.

## Provider activation checklist

1. Complete A38 legal/privacy review.
2. Create/connect the provider account.
3. Store keys only in Vercel/GitHub secrets.
4. Configure retention and any consent requirement.
5. Map provider events to the allow-list contract.
6. Verify production error capture with synthetic/test-only data.
7. Confirm no forbidden property appears in provider payloads.
8. Mark A44 complete only after this verification.

Recommended low-friction path: Vercel runtime context plus a dedicated product analytics/error provider such as PostHog, subject to the final privacy review.

No telemetry provider is currently hard-coded into AlmaGo.
