# CampusConnect 2.0 — Final Multi-Phase Google Jules Execution Pack

**Status:** Authoritative execution contract and copy/paste prompt library  
**Product scope:** One college only  
**Repository:** https://github.com/tejaswin-amara/campus-connect  
**Planning branch:** rebuild/campus-connect-v2  
**Existing documentation PR:** https://github.com/tejaswin-amara/campus-connect/pull/12

This document is the authoritative source for the multi-phase Jules implementation. It supersedes shorter or conflicting session instructions in older prompt drafts. Read it together with AGENTS.md and the project documents linked from docs/rebuild-v2/README.md.

---

# 0. How to run this programme

Use one Jules session as the **programme controller / integration lead** and separate Jules sessions for bounded work. The controller owns the plan, Linear coordination, contract freezes, integration order, and release decision. It must not compete with implementation sessions by editing their owned source paths.

Do not launch every session at once.

## Execution sequence

| Stage | Sessions | Mode | Exit condition |
|---|---|---|---|
| Stage 0 — Baseline | J00 | Sequential | Verified legacy audit and test baseline |
| Stage 1 — Product | J01 | Sequential | Product assumptions and college policies identified |
| Stage 2 — Architecture | J02 | Sequential | ADRs approved; stack and integrations selected or rejected |
| Stage 3 — Reuse due diligence | J03 | Sequential | OSS/MCP adoption decisions backed by tests |
| Stage 4 — Engineering foundation | J04 | Sequential | CI, local environment, contracts and ownership model ready |
| Stage 5 — Data/API baseline | J05 | Sequential | Schema, API and migration ownership frozen |
| Wave A | J06, J07, J08 | Parallel, max 3 | Identity, event domain and ingestion pass module gates |
| Wave B | J09, J10, J11, J12 | Parallel, max 4 | UI surfaces and registration are integrated against stable contracts |
| Wave C | J13 | Sequential after registration | Ticketing, check-in and notifications verified |
| Integration | J14 | Sequential integration owner | Full suite and end-to-end workflows pass |
| Independent assurance | J15 | Independent reviewer | Security and performance findings verified or accepted |
| Operations | J16 | After architecture and integration | Deployment, backup, restore and rollback proven |
| Handover | J17 | Final | Documentation matches the shipped behavior |

The controller may split a task further only when there is a concrete reason and non-overlapping file ownership. Do not create extra sessions just to maximize session count.

## Important branch decision

PR #12 currently targets main from rebuild/campus-connect-v2. Before creating implementation branches, the controller must verify the current default branch, planning branch head, PR #12 state, and whether rebuild/campus-connect-v2 is the agreed integration branch.

- If rebuild/campus-connect-v2 is approved as the integration branch, implementation PRs target it, not main.
- If PR #12 is merged and main is explicitly chosen as the integration base, use main.
- Do not silently switch integration bases.
- Do not merge implementation work directly into main while the integration strategy is unresolved.
- The final integrated release is delivered through one reviewed PR to the default branch.

---

# 1. Non-negotiable product and engineering rules

## 1.1 Product boundary

CampusConnect serves ONE COLLEGE. It is not a multi-institution SaaS product.

The product can have multiple departments, clubs, student organizations, venues, campus locations, event operators and administrators. They are internal college entities, not tenants.

Do not introduce institution onboarding, tenant resolution, tenant headers, tenant_id scaffolding, cross-college discovery, SaaS billing, or cross-institution isolation infrastructure.

Organization- and event-level authorization is still mandatory.

## 1.2 Architecture

- Start from the actual repository, not an imagined greenfield system.
- Prefer a modular monolith unless measured requirements justify another architecture.
- Reuse working code when it is safer and cheaper than replacement.
- Do not replace Spring Boot/Java/MySQL/Thymeleaf/React or adopt the proposed Next.js/Fastify/PostgreSQL candidate without evidence and an approved ADR.
- Neon and Supabase are alternative infrastructure candidates by default, not two databases to combine.
- Tinybird is optional analytics infrastructure, never the transactional source of truth.
- Render is a deployment candidate, not permission to replace an existing production service.
- Stitch is a design tool; v0 is a UI acceleration tool. Neither overrides requirements or the approved design system.
- Context7 is a documentation verification tool, not a reason to add dependencies.
- Connected MCP servers are development tools unless an ADR explicitly approves a runtime integration.

No premature microservices, Kubernetes, Kafka, vector databases, separate search clusters, or extra databases.

## 1.3 Evidence and testing

Every material claim must be backed by repository evidence, official documentation, reproducible tests, or a clearly labelled assumption.

For each parameter/configuration surface:
- Verify the documented type, default, allowed values and units.
- Test omitted, default, explicit, null and invalid values where applicable.
- Test minimum, maximum and boundary values.
- Test relevant option interactions.
- Test timeout, retry, cancellation, concurrency, permission failure, network loss and cleanup where relevant.
- Exhaustively test all combinations when the state space is finite and reasonably bounded.
- Use pairwise/combinatorial testing for large configuration spaces, while exhaustively testing security and data-integrity invariants.
- State what was not tested. Never claim every possible value was tested if the input space is unbounded.

Distinguish unit, mocked integration, sandbox integration, and real provider verification. A mocked test does not prove an external service works.

## 1.4 Security and privacy

- Never use real student data in development or test.
- Never put secrets in source, logs, screenshots, issue descriptions or prompts.
- Default-deny authorization.
- Check resource ownership at every API, export, file, job, search and check-in boundary.
- Treat external event sources as hostile input.
- Prevent SSRF, unsafe redirects, DNS rebinding, private IP access, oversized responses and parser abuse.
- Keep student information out of analytics unless specifically approved and minimized.
- No external AI decision-making for eligibility, discipline or student access.
- Block release for auth bypass, privilege escalation, roster disclosure, exposed secrets, exploitable SSRF, capacity overrun or duplicate check-in.

## 1.5 Change control

- One task per Linear issue and one session per task.
- One dedicated branch and pull request per implementation session.
- One owner for every shared contract and migration.
- No concurrent edits to the same path.
- No direct pushes to main.
- No force-push to shared branches.
- No dependency, infrastructure, schema or authentication change without documenting its impact.
- Do not delete legacy code until its replacement is merged and proven.
- Do not suppress failed CI/security gates to obtain a green badge.

