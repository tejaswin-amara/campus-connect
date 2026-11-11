# Requirements Traceability and Release Acceptance

This file is the master release checklist. Jules updates links to implementation, tests and documentation as work lands.

| Requirement group | Implementation module | Required evidence |
|---|---|---|
| Identity | auth/access | session tests, recovery, revocation |
| Organization roles | organizations/policy | authorization matrix and negative tests |
| Event lifecycle | events/moderation | transition tests, approval audit |
| Ingestion | ingestion | source fixtures, SSRF/failure/idempotency tests |
| Discovery | discovery/web | search contract, E2E, accessibility, performance |
| Registration | registration | capacity race, retry/idempotency, cancellation |
| Waitlist | registration | promotion concurrency and fairness policy |
| Tickets/check-in | attendance | token abuse, replay and duplicate-scan tests |
| Notifications | notifications | retry, preference and delivery tests |
| Administration | admin/audit | privilege boundaries, audit evidence |
| Privacy | data/operations | retention, export/deletion and access review |
| Production | infra/operations | CI, monitoring, backup restore and rollback |

## Release gate
No release is accepted because a checklist is merely marked complete. Each row links to a passing CI run, test report, approved ADR, operational evidence or documented risk acceptance. Critical security and data integrity invariants are blockers.
