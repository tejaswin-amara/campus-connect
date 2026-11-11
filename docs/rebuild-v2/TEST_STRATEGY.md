# Verification and Test Strategy

## Levels
Static (format/lint/type/dependency boundaries/secrets/licenses/SBOM/SAST); unit (domain policies/transitions/normalization/dedupe/auth); integration (DB constraints/transactions/RLS/queues/storage); contract (OpenAPI/errors/clients); component (accessible UI states); E2E (discovery/registration/organizer/moderation/cancel/check-in/admin); concurrency; security (tenant/IDOR/privilege/CSRF/XSS/SSRF/uploads/sessions); performance; accessibility (axe plus manual keyboard/focus/zoom/screen reader).

## Critical invariants
1. Cross-tenant access denied.
2. Capacity never exceeded.
3. Retry never duplicates registration.
4. Waitlist seat never allocated twice.
5. Ticket replay cannot duplicate check-in.
6. Lifecycle cannot bypass approval.
7. Source sync is idempotent.
8. Notification retry avoids duplicate delivery where provider semantics permit.
9. Revoked session cannot perform privileged action.
10. Untrusted source cannot reach private network resources.

## Scenario matrix
| Domain | Positive | Negative/boundary | Failure/concurrency |
|---|---|---|---|
| Identity | Login/recovery | expired/revoked | recovery abuse |
| Tenancy | Own data | foreign IDs | pooled DB context missing |
| Events | Valid lifecycle | invalid transition | concurrent edits |
| Ingestion | Valid feed | malformed/oversized | timeout/redirect/retry/duplicate |
| Registration | Available seat | full/closed | capacity race |
| Waitlist | Next eligible | cancelled/ineligible | simultaneous promotion |
| Ticket | Valid | forged/expired | concurrent scan |
| Upload | Valid media | MIME/size | interrupted upload |

## Concurrency acceptance
In disposable PostgreSQL, 200 attempts for 50 remaining seats yield exactly 50 confirmed. Same idempotency key creates one mutation. Waitlist promotion never double allocates. Concurrent scans of one ticket yield at most one check-in. Duplicate ingestion yields one canonical mapping.

## Performance
Measure p50/p95/p99, throughput, errors, resources and cost for feed/search, student dashboard, organizer queries, registration, source sync and check-in. Record environment, data, repetitions and baseline before defining SLOs.

## CI gates
Affected changes run relevant format/lint/typecheck/unit/integration/contract/build/migration/security checks. Main/release adds full suite, accessibility, container/IaC scans, SBOM/license, performance and security suites. Never use continue-on-error or broad allowlists to hide failures.
