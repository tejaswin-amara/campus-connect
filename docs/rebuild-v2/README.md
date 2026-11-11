# CampusConnect 2.0 — Rebuild Documentation

**Scope: one college only.** This is a college-wide event system, not multi-tenant SaaS. Existing root-level legacy documentation remains preserved as historical implementation evidence.

## Product and experience
- [PRD](PRD.md) — requirements, MVP, non-goals and acceptance.
- [User journeys](USER_JOURNEYS.md) — student, organizer, administrator and visitor flows.
- [Authorization matrix](AUTHORIZATION_MATRIX.md) — role and resource permissions.
- [UX and design system](UX_AND_DESIGN_SYSTEM.md) — navigation, responsive and accessibility requirements.

## Engineering and architecture
- [Architecture](ARCHITECTURE.md) — proposed modules and runtime.
- [ADR index](ADR/README.md) — evidence-based decision records.
- [Data model](DATA_MODEL.md) — entities, constraints and transaction invariants.
- [API standards](API_STANDARDS.md) — contracts, errors and authorization.
- [Ingestion specification](INGESTION_SPEC.md) — connectors, normalization, provenance and SSRF defense.
- [Open-source adoption](OPEN_SOURCE_ADOPTION.md) — repository/package/tool verification.
- [OpenAI and external AI policy](OPENAI_AND_EXTERNAL_AI.md) — optional product AI boundaries.

## Quality, security and operations
- [Threat model](THREAT_MODEL.md) — STRIDE, privacy and agent/CI risks.
- [Student data privacy](DATA_PRIVACY.md) — data inventory, retention and review.
- [Test strategy](TEST_STRATEGY.md) — functional, adversarial and performance verification.
- [Acceptance traceability](ACCEPTANCE_TRACEABILITY.md) — requirement to evidence mapping.
- [Operations](OPERATIONS.md) — environments, release, recovery and incident response.
- [Legacy audit template](LEGACY_AUDIT_TEMPLATE.md) — J00 evidence capture.

## Google Jules delivery
- [Execution plan](JULES_EXECUTION_PLAN.md) — session dependencies.
- [Parallel workflow](PARALLEL_JULES_WORKFLOW.md) — safe concurrency and merge ownership.
- [Copy/paste session prompts](JULES_PROMPTS.md) — J00–J17 instructions.

## Governance
Requirements use stable FR/NFR IDs; decisions use ADR-NNN; reuse evaluations use REUSE-NNN. Mark assumptions, open questions and unverified claims. Jules updates documents with behavior changes. Existing docs outside this folder must not be deleted or silently rewritten during rebuild.