---

# 2. Connected MCP server operating contract

Jules must inspect the actual server documentation, exposed tools, schemas and permissions before relying on an MCP. A connected label is not proof that every capability is available.

Create and maintain docs/rebuild-v2/MCP_INTEGRATION_REGISTER.md. Record tools discovered, use case, read/write effect, environment, data touched, costs/limits, verification, limitations and adopt/reject/defer decision. Never record tokens or credentials.

| MCP | Use in this programme | Do not do |
|---|---|---|
| Linear | Project roadmap, task IDs, dependencies, status, blockers, PR links and acceptance evidence | Duplicate existing tasks; store student personal data |
| Context7 | Verify APIs and configuration against the repository's actual installed versions | Add libraries merely because documentation exists |
| Stitch | Define approved screens, interaction patterns and design tokens | Invent product requirements or a second design system |
| v0 | Accelerate bounded React UI components after design approval | Accept generated code without review, tests and integration |
| Neon | Evaluate or operate PostgreSQL only if selected by ADR | Provision production during discovery; use it alongside Supabase without a proven need |
| Supabase | Evaluate managed database/auth/storage/realtime capabilities if a real gap exists | Duplicate auth, expose service-role keys, or create a second source of truth |
| Tinybird | Optional aggregate event analytics after privacy and workload approval | Use it for transactional registrations or send raw student rosters |
| Render | Evaluate and deploy the accepted runtime after release gates | Experiment destructively against production or expose secrets |

Use actual tool schemas. Do not invent tool names, resource IDs, arguments or capabilities. Test read-only operations first. Confirm environment and reversibility before writes.

OpenAI Platform is not in the connected list supplied for this project. Do not assume an OpenAI MCP or API is available. AI-assisted extraction remains optional and requires a separate privacy, cost and fallback ADR.

---

# 3. Programme controller prompt

Start one primary Jules session with this prompt. It is the control tower for every other session.

~~~text
You are the CampusConnect 2.0 Programme Controller and Integration Lead.

Repository: tejaswin-amara/campus-connect
Product scope: ONE COLLEGE ONLY.
Read AGENTS.md and the complete docs/rebuild-v2 documentation set, especially this execution pack, PRD, architecture, data model, API standards, authorization matrix, threat model, test strategy, open-source adoption protocol, release checklist and open questions.

Your job is to coordinate delivery, not to duplicate the coding sessions.

FIRST:
1. Inspect the current default branch, rebuild/campus-connect-v2, PR #12, all open PRs, CI checks and repository state.
2. Confirm which branch is the approved integration base. Do not assume.
3. Read the existing Linear CampusConnect project, issues, labels, milestones and dependencies. Reuse existing records; create only missing tasks.
4. Discover the actual connected MCP tools and schemas for Linear, Neon, Stitch, Supabase, Tinybird, Context7, v0 and Render. Record capabilities and limitations.
5. Create/update MCP_INTEGRATION_REGISTER.md and SESSION_CONTROL_BOARD.md.
6. Run no destructive production operations and provision no production infrastructure.
7. Confirm J00–J17 ownership, dependencies, acceptance criteria and target branches.

OPERATING MODEL:
- You own Linear coordination, task dependency updates, shared contracts, session board, integration branch and release traceability.
- Each implementation session owns only its assigned paths and branch.
- Never let two sessions edit the same file or migration concurrently.
- Keep the database migration owner singular.
- Start Wave A with at most three sessions; expand to four only in Wave B after contract stability.
- Pause dispatch if API/schema/authorization contracts are moving.
- Review each PR against its task, tests, docs, security impact and ownership.
- Integrate in dependency order and rerun affected tests after each merge.
- Do not mark work complete based on a session's assertion; inspect the PR, diff and test evidence.

REPORT:
Maintain SESSION_CONTROL_BOARD.md and the Linear project. For each session record task ID, owner, branch, PR, owned paths, status, dependency, contract version, last update, CI, tests, blockers and merge decision.

At each gate, publish an evidence-based go/no-go decision:
- GO: prerequisites and contracts are stable.
- HOLD: a dependency, owner decision or test is missing.
- STOP: security, data integrity or ownership conflict makes work unsafe.

Do not claim you launched other Jules sessions unless the Jules interface confirms that. If session creation is not available to you, provide the exact prompts and dispatch instructions for the operator.

Your first deliverable is a verified baseline and a session-dispatch plan. Do not start broad application implementation until J00–J05 and the gate conditions are satisfied.
~~~

---

# 4. Global preamble — paste into EVERY Jules implementation session

Append one task-specific prompt from the sections below after this preamble.

~~~text
You are Google Jules working on CampusConnect 2.0 in tejaswin-amara/campus-connect.

PRODUCT BOUNDARY:
This product is exclusively for ONE COLLEGE. It is not multi-tenant SaaS. No tenant resolver, tenant header, institution onboarding, tenant_id scaffolding or cross-college features.

MANDATORY READING:
Read AGENTS.md, docs/rebuild-v2/README.md and this authoritative execution pack. Then read the task's relevant PRD, architecture, ADR, data model, API, authorization, threat-model, UX, test and operations documents.

TASK ISOLATION:
Use the exact Linear task assigned to you. Create a dedicated branch from the controller-approved integration base. Own only the paths listed in your task. Do not edit another session's owned files. Do not independently change shared API contracts, database migrations, authorization policy, design tokens or build configuration.

IMPLEMENTATION:
Inspect before editing. Produce a concise plan and risk list. Implement the smallest coherent change. Add normal, boundary, negative, failure and relevant concurrency tests. Verify behavior against version-matched official documentation using Context7 when useful. Review the full diff, dependencies, generated code, secrets and license notices. Update documentation. Use Conventional Commits. Open a PR against the approved integration base.

MCP:
Use only tools relevant to your task. Inspect documentation and actual schemas first. Do not create production resources during discovery. Verify each write result. Record MCP use and failures. Never invent a tool result.

TESTING:
Run exact relevant commands and report exit status and counts. Distinguish unit, mocked, sandbox and real-service tests. Test all finite configuration combinations where bounded; otherwise test each parameter's defaults, omitted/null/invalid/boundary values and pairwise option interactions. Test security/data-integrity invariants exhaustively. Never claim exhaustive testing without evidence.

