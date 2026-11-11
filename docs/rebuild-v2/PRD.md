# Product Requirements — CampusConnect 2.0

**Status:** Greenfield baseline; validate with project owner and stakeholders before implementation.

## Vision
A trusted multi-institution campus event platform where students discover relevant events, organizations publish and operate them, institutions govern participation, and approved external sources are aggregated with provenance.

## Users
Visitor; student/member; organization member; event check-in operator; organization administrator; institution administrator; platform operator. Roles are scoped to institution, organization, event or platform. One user may hold multiple memberships. Never use one global role string as the authorization model.

## Product domains
Identity/sessions; institutions/campuses; organizations/memberships; source registry and ingestion; canonical events/occurrences; moderation; discovery/search/calendar; registration/capacity/waitlist; tickets/check-in/attendance; notifications; analytics/audit/admin.

## Functional requirements
- FR-ID-001: Secure authentication, session termination, verification and recovery.
- FR-TEN-001: Multi-institution and multi-organization memberships.
- FR-TEN-002: Tenant-owned resources have explicit institution/campus scope.
- FR-TEN-003: Cross-tenant access denied by default and negatively tested.
- FR-ORG-001: Scoped organization profile and membership management.
- FR-EVT-001: Draft, submit, approve, publish, cancel and complete event lifecycle.
- FR-EVT-002: Occurrences, recurrence, timezone, venue/online details, capacity and visibility.
- FR-EVT-003: Material changes/cancellations communicated to registrants.
- FR-MOD-001: Configurable institutional moderation before publication.
- FR-ING-001: Admin-managed approved source registry.
- FR-ING-002: Supported feeds/imports with source provenance.
- FR-ING-003: Idempotent ingestion and canonical event deduplication.
- FR-ING-004: Ambiguous matches routed to human review.
- FR-ING-005: Record source, external ID, fetch time, parser version and modification metadata.
- FR-ING-006: AI extraction produces a proposal, never authority to publish.
- FR-DISC-001: Public/student event browsing and search.
- FR-DISC-002: Filters for date, category, institution, campus, format and availability.
- FR-DISC-003: Bookmarks and notification preferences.
- FR-DISC-004: Calendar export respects timezone and recurrence.
- FR-REG-001: Eligible users register/cancel under event policy.
- FR-REG-002: Capacity enforced atomically under concurrency.
- FR-REG-003: Idempotent retries do not duplicate registration.
- FR-REG-004: Waitlist promotion is deterministic, transactional and audited.
- FR-TKT-001: Ticket credentials are unguessable, revocable and server-validated.
- FR-ATT-001: Check-in at most once except authorized correction workflow.
- FR-ATT-002: Operators access only assigned events.
- FR-ADM-001: Scoped administration of campuses, organizations, sources and moderation.
- FR-AUD-001: Privileged actions and corrections are audited.
- FR-ANA-001: Organizers see only scoped event analytics.

## Non-functional requirements
- NFR-SEC-001: No unresolved critical/high security findings at production release without explicit owner risk acceptance.
- NFR-SEC-002: Tenant isolation proven through automated adversarial tests.
- NFR-REL-001: Registration, waitlist and check-in invariants survive concurrency/retries.
- NFR-PERF-001: Establish p50/p95/p99 baselines before final latency SLOs.
- NFR-A11Y-001: Target WCAG 2.2 AA for core journeys with automated and manual validation.
- NFR-PRIV-001: Minimize personal data; define purpose, access, retention and deletion.
- NFR-OPS-001: Tested backups, restore, telemetry, alerting and rollback.
- NFR-DOC-001: Supported production workflows have user/operator documentation.

## Proposed lifecycle
DRAFT → SUBMITTED → APPROVED → PUBLISHED → COMPLETED, with controlled REJECTED, CANCELLED and ARCHIVED transitions. Institutional policy may vary; state invariants and audit remain centralized.

## Launch scope
Identity/tenancy; organizations; event lifecycle/moderation; validated manual/CSV/ICS/RSS ingestion; discovery/search; registration/capacity; organizer workspace; basic notifications; attendance/check-in; audit; accessible responsive core journeys.

Later, evidence-led: partner APIs/webhooks, advanced deduplication, recommendations, AI extraction, federation, advanced analytics and PWA enhancements.

Not launch prerequisites: native apps, payment marketplace, complex social graph, microservices, Kafka, Kubernetes, dedicated search or vector DB.

## Acceptance scenarios
1. Institution A user cannot retrieve Institution B unpublished event or registration by changing an ID.
2. 200 concurrent registration attempts for 50 remaining seats yield at most 50 confirmed registrations.
3. Same idempotency key does not duplicate state.
4. Re-ingestion does not duplicate canonical events.
5. Cancellation prevents new registrations and triggers configured notification.
6. Ticket replay cannot create a second check-in.
7. Check-in operator cannot export organization-wide membership.
8. Moderation records actor, time, reason and affected revision.
