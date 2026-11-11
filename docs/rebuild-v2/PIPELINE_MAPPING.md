# Engineering Pipeline v3.1.0 Mapping

Use the uploaded Engineering Pipeline v3.1.0 as the quality/governance reference. J00/J03 must verify the exact scripts, gate definitions and applicability against the checked-in archive/content before automation. Do not claim a gate ran merely because it appears in this mapping.

| Pipeline concern | CampusConnect application |
|---|---|
| Project scope and requirements | PRD, journeys, acceptance traceability |
| Architecture and ADRs | C4, module boundaries, ADR queue |
| CI/CD and release | protected PRs, immutable artifacts, staging gates |
| Security/STRIDE | threat model, authz matrix, abuse cases |
| Dependency/agent adoption | open-source adoption register, Jules contract |
| License/SBOM | license review, notices, SBOM |
| Database/migrations | migration policy, constraints, restore drill |
| API contracts | OpenAPI, schema validation, breaking-change checks |
| Web services/auth/jobs | session, authorization, worker retry/idempotency |
| Frontend/state | design system, route ownership, accessible states |
| Accessibility | WCAG 2.2 AA target and manual review |
| Ingestion/AI | source trust boundary, SSRF, human review for AI |
| Analytics/data | data minimization, aggregation and access policy |
| Infrastructure | approved minimal hosting, secrets and permissions |
| Observability/SLO | telemetry, queue/sync/registration metrics |
| Testing | unit/integration/contract/E2E/security/concurrency/performance |
| Coding-agent/MCP safety | scoped Jules tasks, branch isolation, tool review |
| Documentation | user/admin/API/architecture/operations handover |
| Local development/Git hooks | pinned environment, deterministic commands |

## Gate profile
- Every PR: formatting, lint, type/build, affected tests, secret scan and dependency review.
- Auth/data/ingestion/registration/ticket changes: mandatory security and adversarial tests.
- Release: full suite, migration verification, SBOM/license, accessibility, performance, backup restore, rollback and operations review.

Pipeline-specific scripts must be inspected before execution; adapt only with documented rationale. Never bypass a failed gate to meet a schedule.