SAFETY:
No real student data or secrets. Never weaken or skip a failing gate. Stop if scope, ownership or contracts conflict. Ask the controller for an API/schema/policy change rather than changing shared files yourself.

COMPLETION REPORT:
Give task ID, exact files, branch, commits, PR, contract version, commands/results, tests and skipped checks, security/privacy/migration impact, documentation changes, unresolved risks and precise handoff. Use Complete only when acceptance criteria are evidenced; otherwise Partially complete, Blocked or Not started.
~~~

---

# 5. Stage 0 — repository baseline

## J00 — Legacy repository audit

**Mode:** Sequential. **Code changes:** Documentation only.

~~~text
TASK J00 — LEGACY REPOSITORY AUDIT

Inspect the complete current repository and relevant GitHub state. Do not assume historical summaries are still accurate.

Inspect:
- Default branch, integration candidate, all active branches and open PRs.
- PR #12 and the frontend redesign PR #11, including changed files, comments, CI and merge state.
- Java/backend modules, frontend modules, configuration and runtime boundaries.
- All models, migrations, seed data and database constraints.
- Authentication, sessions, roles and authorization at every API boundary.
- All CI workflows, checks, dependency/security scans and deployment definitions.
- Tests, fixtures, mocks, test commands and actual execution.
- Dependency manifests, lockfiles, licenses, advisories and abandoned packages.
- Existing hosting, secrets references, environment variables and operational assumptions.
- Existing docs, diagrams, generated files and reusable UI/domain components.

Run available tests and quality/security checks where safe. Do not modify production or provision resources.

For every subsystem classify REUSE, IMPROVE, REPLACE, REMOVE or INVESTIGATE. Give evidence: path, commit/PR, test result, dependency/license, risk and migration cost.

Deliver:
1. docs/rebuild-v2/LEGACY_AUDIT.md
2. Exact current stack and module map.
3. Feature/reuse inventory with evidence.
4. Baseline commands, tool versions, pass/fail/skip counts.
5. Security, dependency, licensing and workflow findings.
6. Deployment assessment.
7. Data migration risks.
8. Rebuild-vs-reuse recommendation by subsystem.
9. Open questions for J01/J02.

Do not rewrite application code, remove files, upgrade dependencies or declare a failing baseline green. PR must contain audit/documentation changes only.
~~~

## J01 — Product and college policy validation

**Mode:** Sequential after J00. No speculative implementation.

~~~text
TASK J01 — PRODUCT VALIDATION

Use J00 findings and the existing PRD. Validate the product as a single-college platform.

Walk through Visitor, Student, Club/Department Member, Organization Administrator, Event Operator, College Administrator and Platform Operator journeys.

Resolve or explicitly mark unknown:
- College identity source, SSO availability and account lifecycle.
- Who can create publishers, clubs and departments.
- Who approves publishers and events.
- Whether organizers may approve their own events.
- Eligibility rules and student verification source.
- Event recurrence, timezone, venue and cancellation policy.
- Registration limits, cancellation deadlines, waitlist order and promotion window.
- Ticket issuance, QR payload, offline check-in and correction process.
- Permitted ingestion sources and source authorization.
- Notification channels, opt-out and delivery expectations.
- Roster visibility, exports, retention, deletion and audit obligations.
- Launch scope, support ownership and incident escalation.

Do not invent college policy or claim legal compliance. Record every assumption, owner decision required, consequence and safe default.

Update PRD, USER_JOURNEYS.md, AUTHORIZATION_MATRIX.md, OPEN_QUESTIONS.md and ACCEPTANCE_TRACEABILITY.md. Give each requirement a stable ID and testable acceptance statement.

No application code. Deliver a requirements baseline for J02.
~~~

---

# 6. Stage 2 — architecture and adoption decisions

## J02 — Architecture and ADR approval

**Mode:** Sequential after J00/J01.

~~~text
TASK J02 — EVIDENCE-BASED ARCHITECTURE

Use the actual J00 inventory and J01 product decisions. Compare current subsystems with candidate replacements. Do not treat the existing proposed Next.js/Fastify/PostgreSQL architecture as approved.

For each subsystem decide retain, improve, replace or remove:
- Backend framework and language.
- Frontend framework and route architecture.
- Database and migration tooling.
- Authentication/session management.
- Authorization and policy enforcement.
- Ingestion and background work.
- Search and caching.
- File/object storage.
- Notifications.
- Analytics.
- Observability.
- Hosting and deployment.

Evaluate at minimum implementation completeness, migration risk, security, data integrity, maintainability, developer velocity, official support, operating cost, region/latency, failure modes, and exit strategy.

Compare Neon, Supabase and the existing database. Select at most one primary transactional database. Do not combine Neon and Supabase by default. Evaluate Tinybird only for proven analytics needs. Evaluate Render against existing hosting. Do not provision production.

Use Context7 to confirm exact framework/library APIs and version compatibility. Verify all available MCP tools before relying on them.

Deliver ADRs with context, options, evidence, decision, consequences, rollback/exit path and required tests. Update ARCHITECTURE.md, ADR/README.md, DATA_MODEL.md, API_STANDARDS.md and OPERATIONS.md.

Do not implement product features. Freeze only decisions sufficiently evidenced; list unresolved decisions as explicit blockers for J03/J04.
~~~

## J03 — Open-source and tool due diligence

**Mode:** Sequential; isolated proofs of concept.

~~~text
TASK J03 — OPEN-SOURCE AND TOOL ADOPTION REVIEW

Evaluate existing named candidates only if they solve an identified requirement:
- affaan-m/ECC
- multica-ai/andrej-karpathy-skills
- DietrichGebert/ponytail
Also discover other candidates only for concrete requirements in approved ADRs.

For each candidate, create a REUSE-NNN record:
- Canonical upstream, owner, exact tag/commit and provenance.
- License, notice and redistribution obligations.
- Release history, maintainer activity, advisories and open security issues.
- Direct/transitive dependencies and package integrity.
- Install scripts, postinstall behavior, shell commands and filesystem access.
- Network calls, telemetry, subprocesses and credential access.
- Runtime and repository compatibility.
- Every relevant parameter: type, default, constraints, units and interactions.
- Failure behavior, errors, retries, timeout, cancellation and cleanup.
- Test evidence, reproducibility and benchmark against a simple baseline.
- Upgrade and removal path; maintenance burden.

