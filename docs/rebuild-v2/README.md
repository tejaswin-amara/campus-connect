# CampusConnect 2.0 Rebuild Documentation

This folder contains the greenfield programme baseline. The existing docs/ tree remains the legacy implementation evidence package and is not overwritten.

| Document | Purpose |
|---|---|
| [PRD](PRD.md) | Vision, users, requirements, launch scope and acceptance |
| [Architecture](ARCHITECTURE.md) | Runtime topology, modules and architecture principles |
| [ADR index](ADR/README.md) | Decision queue and decision format |
| [Data model](DATA_MODEL.md) | Conceptual entities, tenancy and invariants |
| [API standards](API_STANDARDS.md) | Contracts, errors, authorization and idempotency |
| [Threat model](THREAT_MODEL.md) | STRIDE, privacy, agent and CI security |
| [Open-source adoption](OPEN_SOURCE_ADOPTION.md) | Repository/package/tool evaluation protocol |
| [Test strategy](TEST_STRATEGY.md) | Test levels, adversarial cases and quality gates |
| [Operations](OPERATIONS.md) | Environments, deployment, backup, recovery and release |
| [Jules plan](JULES_EXECUTION_PLAN.md) | Multi-session implementation and handoff plan |

## Governance
Requirements use stable IDs (FR-... and NFR-...). Decisions use ADR-NNN. Reuse evaluations use REUSE-NNN. Mark assumptions and provisional choices clearly. Jules updates documentation with behavior changes; reviewers verify documentation against code and runtime evidence.
