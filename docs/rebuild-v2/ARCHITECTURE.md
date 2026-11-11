# System Architecture

**Status:** Proposed baseline. Jules validates each choice through ADRs and proof-of-concepts before lock-in.

## Principles
Modular monolith first; PostgreSQL transactional source of truth; framework-independent domain logic; explicit adapters/contracts; explicit tenant scope; durable observable retryable jobs; simplest infrastructure that meets measured requirements.

## Candidate runtime
- Web: Next.js App Router for public discovery and authenticated workspaces.
- API: Fastify REST API with versioned routes and schema validation.
- Worker: separate process from same codebase for ingestion, notifications and scheduled tasks.
- Database: PostgreSQL.
- Object storage: cloud-native or S3-compatible, private by default.
- Jobs: evaluate PostgreSQL-backed durable jobs before a separate broker.
- Telemetry: OpenTelemetry-compatible traces, metrics and structured logs.

These are candidates, not final approvals. Authentication provider, ORM, queue and cloud topology require ADRs.

## Target monorepo
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

## Domain modules
Identity/Access; Institution; Organization; Event; Source Ingestion; Moderation; Discovery; Registration; Ticketing/Attendance; Notification; Audit/Analytics. Modules communicate through application interfaces and explicit events; avoid circular dependencies.

## Transactions and API
Use DB constraints for integrity. Transactions are mandatory for capacity, waitlist promotion and check-in. Keep network calls outside long DB transactions. REST under /api/v1, schema-validated requests/responses, cursor pagination and stable errors. Authentication establishes identity; authorization checks scope on every operation.

## Ingestion boundary
schedule → fetch with policy → parse → normalize → validate → deduplicate → record provenance → moderation → publish. Defend against SSRF, DNS rebinding, private/link-local targets, unsafe redirects, timeouts, oversized payloads and malicious parsers.

## Search and caching
Start with PostgreSQL indexes/full-text/trigram where justified. Avoid shared caching of user/tenant data without correct cache keys and authorization. Add Redis/search infrastructure only when measurement warrants it.

## Hosting
Vercel web and Google Cloud Run/managed PostgreSQL/object storage are candidates. Compare total cost, region, private networking, egress, secrets, telemetry, backup/restore, rollback and operations before selecting.

## Scaling
Split modules only for measured independent scaling, isolation, release cadence, reliability blast radius or ownership reasons. ADR must account for distributed transactions, network failure and operational burden.