Inspect scripts before executing. Run untrusted candidates in an isolated environment. Do not install into the production application workspace before acceptance.

Testing rule:
- Exhaust finite state/parameter combinations when practical.
- Test omitted/default/explicit/null/invalid/min/max/boundary values.
- Use pairwise combinations for large parameter matrices.
- Exhaust security invariants and destructive/failure paths.
- Verify permission denial, network loss, retry, timeout, cancellation, cleanup and malicious input.
- Record exact commands, versions, output and skipped cases.

Classify ADOPT, ADOPT WITH RESTRICTIONS, PROTOTYPE, REJECT or DEFER. Do not adopt frameworks for their branding or number of features. Update OPEN_SOURCE_ADOPTION.md and the dependency allowlist. No unapproved runtime dependencies.
~~~

## J04 — Engineering foundation and CI

**Mode:** Sequential after architecture decisions.

~~~text
TASK J04 — ENGINEERING FOUNDATION

Implement the minimum foundation required by approved ADRs and J00/J02 evidence.

Establish:
- Reproducible local setup and supported runtime versions.
- Build, format, lint, type-check and test commands.
- Unit, integration, contract and E2E test boundaries.
- Environment configuration and safe secret handling.
- CI checks for build, tests, dependency audit, license policy, secret scanning and relevant static analysis.
- Database migration validation in CI, if applicable.
- API schema generation/validation and compatibility check.
- Test fixtures using synthetic data only.
- Logging, error response and health-check conventions.
- Code ownership and module boundaries.
- Branch, PR, commit and release conventions.

Do not add tools merely because they are in the engineering standard catalog. Inspect the current pipeline and reuse proven checks. Do not disable existing required checks to get green CI.

Create a developer setup that works from a clean checkout. Demonstrate it with exact commands. Do not add business features or provision production resources.

Deliver updated AGENTS.md, ENGINEERING_STANDARDS.md, PIPELINE_MAPPING.md, README setup and CI evidence. Publish the approved module/file ownership map.
~~~

## J05 — Database, API and contract baseline

**Mode:** Sequential. **Single schema/migration owner for the programme.**

~~~text
TASK J05 — DATA MODEL AND API CONTRACT OWNER

Own the initial database contract and all shared migration decisions. Inspect the existing models before changing them.

Design only the approved one-college domain: identity references, clubs/departments, memberships, venues, events/occurrences, source registry/provenance, moderation, registrations, idempotency, waitlist, tickets/check-in, notifications and audit data as justified.

Requirements:
- No tenant table or tenant_id scaffolding.
- Correct uniqueness, foreign keys, check constraints and deletion rules.
- Explicit UTC instants and IANA timezone handling.
- Transaction boundaries and locking strategy for registration/waitlist/check-in.
- Data minimization and retention rules.
- Indexes justified by known query paths.
- Stable API contracts, pagination, errors, validation and authorization annotations.
- No network calls inside long-running database transactions.

Prove:
1. Fresh database installation.
2. Upgrade from the actual baseline schema.
3. Migration interruption and recovery strategy.
4. Referential and uniqueness constraints.
5. Transaction rollback.
6. Capacity and idempotency constraints.
7. Backup/restore compatibility.

Publish a versioned schema and API contract. Freeze shared contracts before Wave A. You remain the only migration author unless the controller explicitly transfers ownership. Other sessions must submit migration requests rather than edit migration files.
~~~

---

# 7. Wave A — core backend parallel work

**Start condition:** J00–J05 accepted; module, schema, API and ownership contracts frozen. Start at most three sessions.

## J06 — Identity, sessions and authorization

~~~text
TASK J06 — IDENTITY AND AUTHORIZATION

Implement the approved identity/session flow and centralized authorization policy. Follow the approved identity-provider decision; do not assume college SSO exists.

Own only identity, session and policy implementation paths assigned by the controller. Coordinate schema changes with J05.

Implement:
- Login, logout, session expiry, revocation and recovery/verification as approved.
- College-wide roles plus scoped club/department memberships and event assignments.
- Multiple organization memberships without privilege leakage.
- Least privilege and default deny.
- Server-side policy checks for read, write, roster, export, file, search, check-in and background-job access.
- Auditable privileged actions.
- Safe cookie/session/CSRF/CORS behavior for the selected architecture.

Test direct-object reference abuse, role escalation, mass assignment, cross-organization access, stale/revoked sessions, operator overreach, missing context, malformed claims and permission changes during active sessions.

Never implement tenant resolution. Hidden UI controls do not count as authorization. Publish policy contracts and negative tests. Do not modify other sessions' domain or UI files.
~~~

## J07 — College organizations, events and moderation

~~~text
TASK J07 — ORGANIZATION AND EVENT DOMAIN

Implement the approved one-college directory and event domain using the frozen J05 contracts.

Own organization, membership-domain, event, occurrence, venue, lifecycle and moderation implementation paths assigned by the controller. Consume J06 authorization contracts; do not reimplement access checks independently. Request schema changes from J05.

Implement approved workflows for club/department membership, event drafts, submissions, approval/rejection, publication, material revision, cancellation, completion and archive.

Verify:
- Lifecycle transition rules and actor permissions.
- Multiple memberships and organization scope.
- Organizer ownership changes.
- Approval and self-approval policy.
- Event revisions and immutable moderation audit.
- Recurrence, daylight-saving changes, UTC conversion and IANA timezone behavior.
- Cancellation and material-change side effects.
- Capacity metadata without duplicating J12 registration logic.

Add domain, API integration, authorization-negative and timezone tests. Provide stable API contracts for public discovery, student workspace and organizer/admin clients. Do not change shared design tokens or migrations independently.
~~~

## J08 — Secure source ingestion

~~~text
TASK J08 — SECURE EVENT INGESTION

Implement only approved ingestion methods and allowlisted sources: manual entry, CSV, ICS, RSS and Atom as approved by the product decisions. Do not invent permission to scrape private or authenticated pages.

Own ingestion adapters, parsers, normalization and worker paths. Consume J05 source/provenance contracts and J07 event contracts. Request shared contract changes rather than editing them.

Pipeline: allowlisted source → safe fetch/import → bounded parse → normalize → validate → deduplicate → persist provenance → moderation queue → approved publication.

