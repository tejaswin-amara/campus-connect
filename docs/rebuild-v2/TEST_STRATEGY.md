# Verification and Test Strategy

## Scope
One college, multiple clubs/departments and event-level permissions. Test organization/event isolation, not fictional cross-college tenant isolation.

## Levels
Static (format/lint/type/dependency boundaries/secrets/licenses/SBOM/SAST); unit (domain policies/transitions/normalization/dedupe/auth); integration (DB constraints/transactions/queues/storage); contract (OpenAPI/errors/clients); component (accessible UI states); E2E (discovery/registration/organizer/moderation/cancel/check-in/admin); concurrency; security (organization/event authorization/IDOR/privilege/CSRF/XSS/SSRF/uploads/sessions); performance; accessibility (axe plus manual keyboard/focus/zoom/screen reader).

## Critical invariants
1. Users cannot access another organization's private resources without explicit grant.
2. Event operators can access only assigned events.
3. Capacity is never exceeded.
4. Retry never duplicates registration.
5. Waitlist seat is never allocated twice.
6. Ticket replay cannot duplicate check-in.
7. Lifecycle cannot bypass approval policy.
8. Source sync is idempotent.
9. Notification retry avoids duplicate delivery where provider semantics permit.
10. Revoked session cannot perform privileged action.
11. Untrusted source cannot reach private network resources.

## Scenario matrix
| Domain | Positive | Negative/boundary | Failure/concurrency |
|---|---|---|---|
| Identity | College login | expired/revoked | recovery abuse |
| Organization | Member role | foreign org IDs | concurrent membership changes |
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
