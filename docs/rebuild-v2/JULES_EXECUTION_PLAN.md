# Google Jules — Multi-Session Delivery Plan

**Owner:** Google Jules. **Branch:** rebuild/campus-connect-v2.

## Session contract
Each session reports task ID, objective, dependencies, non-goals, allowed paths, plan/risks, implementation, exact commands/results, security/migration/performance impact, docs updated, PR link, residual risks and handoff.

## Sessions
- J00 Legacy audit: branches, commits, PRs, workflows, source, tests, deployment, license and security; inventory reusable assets; no rewrite.
- J01 Product discovery: personas, journeys, institution workflows, lifecycle, MVP and acceptance traceability.
- J02 Architecture: C4, domain boundaries, data/trust flows, deployment options and ADR evidence.
- J03 Open-source due diligence: repositories/packages/skills/tools, isolated POCs, parameter tests, benchmark and reuse register; no unapproved dependency.
- J04 Foundation: monorepo, pinned toolchain, boundaries, local dev, CI, Jules instructions and test scaffolding.
- J05 Database: schema, migrations, constraints, fixtures, fresh setup, upgrade and restore.
- J06 Identity/tenancy: auth, sessions, memberships, scoped roles and adversarial tests.
- J07 Organization/event: memberships, event/occurrence, lifecycle, revisions, moderation and audit.
- J08 Ingestion: approved connectors, SSRF, provenance, dedupe, retry and idempotency.
- J09 Public discovery: accessible feed/detail, search, filters, calendar and profiles.
- J10 Student workspace: preferences, bookmarks, registrations, calendar and notifications.
- J11 Organizer/admin: event authoring, approvals, roster, org management, source admin and reports.
- J12 Registration: transactions, idempotency, cancellation, capacity and waitlist concurrency.
- J13 Tickets/operations: QR verification, check-in scope, attendance correction and notification retry.
- J14 Integration: user journeys, contracts, migrations, tenant isolation, accessibility and browser regression.
- J15 Hardening: threat review, SAST/DAST, dependency/license scans, load tests, query review and independent audit. Ponytail only if verified for Jules.
- J16 Release: approved infra, staging/prod pipeline, secrets, telemetry, backup, restore and rollback.
- J17 Handover: verify docs against code/deployment; guides, runbooks, diagrams, release notes and traceability.

## Dependencies
~~~text
J00 → J01 → J02 → J03 → J04 → J05 → J06
                              └────→ J07 → J08
J06 + J07 + J08 → J09 + J10 + J11
J06 + J07 → J12 → J13
All feature work → J14 → J15 → J16 → J17
~~~

Parallelize only independent work after contracts stabilize. Schema, auth and shared API contract changes have sequential ownership.

## Prompt template
~~~text
You are Google Jules in tejaswin-amara/campus-connect on rebuild/campus-connect-v2.
Read AGENTS.md and relevant docs/rebuild-v2/ documents and ADRs.
Task ID:
Objective:
In scope:
Non-goals:
Dependencies:
Allowed paths:
Forbidden paths:
Acceptance criteria:
Required tests/security checks:
Required documentation:
Open-source candidates:
Verification commands:
Expected evidence:
Stop conditions:

Do not invent requirements or silently change architecture.
Inspect before editing; plan before broad changes.
Evaluate every dependency/repository/tool before adoption.
Test relevant parameters, boundaries, failures and interactions.
Never skip or weaken gates. Use Conventional Commits.
Update docs with behavior changes. Report evidence and unresolved risks.
~~~

## PR acceptance
Include scope/rationale, architecture/migration impact, security/privacy, tests/results, UI evidence, performance, docs and rollback. Independent review required for auth, tenancy, ingestion, registration, tickets, migrations and workflows.

## Handover
Provide requirement→module→test→doc traceability; reuse decisions; security/performance reports; deployment/recovery evidence; known limitations; exact release commit/tag. Missing evidence means incomplete.