Defend against:
- SSRF and DNS rebinding.
- Private, loopback, link-local and metadata IPs.
- Redirect chains and protocol confusion.
- Unbounded response size, decompression bombs and parser complexity.
- Malformed encodings, hostile HTML/XML and external entities.
- Slow responses, timeout, retry storms and duplicate jobs.
- Poisoned timestamps, timezones and recurrence rules.
- Duplicate and conflicting events.

Test source authorization, DNS/redirect changes, malformed/oversized fixtures, timeouts, retries, cancellation, idempotency and cleanup. AI extraction, if approved at all, produces a proposal for human review and never directly publishes. Record provenance and parser version.
~~~

## Wave A integration gate

~~~text
WAVE A GATE — CORE BACKEND INTEGRATION

Review J06, J07 and J08 PRs against frozen contracts.

Verify ownership boundaries, API compatibility, authorization hooks, transaction and migration requests, audit behavior, ingestion containment, documentation and tests.

Run module tests and cross-module integration tests. Confirm no session edited another session's owned paths. Resolve semantic conflicts with the owning session; never choose one side of a conflict automatically.

Do not dispatch Wave B until:
- Auth policy is stable.
- Event lifecycle and discovery API are stable.
- Source and provenance contract is stable.
- The registration contract and ownership boundary are agreed.
- Migrations are integrated and verified.
- Required CI checks pass.

Update Linear dependencies, SESSION_CONTROL_BOARD.md, API standards, acceptance traceability and the session ownership map. Publish GO, HOLD or STOP with evidence.
~~~

---

# 8. Wave B — parallel user experiences and registration

**Start condition:** Wave A integrated; API, authorization, event and design contracts stable. Up to four sessions. Frontend sessions must own distinct route/component paths. J12 is the sole registration implementation owner.

## J09 — Public discovery experience

~~~text
TASK J09 — PUBLIC DISCOVERY

Use approved Stitch designs and the shared design system. v0 may be used for bounded scaffolding only after inspecting generated source and dependency effects.

Implement public event discovery, details, filters, category and organization views, venue/date information, calendar export and the approved search behavior. Consume stable APIs; do not change backend schema or shared auth policy.

Cover loading, empty, error, offline, cancelled, full, unpublished and stale-result states. Respect public visibility and server-side authorization.

Test responsive breakpoints, keyboard-only navigation, semantic HTML, focus management, accessible names, color contrast, date/time presentation, API failure and browser behavior. Run accessibility automation plus manual checks for critical journeys. Measure core Web Vitals/performance against agreed budgets.

Do not invent UI flows outside the PRD. Do not add a separate design system or UI library. Document screenshots/design references and implementation differences.
~~~

## J10 — Student workspace

~~~text
TASK J10 — STUDENT EXPERIENCE

Implement the student workspace using approved designs, stable API contracts and the shared component system.

Scope: student dashboard, bookmarked events, registration status, cancellation, waitlist status, tickets, calendar preferences and notification preferences where approved.

Do not implement registration capacity rules in the frontend. Do not expose rosters or another student's data. Server authorization remains authoritative.

Test unauthorized requests, stale sessions, empty/loading/error states, cancellation and status transitions, duplicate interactions, keyboard access, screen-reader semantics, responsive behavior and API/network failures.

Use v0 only for isolated component acceleration after source review. Coordinate shared components rather than changing shared tokens independently. Update student-facing documentation only for behavior verified in this session.
~~~

## J11 — Organizer and college administrator workspace

~~~text
TASK J11 — ORGANIZER AND COLLEGE ADMIN UI

Implement organizer, event-operator and college-administrator workflows using approved Stitch designs and authorization contracts.

Organizer scope: create/edit/submit events, view moderation outcomes, manage assigned events, see scoped registration information and operate approved event functions.

College-admin scope: publisher/organization governance, event approval queue, moderation, source registry, policy controls and audit views as confirmed by J01.

Event operator scope: assigned-event roster/check-in tools only.

Never rely on hidden controls for access control. Every API request must be protected server-side. Do not expose college-wide roster data to organization or event operators without a documented requirement.

Test direct URL access, role changes, multiple organization memberships, scoped rosters/exports, event assignment, approval conflicts, audit visibility, keyboard accessibility, responsive layouts and API failure states.

Keep routes/components within assigned ownership. Do not modify shared domain, authorization or migration files independently.
~~~

## J12 — Registration, capacity, cancellation and waitlist

~~~text
TASK J12 — REGISTRATION AND WAITLIST OWNER

This session is the only implementation owner for registration/capacity/waitlist behavior. Coordinate any schema change with J05 and consume J06/J07 contracts.

Implement server-authoritative:
- Eligibility checks.
- Capacity enforcement.
- Registration uniqueness.
- Idempotency and safe retry.
- Cancellation and seat release.
- Deterministic waitlist order and promotion policy.
- Expiration/claim window if approved.
- Audit of registration, cancellation and promotion.
- Notifications through an outbox or approved delivery boundary.

Do not trust frontend availability checks. Use database constraints and appropriate transactions/locking. Keep provider/network calls outside critical DB transactions. Ensure retrying a request cannot create a second registration or duplicate side effect.

Mandatory concurrency proof:
Given 50 remaining seats and 200 simultaneous valid registration attempts, exactly 50 may become confirmed. The remainder must receive outcomes matching the approved waitlist policy.

Also test same-key retries, different-key duplicate requests, concurrent cancellation and registration, promotion races, worker retry, process interruption, deadlocks, rollback and capacity never becoming negative. Repeat critical concurrency tests and record runtime/environment.

Publish a stable API contract to J10/J11. Do not allow other sessions to duplicate registration logic.
~~~

## Wave B integration gate

~~~text
WAVE B GATE — USER EXPERIENCE AND REGISTRATION

Integrate J09/J10/J11/J12 in dependency order.

Verify:
- All clients consume the approved contracts.
- Registration state is server authoritative.
- Organization and event access are enforced server-side.
- UI routes and shared components have no ownership conflict.
- All important error/loading/empty/success states exist.
- Keyboard and responsive behavior are tested.
- Registration concurrency and idempotency evidence is reproducible.
- API errors are consistently handled.
- Design, API, data model and docs remain synchronized.

