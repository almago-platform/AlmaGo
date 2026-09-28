# AlmaGo observability contract

A44 remains **disabled by default** until a production observability/analytics provider is connected and the privacy/legal review in A38 is complete. A43 must pass first.

## Privacy boundary

Telemetry is allow-list only. The canonical contract is `config/telemetry-events.json`. The runtime gate in `src/lib/telemetry.ts` checks **both property names and values** against it.

Allowed initial events:

- `route_render_failed`
- `api_request_failed`
- `form_submit_result`
- `navigation_action`
- `web_vital`

Each property must use exactly one of the categorical values in `allowedValues`, except `http_status`, which must be an integer from 100 to 599. Map unexpected values to a safe generic category (`other` or `unknown`) only where that category exists. Never derive event values from free-form user input, error messages, URLs or identifiers. Validation errors must not echo rejected values.

## Never send

Do not send:

- names, email addresses, phone numbers or postal addresses;
- internal/user IDs or student IDs;
- passwords, auth tokens, cookies, API keys or Authorization headers;
- uploaded document contents, file names or free-form notes/messages;
- nationality, birth information or other profile values;
- full URLs containing identifiers or query strings;
- raw IP addresses from application code.

Provider-side defaults must also be reviewed before production activation. Do not enable automatic capture of page URLs, session replay, user profiles, network payloads, or unfiltered exception messages.

## Provider activation checklist

1. Complete A38 legal/privacy review and A43 authenticated E2E.
2. Create/connect the provider account.
3. Store provider secrets only in Render environment variables and GitHub Actions secrets.
4. Configure retention and any consent requirement.
5. Map provider events to the allow-list contract; disable provider automatic capture until separately reviewed.
6. Verify production error capture with synthetic/test-only data.
7. Inspect outgoing application payloads and provider-side enrichment for forbidden data.
8. Mark A44 complete only after this verification.

Recommended low-friction path: keep Render as the canonical runtime and connect a dedicated analytics/error provider only after the final privacy review. Any provider must respect the allow-list contract and automatic capture must remain disabled until reviewed.

No telemetry provider is currently hard-coded into AlmaGo. Render runtime logs are operational logs only and do not replace the A44 product telemetry contract.
