# Operations, Deployment and Release

**Status:** Design baseline; cloud resources require ADR approval.

## Environments
Local pinned toolchain; CI ephemeral DB and deterministic fakes; preview/staging production-like with synthetic data; production managed secrets, private DB networking, backups, telemetry, alerts and restricted operator access. Never copy production student data into preview/Jules sessions.

## Configuration and secrets
Validate config at startup. Keep example env free of real values. Use managed secret references, separate environment credentials, rotate them and never print values.

## CI/CD
PR: format/lint/typecheck → unit/integration/contract → migration validation → dependency/license/secret/SAST → build → container/IaC scan → preview → smoke/E2E.
Release: protected main/approved PRs → immutable artifact → SBOM/provenance → staging → smoke/security/migration → approval → production promotion → monitoring. Pin third-party Actions to immutable SHAs and minimum permissions.

## Migrations
Use expand/contract. Deploy additive schema before dependent code. Review locks, table rewrites and indexes. Back up before destructive changes. Do not mutate production schema on app startup.

## Observability
Structured logs include timestamp/severity/service/environment/request ID; exclude personal data and secrets. Metrics: request latency/errors, DB saturation, queue depth/age/retries, sync success, registration conflicts, check-in and notification delivery. Avoid personal IDs in metric labels.

## SLOs
Set targets after baseline. Candidate objectives: discovery availability/latency; registration success/latency; ingestion freshness; notification lag; recovery point/time. Each requires measurement, owner, alert, error-budget policy and runbook.

## Backup/recovery
Document schedule, retention, encryption, access and PITR. Restore to isolated environment; verify schema, invariants, startup and sample journeys. Untested backup is unproven.

## Incident response
Define severity, incident commander, communications, evidence, containment, recovery and postmortem. Runbooks: account compromise, tenant exposure, SSRF, credential leak, DB outage, queue backlog, migration failure and ticket abuse.

## Production readiness
- [ ] Requirements/ADRs approved.
- [ ] Tenant and authorization tests pass.
- [ ] No release-blocking security findings.
- [ ] Migrations/rollback reviewed.
- [ ] Load/concurrency and accessibility pass.
- [ ] Secrets/permissions reviewed.
- [ ] Restore drill passed.
- [ ] Alerts/runbooks exist.
- [ ] Staging smoke/E2E passes.
- [ ] Rollback rehearsed.
- [ ] User/admin docs match release.
- [ ] Known limitations and support owner recorded.