Run browser E2E for visitor, student, organizer, event operator and college-admin workflows. Check the full diff for generated code, unnecessary dependencies, secrets and duplicated logic.

Only dispatch J13 after ticket/check-in interfaces and registration state are stable. Publish GO/HOLD/STOP and update Linear and SESSION_CONTROL_BOARD.md.
~~~

---

# 9. Wave C — attendance and operational features

## J13 — Tickets, check-in, notifications

**Start condition:** J12 registration contract frozen and Wave B integration accepted.

~~~text
TASK J13 — TICKETS, CHECK-IN AND NOTIFICATIONS

Implement only approved ticket, attendance and notification capabilities.

Ticket requirements:
- Unpredictable, non-sensitive ticket credential.
- Server-side validation.
- Revocation and expiry.
- No unnecessary student data embedded in QR payload.
- Event and registration binding.

Check-in requirements:
- Event-scoped operator permissions.
- At-most-once check-in under normal operation.
- Explicit authorized correction workflow.
- Safe duplicate/replay handling.
- Audit actor, timestamp, event, registration and correction reason.
- Concurrency-safe scanner operation.
- Offline mode only if explicitly approved; document reconciliation risks.

Notifications:
- Approved channels and preference policy.
- Idempotent delivery/outbox.
- Retry with bounded backoff.
- Provider outage and poison-message handling.
- No duplicate high-impact notifications.
- No sensitive details in subject lines or logs.

Test forged, expired, revoked and replayed tickets; duplicate/concurrent scans; wrong-event scan; unauthorized operator; correction; duplicate job; worker crash; provider timeout/outage; retry and cleanup.

Coordinate API, data and migration changes with contract owners. Document real-provider tests separately from mocked tests.
~~~

---

# 10. Integration, assurance and release prompts

## J14 — Full integration and end-to-end verification

~~~text
TASK J14 — INTEGRATION OWNER

Work only after feature PRs are reviewed and ready to integrate. Inspect every PR diff and its evidence; do not accept completion claims at face value.

Merge/integrate in dependency order. Preserve the approved integration base. Resolve conflicts semantically with the owner. Re-run affected tests after each integration.

Run:
- Clean environment setup/build.
- Fresh and upgrade database migrations.
- Unit, integration and contract suites.
- API authorization-negative tests.
- Browser E2E for all approved user journeys.
- Registration capacity/idempotency/waitlist concurrency tests.
- Ingestion hostile-input/SSRF tests.
- Ticket/check-in replay and concurrency tests.
- Accessibility and responsive checks.
- Dependency, license, secret and static-analysis gates.
- Performance baseline and query plan review.

Update requirement-to-code-to-test-to-documentation traceability. Identify test gaps, flaky tests, duplicated implementation, dead code and mismatched documentation.

Do not weaken or delete tests to achieve green. Fix root causes. Provide reproducible commands and reports. Do not approve production release until J15/J16 evidence is complete.
~~~

## J15 — Independent security, privacy and performance audit

~~~text
TASK J15 — INDEPENDENT ASSURANCE

Act as an independent reviewer. Do not simply repeat the development sessions' checklists or trust their reports.

Inspect actual code, CI artifacts, dependencies, migrations, API routes, policy enforcement, source connectors, frontend bundles, infrastructure configuration and data flows.

Assess:
- Authentication/session security.
- Direct-object and organization/event authorization.
- Privilege escalation and mass assignment.
- CSRF, XSS, injection, unsafe redirects and CORS.
- SSRF, DNS rebinding, private-address and parser attacks.
- Upload/download and storage access.
- Secret leakage and dependency/supply-chain risk.
- PII exposure in logs, analytics, telemetry and third parties.
- Registration, waitlist and check-in concurrency.
- Query performance, N+1, indexes, connection pooling and resource limits.
- Rate limiting and abuse.
- Backup, restore and operational controls.

Use safe test accounts and synthetic data. Do not attack production or run destructive tests against live services.

For each finding provide severity, affected path, impact, reproduction, evidence, remediation and verification test. Re-test fixes independently. Distinguish exploitable issues from hardening suggestions. Unresolved critical/high findings block release unless formally accepted by the authorized owner with mitigation and expiry.
~~~

## J16 — Deployment, observability and recovery

~~~text
TASK J16 — OPERATIONS AND RELEASE ENGINEERING

Use the hosting/database architecture accepted by ADRs. Inspect existing deployments before creating or changing resources.

Implement:
- Reproducible CI/CD and environment separation.
- Least-privilege deployment identities.
- Managed secrets and rotation guidance.
- Safe database migration/release sequencing.
- Health/readiness checks.
- Structured logs, metrics and traces with privacy filtering.
- Alerts for actionable failures.
- Backup and point-in-time recovery where supported.
- Tested restore procedure.
- Rollback and forward-fix strategy.
- Preview/staging deployment and smoke tests.
- Cost and resource limit monitoring.

Use Render only if selected. Use Neon or Supabase only if selected. Do not provision both by default or duplicate transactional storage.

Run a restore drill in a non-production environment using synthetic data. Verify deployed app health and core user journeys. Document exact environment settings by name only, never secret values. Do not perform destructive production changes without explicit authorization.
~~~

## J17 — Documentation, training and handover

~~~text
TASK J17 — FINAL DOCUMENTATION AND HANDOVER

Audit every document against actual source code, API behavior, CI, database and deployed release. Remove stale claims; do not preserve planned behavior as if shipped.

Complete:
- Student guide: discover, register, cancel, waitlist, ticket and notifications.
- Organizer guide: publisher setup, event authoring, submission, revisions, attendee operations and scoped reports.
- Event operator guide: event assignment, check-in, correction and incident escalation.
- College administrator guide: organizations, approvals, moderation, source management, audit and governance.
- Developer guide: clean checkout, toolchain, setup, tests, migrations and contribution workflow.
- API reference and examples using synthetic data.
- Architecture diagrams, module map, ERD and ADR index.
- Security/privacy/data flow/retention documentation.
- Deployment, monitoring, incident response, backup and restore runbooks.
- Release notes, known limitations and support escalation.

Verify each guide step by following it against the release candidate. Screenshots must not expose personal data or secrets. Keep docs versioned with the product. Deliver a traceability report and handover checklist. Do not claim the documentation is complete until the relevant procedures have been tested.
~~~

