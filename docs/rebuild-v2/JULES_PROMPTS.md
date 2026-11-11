# Copy/Paste Google Jules Session Prompts

Use these prompts in separate Jules sessions. Start J00–J05 sequentially. Only then launch the parallel waves in PARALLEL_JULES_WORKFLOW.md. Each session must create its own branch from the latest approved integration branch and submit a PR; never share a working branch.

## Global preamble — paste into every session
~~~text
You are Google Jules working in tejaswin-amara/campus-connect.
Product boundary: ONE COLLEGE ONLY. This is not multi-tenant SaaS.
Read AGENTS.md and docs/rebuild-v2/README.md, PRD.md, ARCHITECTURE.md, DATA_MODEL.md, API_STANDARDS.md, THREAT_MODEL.md, OPEN_SOURCE_ADOPTION.md, TEST_STRATEGY.md and PARALLEL_JULES_WORKFLOW.md before acting.
Preserve legacy implementation and documentation. Work only on your assigned task and owned paths.
Do not assume the proposed stack is approved. J00 must compare the existing implementation with alternatives; J02 records decisions; J03 verifies open-source candidates.
Inspect, plan, implement, test, review the diff, update docs and report evidence.
Never weaken, skip or bypass a failing quality/security gate. Do not fabricate test results.
Use synthetic data only. Never expose secrets or real student data.
Use Conventional Commits. Create a dedicated branch and PR. Do not push directly to main.
Stop and report if a dependency/contract is missing or scope conflicts with another session.
~~~

## J00 — Legacy audit (sequential; no product rewrite)
~~~text
Objective: produce an evidence-backed audit of current CampusConnect.
Inspect all branches, PRs, README/docs, source, tests, dependencies, licenses, CI workflows, security alerts, deployment and existing frontend redesign. Run available tests where safe. Identify actual current stack and working features. Inventory reusable code by path, license, quality, test evidence and migration cost. Identify broken/duplicate/dead code and blockers.
Deliver: docs/rebuild-v2/LEGACY_AUDIT.md, reuse inventory, test baseline, dependency/security findings, migration recommendation and a precise list of unknowns. Do not change application code or remove files. PR only documentation.
~~~

## J01 — Product validation (sequential)
~~~text
Objective: validate one-college product workflows with owner assumptions clearly labelled.
Confirm student, club/department organizer, event operator and college administrator journeys; approval policy questions; identity/SSO availability; event categories/venues; eligibility; registration/cancellation/waitlist rules; ticket/check-in process; source permissions; data retention and launch priorities.
Update PRD, journeys, authorization matrix and acceptance traceability. Do not invent college policies. Mark unanswered items as decisions required. No application code.
~~~

## J02 — Architecture and ADRs (sequential)
~~~text
Objective: choose the simplest viable architecture for one college.
Compare current Spring Boot/Java/MySQL/Thymeleaf/React implementation with proposed alternatives using repository evidence, migration cost, developer velocity, reliability, security, deployment and operating cost. Decide retain/replace per subsystem. Produce C4 context/container/component diagrams, data flow, module boundaries, API contract approach, DB/ORM/migration, auth/SSO, jobs, search, hosting/region and backup ADRs. Reject multi-tenancy, microservices and infrastructure without measured need. Do not implement product features.
~~~

## J03 — Open-source due diligence (sequential)
~~~text
Objective: evaluate candidate repositories, packages, skills and tools.
For every candidate complete the REUSE-NNN record: exact upstream/tag/commit, license/notices, maintainers/releases/advisories, transitive dependencies/install scripts, permissions/network/telemetry, compatibility, config parameters, failure modes, test results, benchmark, maintenance burden and removal path.
Run isolated proof-of-concepts. Test defaults, boundaries, invalid/omitted/null inputs, option interactions, concurrency, retries, timeout, cancellation, network/permission failure and cleanup. Use pairwise coverage for options and exhaustive tests for security invariants. Benchmark versus a simple baseline. Record ADOPT/ADAPT/REJECT/DEFER. Do not install candidates in production workspaces until accepted.
~~~

## J04 — Foundation (sequential)
~~~text
Objective: create the approved repository foundation only after ADRs.
Set up chosen toolchain, package/module boundaries, local development, formatting/lint/type checks, test commands, CI, secrets scanning, dependency/license policy, migration validation and Jules instructions. Preserve existing working code until migration plan is accepted. Establish OpenAPI/contracts workflow and test fixtures. Publish ownership map and integration branch. No speculative packages.
~~~

