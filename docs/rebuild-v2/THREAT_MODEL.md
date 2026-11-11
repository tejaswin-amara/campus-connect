# Security, Privacy and Abuse Threat Model

**Product boundary:** One college, multiple clubs/departments and event-level permissions. The primary isolation risk is unauthorized access between organizations, events and student/operator roles—not cross-institution tenancy.

## Assets and boundaries
Assets: credentials/sessions, student profiles, organization memberships, unpublished events, rosters, ticket secrets, attendance, source credentials, uploads, audit records, backups and cloud credentials. Boundaries: browser→web/API; student→organizer/admin; club A→club B; event operator→unassigned event; internet→ingestion worker; external feed/file→parser; worker→provider; Jules/CI→repo/cloud; app→DB/storage/telemetry.

## STRIDE
| Threat | Example | Controls |
|---|---|---|
| Spoofing | Account/session takeover | College SSO where available, rotation, recovery protections, limits |
| Tampering | Alter event/ticket | Authorization, validation, protected tokens, audit |
| Repudiation | Deny moderation/check-in | Append-oriented audit, actor/time/reason |
| Disclosure | Club roster exposure | Organization/event scope checks, negative tests, safe logs |
| DoS | Registration flood/hostile source | Quotas, limits, timeouts, backpressure |
| Elevation | Student calls admin API | Least privilege, scoped grants, adversarial tests |

## Required controls
Test organization/event isolation across reads, writes, exports, search, storage, background jobs and caches. Ingestion defends against SSRF, DNS rebinding, redirects to private/link-local addresses, oversized/decompression-bomb payloads and malicious HTML. QR tickets expose no personal data and are replay-resistant. Uploads require MIME sniffing, size limits, safe names, object authorization and scanning where warranted. High-impact admin actions audited and may require re-authentication. Prevent IDOR, mass assignment, CSRF, XSS, SQL injection, open redirects and unsafe CORS.

## Privacy
For every personal field document purpose, access, retention, deletion/anonymization and export. Minimize student identifiers, phone, location and demographics. No real student data in prompts, issues, logs, fixtures or Jules sessions. Use synthetic data.

## Agent/CI
Jules receives only necessary repository permissions. Pin third-party Actions to immutable SHAs and minimum permissions. Review generated code/workflows. Maintain SBOM, notices and artifact provenance. Never place production credentials or data in Jules tasks.

## Release blockers
Auth bypass, privilege escalation, unauthorized club/event roster disclosure, secret leak, exploitable SSRF, ticket forgery/replay, capacity overrun, duplicate check-in or unmitigated critical vulnerability.

## Verification
Threat review; SAST/DAST; dependency/secret scans; authorization matrix; object-level authorization fuzzing; SSRF/upload abuse; session/CSRF; backup access review; incident tabletop.