---

# 11. Reusable control prompts for keeping parallel sessions synchronized

Use these prompts from the programme controller whenever the state changes.

## 11.1 Dispatch a session

~~~text
CONTROLLER — DISPATCH SESSION

Before dispatch, verify the task's dependencies, API/schema/design contract, Linear issue, branch base and owned paths.

Prepare a task envelope containing:
- Task ID and Linear issue URL.
- Goal and explicit non-goals.
- Approved contract/ADR versions.
- Branch name and PR target.
- Exclusive owned paths.
- Forbidden/shared paths.
- Required MCPs and permitted actions.
- Acceptance criteria and mandatory tests.
- Dependencies and handoff consumer.
- Stop conditions.

Confirm that no active session owns the same paths. If ownership conflicts or contract is unstable, do not dispatch; report HOLD.
~~~

## 11.2 Session check-in

~~~text
SESSION CHECK-IN

Report only current facts:
1. Task ID and current status.
2. Current branch and latest commit.
3. Files changed and owned paths.
4. Work completed against acceptance criteria.
5. Exact tests run and results.
6. MCP operations performed and verified.
7. New dependencies, migrations or API changes proposed.
8. Blockers and decisions required.
9. Next bounded action.

Do not report a percentage complete unless it is based on explicit acceptance criteria. If blocked, stop work on dependent changes and notify the controller.
~~~

## 11.3 Contract change request

~~~text
CONTRACT CHANGE REQUEST

Do not modify shared contracts directly. Submit:
- Contract/API/schema/policy being changed.
- Why the current contract is insufficient.
- Exact proposed change and compatibility impact.
- Affected sessions and owned paths.
- Migration and rollback plan.
- Required tests and documentation.
- Whether current work must pause.

Wait for the designated owner/controller decision before implementing the shared change.
~~~

## 11.4 Handoff a completed session

~~~text
SESSION HANDOFF

Provide:
- Task ID, Linear issue, branch, PR and commit SHA.
- Exact owned files changed.
- Contract versions consumed and any proposed changes.
- Acceptance criteria with evidence links.
- Commands, environment and test results.
- Security, privacy, data and migration impact.
- MCPs used and results.
- Known gaps, skipped tests and residual risks.
- Merge order and downstream consumer.
- Whether the branch is safe to integrate.

Do not merge your own work unless the controller explicitly delegated integration authority.
~~~

## 11.5 Integrate a pull request

~~~text
CONTROLLER — PR INTEGRATION REVIEW

Inspect the full diff, changed filenames, commit history, CI, review comments and test evidence. Compare it with the assigned Linear issue, owned paths, ADRs and acceptance criteria.

Reject or request changes for:
- Scope creep or unapproved dependencies.
- Shared-path ownership violations.
- Unapproved migrations or contract changes.
- Missing negative/failure/concurrency tests.
- Secrets or personal data.
- Security gate suppression.
- Generated code that has not been reviewed.
- Documentation that claims unimplemented behavior.

If acceptable, merge only into the approved integration branch using the approved merge method. Record the merged commit and update the Linear issue and session board. Re-run affected integration tests and record the result.
~~~

## 11.6 Resume after a Jules session restart

~~~text
RESUME SESSION SAFELY

Do not assume conversation memory is current. Re-read AGENTS.md, this execution pack, the assigned Linear issue, SESSION_CONTROL_BOARD.md, the latest integration branch and your current PR.

Inspect git status, branch head, diff, recent commits, review comments, CI and ownership map. Identify any changes made since your last session.

Do not overwrite or revert newer work. Reconfirm the task's acceptance criteria and owned paths. Continue only if the task is still active and no contract or ownership conflict exists. Otherwise report the conflict to the controller.
~~~

---

# 12. How to keep the programme under control

## 12.1 Single source of truth

Use:
- **Linear** for task state, dependencies, blockers, ownership and acceptance.
- **GitHub** for branches, commits, PRs, reviews, CI and code.
- **SESSION_CONTROL_BOARD.md** for the cross-session operational snapshot.
- **ADRs and contract documents** for approved technical decisions.

Do not maintain contradictory progress in chat messages, spreadsheets and multiple boards. The board is a summary; Linear and GitHub are authoritative for their respective records.

## 12.2 Status model

Use only these task states:

- BACKLOG — not yet ready.
- READY — dependencies and ownership are stable.
- IN PROGRESS — session actively implements.
- BLOCKED — exact blocker and owner are recorded.
- IN REVIEW — PR exists and required checks are running.
- INTEGRATION — approved for integration testing.
- DONE — acceptance criteria and evidence verified.
- REJECTED/DEFERRED — decision and reason recorded.

A Jules session saying "finished" means the task is ready for review, not DONE.

## 12.3 Session limits

- Stage 0–5: one active sequential gate at a time.
- Wave A: at most three simultaneous implementation sessions.
- Wave B: at most four, only after Wave A contract and integration gate.
- Wave C: J13 after registration contracts; assurance and operations follow their own prerequisites.
- Keep one controller/integration session active throughout.
- Do not dispatch work if the controller cannot review or integrate the results.

If CI queues, merge conflicts, review load or shared-contract churn rise, reduce concurrency.

## 12.4 Branch and PR naming

Recommended branches:
- jules/J00-legacy-audit
- jules/J01-product-validation
- jules/J02-architecture
- jules/J03-oss-review
- jules/J04-engineering-foundation
- jules/J05-data-contract
- jules/J06-identity-access
- jules/J07-event-domain
- jules/J08-ingestion
- jules/J09-public-discovery
- jules/J10-student-workspace
- jules/J11-organizer-admin
- jules/J12-registration
- jules/J13-attendance-notifications
- jules/J14-integration
- jules/J15-security-performance
- jules/J16-deployment-recovery
- jules/J17-documentation

Use a short suffix only if a name already exists. Branch from the controller-approved integration base. PR title begins with the task ID and conventional type, for example: J06 feat: implement identity and authorization.

## 12.5 Path ownership

Before dispatch, write exact path ownership in SESSION_CONTROL_BOARD.md. Use module-level boundaries. Shared paths need a named owner:
- Database migrations and shared data model: J05, with controller approval for transfers.
- Auth and authorization policy: J06.
- Event lifecycle and domain contracts: J07.
- Ingestion adapters and parser: J08.
- Shared design tokens and UI primitives: designated design-system owner (normally J04 or controller); UI sessions consume them.
- Registration/waitlist: J12.
- Cross-module integration: J14/controller.
- Documentation index and session board: controller; task-specific docs can be edited by their owner without changing the index.