## J05 — Database baseline (sequential owner)
~~~text
Objective: own the initial schema and migration contract.
Implement only approved college-wide schema: users/auth references, clubs/departments, memberships, events/occurrences, source registry/provenance, moderation, registrations/idempotency/waitlist, tickets/check-in, notifications and audit as approved. No institution tenant table or tenant_id scaffolding. Add constraints and indexes justified by queries. Prove fresh install, upgrade, rollback/forward-fix, transaction invariants and restore. Publish versioned schema/API contract. Other sessions must not modify migrations without your coordination.
~~~

## Wave 1 — launch only after J04/J05 contracts are frozen

### J06 — Identity and authorization
~~~text
Implement approved identity/SSO/session flows and the centralized college/organization/event authorization policy. Own auth and policy paths. Support multiple club memberships, least privilege, event-operator assignments, revocation and audit. Do not add tenant resolution. Add direct-object, mass-assignment, privilege-escalation and session tests. Coordinate schema changes with J05 only.
~~~

### J07 — Organization and event domain
~~~text
Implement clubs/departments, membership workflows, event/occurrence model, lifecycle, revisions, moderation and audit using the frozen contracts. Own domain/event paths. Do not modify auth implementation or database migrations independently. Add state-transition, ownership, approval and timezone tests. Request schema changes from J05.
~~~

### J08 — Secure ingestion
~~~text
Implement approved manual/CSV/ICS/RSS/Atom connectors, source registry adapters, provenance, normalization, deduplication, retries and moderation handoff. Own ingestion/worker connector paths. Implement SSRF and hostile-input defenses. Do not publish AI-extracted or ambiguous data automatically. Add malformed feed, redirects, DNS rebinding, private IP, oversized payload, timeout, retry, duplicate and timezone tests.
~~~

## Wave 2 — launch after J06/J07/J08 contracts stabilize

### J09 — Public discovery
~~~text
Implement responsive accessible event discovery, event details, filters, search, organization pages and calendar export. Own public discovery route/component paths. Consume API contracts; do not change backend schema. Add loading/empty/error/full/cancelled states, keyboard and axe tests, browser E2E and mobile performance measurements.
~~~

### J10 — Student workspace
~~~text
Implement student dashboard, saved events, my registrations, tickets, calendar and notification preferences. Own student workspace paths. Do not change shared API or schema without owner review. Test unauthorized access, stale/revoked sessions, empty/error states, cancellation and responsive accessibility.
~~~

### J11 — Organizer and college-admin workspace
~~~text
Implement organizer event creation/submission, scoped roster and event operations; college admin approval queue, organization management, source administration and audit views. Own organizer/admin UI paths. Follow authorization matrix; never rely on hidden UI controls for security. Add role-specific E2E and accessibility tests.
~~~

### J12 — Registration and waitlist
~~~text
Own registration/capacity/waitlist backend. Implement transactional registration, cancellation, idempotency, capacity and deterministic waitlist promotion. Coordinate schema changes with J05. Prove 200 concurrent requests for 50 seats yield exactly 50 confirmations; duplicate requests do not duplicate; cancellation/promotion is atomic; no seat is double-allocated. Include failure injection and DB-level constraints.
~~~

## Wave 3

### J13 — Tickets, attendance and notifications
~~~text
Implement secure QR/ticket issuance and revocation, event-scoped scanning/check-in, correction workflow and notification delivery. Own ticket/attendance/notification paths. Test forged/expired/replayed tickets, concurrent scans, operator scope, retries, provider outage, duplicate notification and privacy of QR payloads.
~~~

### J14 — Integration and E2E
~~~text
Integrate merged feature PRs. Do not rewrite modules wholesale. Run full migrations, contracts, unit/integration/E2E, authorization, accessibility, browser, concurrency and build gates. Fix root causes and report exact evidence. Maintain requirement→module→test→doc traceability. No gate suppression.
~~~

### J15 — Independent security/performance audit
~~~text
Act as an independent reviewer. Threat-model the actual implementation, inspect authorization and ingestion, run SAST/DAST/dependency/license/secret/container scans, fuzz object access and source parsing, load-test search/registration/check-in, inspect DB query plans and frontend Web Vitals. Do not assume prior session claims are correct. Produce prioritized findings with reproduction and remediation; verify fixes.
~~~

### J16 — Deployment and recovery
~~~text
Implement only accepted hosting architecture. Configure least-privilege CI/CD, managed secrets, environment separation, migrations, observability, alerts, backup/PITR, restore drill, rollback and staging smoke tests. Verify actual production-like behavior and costs. Never expose credentials or use production student data in test.
~~~

### J17 — Documentation and handover
~~~text
Audit documentation against actual code, CI and deployed behavior. Complete student/organizer/admin guides, API reference, architecture/ERD, ADRs, source setup, security/privacy, testing, deployment, operations/runbooks, backup/restore, incident response, release notes and known limitations. Remove stale claims and mark unverified items. Deliver traceability and handover.
~~~
