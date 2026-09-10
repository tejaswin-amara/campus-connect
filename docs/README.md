# CampusConnect documentation

> **Documentation status:** Maintained for the current `main` branch
> **Last verified against:** Commit `39d5e6a`
> **Audience:** Developers, reviewers, release operators, security reviewers, and DBSE&DBD evaluators

This directory is the authoritative evidence package for CampusConnect. It distinguishes **implemented behavior** from **documented evolution**, records the cleanup decisions that shaped the repository, and provides reproducible commands for build, test, operations, and demonstration.

## Start here

| Need | Read |
| --- | --- |
| Understand the product and run it locally | [`README.md`](../README.md) |
| Understand implementation boundaries | [`TECHNICAL_GUIDE.md`](../TECHNICAL_GUIDE.md) and [`PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md) |
| Navigate C4 architecture and evolution | [`architecture/README.md`](architecture/README.md) |
| Understand schema, migrations, indexes, and locking | [`data/README.md`](data/README.md) |
| Review routes, validation, and OpenAPI | [`api/README.md`](api/README.md) |
| Operate, deploy, back up, and troubleshoot | [`operations/README.md`](operations/README.md) |
| Review security controls and residual risk | [`security/README.md`](security/README.md) and [`../SECURITY.md`](../SECURITY.md) |
| Run tests and interpret CI evidence | [`testing/README.md`](testing/README.md) |
| Prepare a five-to-ten-minute assessment demonstration | [`showcase.md`](showcase.md) |

## Documentation map

### Product, requirements, and assessment

| Document | Purpose |
| --- | --- |
| [`requirements.md`](requirements.md) | Actors, scope, functional requirements, non-functional requirements, and acceptance evidence |
| [`compliance-matrix.md`](compliance-matrix.md) | CO1–CO6 traceability from outcome to implementation, test, and operational evidence |
| [`showcase.md`](showcase.md) | Demonstration sequence, reviewer talking points, and honest limitations |

### Engineering and architecture

| Document | Purpose |
| --- | --- |
| [`architecture/README.md`](architecture/README.md) | C4 context, containers, components, deployment, bounded contexts, and distributed-evolution decisions |
| [`data/README.md`](data/README.md) | Relational model, Flyway V1–V4, `flyway-mysql`, constraints, indexes, transactions, and persistence trade-offs |
| [`api/README.md`](api/README.md) | HTML and targeted endpoint contract, validation, authentication, error behavior, and OpenAPI |
| [`services/README.md`](services/README.md) | Logical module ownership and safe future extraction boundaries |
| [`hybrid-integration-decision.md`](hybrid-integration-decision.md) | Firebase-Addition comparison and the server-side recommendation decision |
| [`reference-repositories.md`](reference-repositories.md) | Complete register of supplied repositories and adopted or rejected practices |
| [`stable-versions.md`](stable-versions.md) | Stable version baseline, compatibility policy, and upgrade evidence |

### Database Systems Engineering & DBMS Compliance (25CS1302E)

| Document | Purpose |
| --- | --- |
| [`design-report.md`](design-report.md) | Authoritative 20-section master design report covering ER, relational model, normalization, indexing, and transactions |
| [`dbms-compliance.md`](dbms-compliance.md) | Formal course outcome (CO1–CO6) compliance assessment matrix |
| [`data-dictionary.md`](data-dictionary.md) | Complete data dictionary for all runtime tables, domains, constraints, and keys |
| [`normalization.md`](normalization.md) | Formal proofs: 1NF, 2NF, 3NF, BCNF, lossless join decomposition, and dependency preservation |
| [`transaction-analysis.md`](transaction-analysis.md) | ACID properties, MySQL 8.4 REPEATABLE READ isolation, MVCC, and WAL durability analysis |
| [`concurrency-test.md`](concurrency-test.md) | 10-thread simultaneous race condition stress test report and deadlock prevention evidence |
| [`query-optimization.md`](query-optimization.md) | EXPLAIN ANALYZE performance benchmarks showing 51.7% cost reduction and filesort elimination |
| [`distributed-database.md`](distributed-database.md) | Semi-sync GTID replication, read routing, tenant sharding, and transactional outbox pattern |
| [`data-architecture-decision.md`](data-architecture-decision.md) | Architectural decision record comparing MySQL 8.4 and PostgreSQL 16 equivalents |
| [`backup-recovery.md`](backup-recovery.md) | Operational runbook for logical backups, binary log archiving, and Point-In-Time Recovery (PITR) |
| [`event-lifecycle.md`](event-lifecycle.md) | State machine specification for campus event status transitions |
| [`demo-script.md`](demo-script.md) | Scripted live evaluation walkthrough for course demonstration |

### Delivery, security, and governance

| Document | Purpose |
| --- | --- |
| [`operations/README.md`](operations/README.md) | Configuration, migrations, health, metrics, deployment, backups, and incident response |
| [`security/README.md`](security/README.md) | Threat model, authentication, authorization, input handling, and OWASP-oriented controls |
| [`testing/README.md`](testing/README.md) | 63-test inventory, coverage gates, smoke/load checks, CI behavior, and release gates |
| [`cleanup-audit.md`](cleanup-audit.md) | Ponytail findings, deletion dispositions, framework reachability safeguards, and cleanup history |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Branching, commits, review, testing, deletion policy, and secret hygiene |
| [`../.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md) | Pull-request evidence checklist |

## Current implementation vocabulary

| Term | Meaning |
| --- | --- |
| **Implemented** | Present in source and represented by tests, CI, or runtime evidence |
| **Production-oriented** | Safe for controlled deployment after environment-specific secrets, TLS, durable storage, backups, monitoring ownership, and release approval are configured |
| **External registration** | The configured event URL remains authoritative; the local `registrations` table records interest and analytics |
| **Documented evolution** | A future boundary or technology option that is not a deployed runtime component |
| **Derived recommendation** | A non-persistent view computed by `RecommendationService` from relational event and interest data |

## Verification commands

```bash
# Complete build, test, migration, package, and JaCoCo verification
./mvnw -B verify

# Runtime checks after starting the application
BASE_URL=http://localhost:9090 ./scripts/smoke-test.sh
REQUESTS=100 CONCURRENCY=10 BASE_URL=http://localhost:9090 ./scripts/load-test.sh
```

The canonical CI and Compose path uses **Java 25 and MySQL 8.4**. Flyway 12 requires the MySQL database support module, which is declared as `org.flywaydb:flyway-mysql` alongside Spring Boot’s `spring-boot-starter-flyway`. A local sandbox with MySQL 8.0 or without credentials may not reproduce the runtime-backed test path; do not weaken production validation to accommodate it.

## Current CI evidence

The latest repair commit, `39d5e6a`, passed GitHub Actions build, test, coverage, container-build, and dependency-review workflow handling. The CI job provisions MySQL 8.4, configures the application with test-only credentials, runs `./mvnw -B verify`, uploads JaCoCo output, and builds the container without pushing it.

## References

[1]: https://spring.io/projects/spring-boot "Spring Boot project"
[2]: https://documentation.red-gate.com/flyway/reference "Flyway reference documentation"
[3]: https://docs.github.com/en/actions "GitHub Actions documentation"
[4]: https://owasp.org/API-Security/editions/2023/en/0x00-header/ "OWASP API Security Top 10"
