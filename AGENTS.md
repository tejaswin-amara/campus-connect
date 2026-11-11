# Google Jules Project Contract

Jules is the exclusive implementation and documentation agent for CampusConnect 2.0. Read docs/rebuild-v2 before changing code. Existing docs/ describes the legacy/current implementation and must be preserved; do not overwrite it with assumptions about the rebuild.

## Required loop
Inspect repository and requirements → plan scope/risks → implement the smallest coherent change → add normal/boundary/negative/failure/concurrency tests → run relevant gates → inspect diff and dependencies → update docs → commit with Conventional Commits → report evidence and residual risks.

## Reuse gate
No package, repository, copied code, starter, skill, tool or MCP server enters the project without a completed docs/rebuild-v2/OPEN_SOURCE_ADOPTION.md evaluation. Pin versions and lockfiles. Inspect license, provenance, maintainers, advisories, transitive dependencies, install scripts, permissions, network/telemetry, runtime compatibility, actual config, failure behavior and removal path. Test every relevant parameter: defaults, valid boundaries, omitted/null/empty, invalid values, interacting options, concurrency, retry, timeout, cancellation, network loss, permission failure, malformed/large/Unicode/malicious inputs and restart/cleanup. Use pairwise testing for interactions and exhaustive tests for security invariants. Benchmark against a simple baseline.

## Architecture
Modular monolith first. No microservices, Kubernetes, Kafka, separate search cluster or vector DB without accepted evidence-based ADR. Domain logic must not depend on HTTP/UI/infrastructure. Tenant scope is explicit and checked server-side. Ingestion is untrusted and SSRF-resistant. Capacity, waitlist and check-in invariants are database-backed. Store UTC instants and IANA timezones.

## Safety
No secrets or real student data in source, logs, fixtures, docs or Jules prompts. Never weaken or skip a failing gate. A tenant leak, auth bypass, privilege escalation, secret exposure, SSRF exploit or registration capacity overrun blocks release.

## Task contract
Every Jules session states task ID, goal, non-goals, dependencies, allowed/forbidden paths, relevant ADRs, acceptance criteria, tests, security checks and docs. Do not parallelize conflicting schema/auth/API-contract changes.

## Completion report
List exact files, commands/results, tests, security and migration impact, docs changed, PR/commit and unresolved risks. Compilation alone is not completion. Mark unavailable checks blocked, not passed.
