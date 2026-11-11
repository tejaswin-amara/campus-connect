# Security, Privacy and Abuse Threat Model

**Status:** Initial register; update after architecture and data-flow review.

## Assets and boundaries
Assets: credentials/sessions, student profiles, memberships, unpublished events, rosters, ticket secrets, attendance, source credentials, uploads, audit records, backups and cloud credentials. Boundaries: browser→web/API; tenant A→B; student→admin; internet→ingestion worker; external feed/file→parser; worker→provider; Jules/CI→repo/cloud; app→DB/storage/telemetry.

## STRIDE
| Threat | Example | Controls |
|---|---|---|
| Spoofing | Account/session takeover | MFA/SSO options, rotation, recovery protections, limits |
| Tampering | Alter event/ticket | Authorization, validation, protected tokens, audit |
| Repudiation | Deny moderation/check-in | Append-oriented audit, actor/time/reason |
| Disclosure | Cross-tenant roster | Scoped policy, RLS where useful, negative tests, safe logs |
| DoS | Registration flood/hostile source | Quotas, limits, timeouts, backpressure |
| Elevation | Student calls admin API | Least privilege, scoped grants, adversarial tests |

## Required controls
Tenant isolation tested for reads/writes/exports/search/storage/jobs/caches. Ingestion defends against SSRF, DNS rebinding, redirects to private/link-local addresses, oversized/decompression-bomb payloads and malicious HTML. QR tickets expose no personal data and are replay-resistant. Uploads require MIME sniffing, size limits, safe names, object authorization and malware scanning where warranted. High-impact admin actions audited and may require re-authentication. Prevent IDOR, mass assignment, CSRF, XSS, SQL injection, open redirects and unsafe CORS. Scope/rotate secrets; no production secrets in Jules sessions.

## Privacy
For every personal field document purpose, lawful basis/consent where applicable, collection, access, retention, deletion/anonymization and export. Do not collect student identifiers, phone, location or demographics without a defined need. No real student data in prompts, issues, logs or fixtures.

## Agent/CI
Jules gets only required repo access. Pin third-party Actions to immutable SHAs and minimum permissions. Review generated code/workflows. Maintain SBOM, notices and artifact provenance.

## Release blockers
Cross-tenant disclosure, auth bypass, privilege escalation, secret leak, exploitable SSRF, ticket forgery/replay, capacity overrun, duplicate check-in or unmitigated critical vulnerability.

## Verification
Threat review; SAST/DAST; dependency/secret scans; authorization matrix; tenant fuzzing; SSRF/upload abuse; session/CSRF; backup access review; incident tabletop.
