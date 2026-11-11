# Google Jules Engineering Contract

Jules is the implementation and documentation agent for CampusConnect 2.0. Product scope is ONE COLLEGE ONLY. Read docs/rebuild-v2/ before changing code. Existing implementation and docs are legacy evidence and must be preserved until an explicit migration decision.

## Required loop
Inspect → plan scope/risks → implement the smallest coherent change → add normal/boundary/negative/failure/concurrency tests → run relevant gates → inspect diff/dependencies → update docs → commit Conventional Commit → report evidence and residual risks.

## Scope constraints
No multi-tenant SaaS framework, tenant resolver/header, institution onboarding, cross-college features, microservices, Kubernetes, Kafka, separate search cluster or vector DB without a new evidence-based requirement and approved ADR. Do not rewrite working code merely to change languages/frameworks. J00 audits; J02 decides; J03 validates dependencies.

## Reuse gate
No package, repository, copied code, starter, skill, tool or MCP server enters the project without a completed OPEN_SOURCE_ADOPTION.md evaluation. Pin versions and lockfiles. Inspect license/provenance, maintainers, advisories, transitive dependencies, install scripts, permissions, network/telemetry, runtime compatibility, configuration, failure behavior and removal path. Test relevant defaults, boundaries, invalid/omitted/null inputs, option interactions, concurrency, retry, timeout, cancellation, network loss, permission failure, malicious inputs and cleanup. Benchmark against a simple baseline.

## Architecture and security
Modular monolith first. Domain logic must not depend on HTTP/UI/infrastructure. Authorization is college-wide, organization-scoped and event-scoped; every API, export, storage, search, cache and background job checks scope. Student data is minimized. Ingestion is untrusted and SSRF-resistant. Capacity, waitlist and check-in invariants are database-backed. Store UTC instants and IANA timezones.

## Jules session isolation
Each session uses a dedicated branch and PR with explicit owned paths. Never have concurrent sessions edit the same migration, auth policy, API contract or shared component. Follow PARALLEL_JULES_WORKFLOW.md. Do not push directly to main.

## Safety
No secrets or real student data in source, logs, fixtures, docs or Jules prompts. Never weaken or skip a failing gate. Unauthorized roster disclosure, auth bypass, privilege escalation, secret exposure, SSRF exploit, registration capacity overrun or duplicate check-in blocks release.

## Task contract
Every Jules session states task ID, goal, non-goals, dependencies, allowed/forbidden paths, accepted ADRs, acceptance criteria, tests, security checks and docs. Stop if a dependency is missing or ownership conflicts.

## Completion report
List exact files, commands/results, tests, security and migration impact, docs changed, PR/commit and unresolved risks. Compilation alone is not completion. Mark unavailable checks blocked, not passed.