Generated API clients and shared OpenAPI contracts must have one owner. UI sessions must not change API generation or schema configuration independently.

## 12.6 Check-in cadence

At each meaningful checkpoint, every active session uses the Session Check-in prompt. Do not ask for repetitive updates if no work has changed.

The controller updates:
- Linear status and dependency.
- GitHub PR and CI status.
- Session board.
- Known blockers and decisions.
- Contract freeze/unfreeze status.

Before launching another wave, reconcile all open PRs and unresolved reviews.

## 12.7 Merge order

Merge only after review and required CI:
1. Foundation and database/API contracts.
2. Identity and authorization.
3. Event/domain and ingestion.
4. Registration and client-facing APIs.
5. Public/student/admin UI.
6. Tickets/check-in/notifications.
7. Integration fixes.
8. Security/performance remediations.
9. Operations and docs.

This order may be adjusted only with an explicit dependency explanation. Re-run all affected tests after every integration merge.

## 12.8 Stop conditions

Immediately HOLD or STOP when:
- Two sessions claim the same file or contract.
- The integration branch changed unexpectedly.
- A required schema/API/auth decision is not approved.
- A migration is destructive or cannot be safely rolled forward.
- A security gate fails.
- Tests reveal an authorization or data-integrity bypass.
- An MCP tool would mutate production without approved authorization.
- A provider's tool schema or behavior is unclear.
- External data handling is not approved.
- A session proposes broad rewrites beyond its scope.

Never resolve these by silently choosing the faster option.

---

# 13. SESSION_CONTROL_BOARD.md template

Keep this as a living document. Update it at dispatch, check-in, PR creation, review, merge and gate transitions.

~~~markdown
# CampusConnect 2.0 — Session Control Board

Last reconciled: YYYY-MM-DD HH:MM UTC
Integration base: <approved branch + commit SHA>
Default branch: <branch>
Controller session: <session reference>

## Gate state
| Gate | State | Evidence | Decision owner |
|---|---|---|---|
| J00–J05 | NOT STARTED / IN PROGRESS / PASS / HOLD | links | controller |
| Wave A | NOT READY / ACTIVE / PASS / HOLD | links | controller |
| Wave B | NOT READY / ACTIVE / PASS / HOLD | links | controller |
| Wave C | NOT READY / ACTIVE / PASS / HOLD | links | controller |
| J14 integration | NOT READY / ACTIVE / PASS / HOLD | links | controller |
| J15 assurance | NOT READY / ACTIVE / PASS / HOLD | links | independent reviewer |
| J16 operations | NOT READY / ACTIVE / PASS / HOLD | links | controller |
| J17 handover | NOT READY / ACTIVE / PASS / HOLD | links | controller |

## Active sessions
| Task | Linear issue | Branch | PR | Owned paths | Status | Contract version | CI/tests | Blocker | Next action |
|---|---|---|---|---|---|---|---|---|---|

## Shared ownership
| Shared area | Owner | Consumers | Frozen? | Change request |
|---|---|---|---|---|
| Database schema/migrations | J05 | all backend sessions | yes/no | issue URL |
| Auth/authorization policy | J06 | all features | yes/no | issue URL |
| Event/API contracts | J07 | UI/J12/J13 | yes/no | issue URL |
| Registration contract | J12 | J10/J11/J13 | yes/no | issue URL |
| Design tokens/shared UI | named owner | J09/J10/J11 | yes/no | issue URL |

## Open blockers and decisions
| ID | Decision/blocker | Owner | Affected tasks | Due gate | Resolution/evidence |
|---|---|---|---|---|---|

## Integration log
| Date | PR | Task | Merge commit | Tests rerun | Result |
|---|---|---|---|---|---|

## Release evidence
- Acceptance traceability:
- Security review:
- Accessibility:
- Performance:
- Migration and restore:
- Deployment smoke tests:
- User guides:
- Known risks:
~~~

---

# 14. Final release acceptance

CampusConnect is not complete because all Jules tasks have closed. Completion requires evidence that the actual product works.

## Product
- All approved user journeys work end to end.
- College, organization and event-level permissions are correct.
- Event lifecycle and moderation are correct.
- Registration, cancellation, capacity and waitlist are transactionally sound.
- Ticket issuance and check-in prevent unauthorized access and replay.
- Ingestion uses approved sources and safe parsing.
- Notifications follow preferences and handle provider failures.

## Engineering
- Approved architecture and ADRs are reflected in code.
- Fresh installation and schema upgrades work.
- No unreviewed dependency or generated code remains.
- All required tests and CI gates pass.
- No unresolved critical/high security finding remains without authorized risk acceptance.
- No known critical data-integrity defect remains.
- Performance is measured against documented workload assumptions.

## UX and accessibility
- Every core workflow is responsive and keyboard accessible.
- Error, empty, loading, success, offline and unavailable states are implemented.
- Automated accessibility checks and manual critical-flow checks are complete.

## Operations
- Deployment is reproducible.
- Secrets and environments are managed safely.
- Health checks and monitoring work.
- Backup and restore are tested.
- Rollback/forward-fix procedures are documented.
- Production-like smoke tests pass.

## Documentation
- Student, organizer, operator, administrator and developer guides match actual behavior.
- Architecture, APIs, data model, ADRs and threat model match code.
- Runbooks have been exercised.
- Acceptance traceability links to actual test/release evidence.
- Known limitations and residual risks are explicit.

## Final completion report

The controller must publish:

1. Final release branch and commit SHA.
2. All merged PRs and associated Linear issues.
3. Implemented features mapped to requirement IDs.
4. Exact test commands, environments, counts and outcomes.
5. Security, privacy, dependency and license findings.
6. Migration, backup, restore and deployment evidence.
7. Accessibility and performance evidence.
8. Documentation links.
9. Outstanding risks, accepted exceptions and deferred work.
10. A clear status: Complete, Partially complete, Blocked or Not started.

Do not say "perfect" or "fully tested" as a substitute for evidence. The release is complete only when the applicable acceptance criteria are verified.
