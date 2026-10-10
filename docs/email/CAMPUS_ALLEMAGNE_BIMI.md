# Campus Allemagne — Gmail BIMI activation runbook

**Status: staged asset only; NOT active in Gmail.** This change must not be mistaken for completed BIMI verification. The sender wants the exact visual identity supplied as the 1254×1254 PNG depicting Brandenburg Gate + Campus Allemagne wordmark; it is distinct from the repository's existing Campus Allemagne website artwork.

## Prepared artwork

- File: `public/.well-known/bimi/campus-allemagne-bimi.svg`
- Source: customer-supplied PNG in the October 10, 2026 conversation (not stored in this repository).
- Vectorization: traced locally; palette flattened to navy, red, yellow and white. Square white background; no embedded images, CSS, external links, scripts, animations or network dependencies.
- SVG 1.2 Tiny PS profile, 1024×1024 px, XML parse successful, approximately 8.2 KB.
- **Certificate authority must review the vectorized artwork against the original and confirm suitability.** This is a traced approximation, not the original editable vector master and not a certified mark.
- Original web brand assets remain unchanged. No email templates or existing Resend integration changed.

## Known mail status (October 10, 2026)

- Resend: `campus-allemagne.info` verified, sending enabled, EU region. Resend DKIM and SPF setup records verified.
- A real Gmail-delivered message from `contact@campus-allemagne.info` passed aligned DKIM for the domain and SPF for `send.campus-allemagne.info`.
- **Live DNS DMARC and BIMI values were not reliably available for direct verification; do not infer their absence.**
- Other senders may exist (Google Workspace, apps); **do not blindly enforce DMARC or alter existing SPF/MX/DKIM**.

## Activation prerequisites

1. Confirm which hosting platform serves `https://campus-allemagne.info`. A file committed here will become available at the target URL only after the relevant deployment AND domain routing are correct. Verify HTTPS, 200 OK and `image/svg+xml` at:
   `https://campus-allemagne.info/.well-known/bimi/campus-allemagne-bimi.svg`
2. With Squarespace domain DNS access, read the existing TXT under `_dmarc.campus-allemagne.info`, the default BIMI selector and SPF/DKIM for **every** authorized mail sender. Do not add a second DMARC TXT record: modify the existing one when needed.
3. Stage/monitor DMARC if needed; confirm Google Workspace and Resend deliver with SPF/DKIM alignment and check aggregate reports. Only after verifying all services, enforce organization and subdomain policies with `p=quarantine` or `p=reject`, and `pct=100` if specified.
4. Obtain a paid **VMC** (trademark-eligible artwork) or **CMC** (subject to the certificate authority's documented historical/public-use requirements), using real organizational ownership information and the approved SVG. The certificate authority must conduct identity and brand checks. Do not generate a fake PEM or enter a placeholder URL in production.
5. Host the issued certificate chain (PEM) publicly over HTTPS, e.g.
   `https://campus-allemagne.info/.well-known/bimi/campus-allemagne.pem` (only once the real PEM exists).
6. **Only after #1–#5 pass**, publish a single Squarespace DNS TXT record:

   - Type: `TXT`
   - Host: `default._bimi`
   - Value (conditional on these files' real URLs):
     `v=BIMI1; l=https://campus-allemagne.info/.well-known/bimi/campus-allemagne-bimi.svg; a=https://campus-allemagne.info/.well-known/bimi/campus-allemagne.pem`

7. Validate public DNS, certificate, SVG and live Gmail deliveries. Gmail chooses whether to show a logo; even a complete and valid setup does not guarantee an immediate avatar.

## Access and safety blockers

- Squarespace DNS edits are unavailable through currently connected tools. The login/browser step must be completed through the account owner or an authorized browser agent (ChatGPT Work) with the relevant session.
- Domain routing to AlmaGo is **not confirmed**.
- VMC/CMC issuance requires an external paid purchase, evidence and identity vetting; no such certificate exists in this change.
- No DNS records, email addresses, Resend settings or production deployments are changed by this branch.

## Sources

- Google Workspace BIMI setup: https://knowledge.workspace.google.com/admin/security/set-up-bimi
- BIMI Group implementation: https://bimigroup.org/implementation-guide/
