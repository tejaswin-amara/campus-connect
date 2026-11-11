# System Architecture

**Product boundary:** One college, one logical deployment and one college-wide event directory. Do not introduce multi-tenant SaaS architecture.

**Status:** Proposed baseline. Jules must verify candidates with ADRs and proofs-of-concept.

## Principles
Modular monolith first; PostgreSQL transactional source of truth; framework-independent domain logic; explicit interfaces; organization/event-scoped authorization; durable observable retryable jobs; minimal infrastructure; no premature distributed system.

## Candidate runtime
- Web: Next.js App Router for public discovery and authenticated workspaces.
- API: Fastify REST API with versioned routes and schema validation, unless the existing Spring Boot implementation proves a materially lower-risk path after audit.
- Worker: a separate process from the same codebase for ingestion, notifications and scheduled tasks; do not split into a separately owned microservice.
- Database: PostgreSQL.
- Object storage: private managed object storage only if uploads are needed.
- Jobs: compare a PostgreSQL-backed queue with a simple DB outbox/worker before adding a broker.
- Telemetry: OpenTelemetry-compatible traces, metrics and structured logs.

These are candidates, not approved dependencies. J00 must compare the existing Java 21/Spring Boot + MySQL/Thymeleaf/React implementation with the proposed TypeScript stack. Do not rewrite a working subsystem merely to standardize languages. J02 records the evidence-based decision.

## Target modular monolith
~~~text
apps/web
apps/api
apps/worker
packages/domain
packages/application
packages/infrastructure
packages/contracts
packages/db
packages/auth
packages/ui
packages/config
packages/observability
packages/testkit
docs
infra
.github
~~~

Jules may simplify this structure. Do not create a package for every small abstraction. If the existing Java backend is retained, use a coherent Gradle/Maven multi-module structure and keep the frontend contract-driven.

## Domain modules
Identity/Access; College Directory; Clubs/Departments; Event; Source Ingestion; Moderation; Discovery; Registration; Ticketing/Attendance; Notification; Audit/Analytics. No Institution/Tenant service or tenant abstraction. College is a deployment-level constant, not a user-selectable tenant.

## Authorization
Authentication establishes identity. A centralized policy layer evaluates college-admin, club/department membership, event assignment and operation. Every API read/write/export/job checks scope. Never trust client-supplied role, club ID, owner ID or organizer claims. A user can belong to multiple organizations.

## Transactions and API
Use DB constraints for integrity. Transactions are mandatory for capacity, waitlist promotion and check-in. Keep network calls outside long DB transactions. REST under /api/v1; schema-validated requests/responses, cursor pagination and stable errors.

## Ingestion boundary
schedule → fetch under policy → parse → normalize → validate → deduplicate → record provenance → moderation → publish. Defend against SSRF, DNS rebinding, private/link-local targets, unsafe redirects, timeouts, oversized payloads and malicious parsers.

## Search and caching
Start with PostgreSQL full-text/trigram and conventional indexes where justified. Avoid shared caching of user-specific data without correct authorization-aware cache keys. Add Redis/search infrastructure only after benchmark evidence.

## Hosting
Compare current Vercel and Google Cloud options with the simplest viable managed deployment. Evaluate total cost, India-region latency, database region, private networking, egress, secrets, telemetry, backup/restore and rollback. Avoid split hosting unless it has a clear benefit.

## Scale boundary
A single college does not justify microservices, Kubernetes, Kafka, tenant sharding or multi-region active-active. Revisit only if measured availability, throughput, isolation or team ownership requirements demand it.
