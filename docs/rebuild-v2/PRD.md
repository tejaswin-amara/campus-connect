# Product Requirements — CampusConnect 2.0

**Product boundary:** One college only. This is not a multi-institution SaaS product.

**Status:** Product baseline for Jules validation. Confirm college-specific policy and existing system integrations during J00/J01; do not invent policies.

## Vision
A trusted, college-wide platform for discovering, publishing, approving, managing and attending campus events. Students get one reliable calendar and registration experience. Clubs, departments and authorized staff get controlled event operations. College administrators retain oversight.

## Users and roles
- Visitor: browse public/approved events where configured.
- Student: discover, bookmark, register/cancel, receive updates and present ticket.
- Club/department member: draft and manage events within assigned organization.
- Event manager: manage assigned event registrations and check-in.
- Club/department administrator: manage organization membership and its events.
- College administrator: approve publishers, moderate events, manage college-wide settings and sources.
- Platform operator: technical operations; no routine access to student data.

A person may hold multiple organization memberships. Roles are scoped to a club, department or event, except the college administrator. Do not implement a generic multi-tenant framework, tenant resolver, tenant header or cross-tenant RLS layer.

## Product domains
Identity/sessions; college directory; clubs/departments and memberships; source registry/ingestion; canonical events/occurrences; moderation; discovery/search/calendar; registration/capacity/waitlist; tickets/check-in/attendance; notifications; audit/analytics/admin.

## Functional requirements
- FR-ID-001: Secure authentication, session termination, verification and recovery.
- FR-ID-002: Support college-approved identity provider/SSO if available; otherwise a documented local auth flow.
- FR-ORG-001: College-managed clubs/departments with scoped membership and invitations.
- FR-ORG-002: A user may hold multiple club/department roles without privilege leakage.
- FR-EVT-001: Draft, submit, approve, publish, cancel and complete event lifecycle.
- FR-EVT-002: Events support occurrences, recurrence, IANA timezone, venue/online details, capacity and visibility.
- FR-EVT-003: Material changes/cancellations are communicated to registrants.
- FR-MOD-001: College approval policy applies to publishers/events as configured.
- FR-ING-001: Admin-managed allowlisted source registry.
- FR-ING-002: Support approved feeds/imports (ICS, RSS/Atom, CSV and manual entry) with provenance.
- FR-ING-003: Idempotent ingestion and canonical event deduplication.
- FR-ING-004: Ambiguous matches go to human review.
- FR-ING-005: Record source, external ID, fetch time, parser version and source modification metadata.
- FR-ING-006: Optional AI extraction produces a proposal, never authority to publish.
- FR-DISC-001: College-wide event browsing and search.
- FR-DISC-002: Filters for date, category, club/department, venue, format and availability.
- FR-DISC-003: Bookmarks and notification preferences.
- FR-DISC-004: Calendar export respects timezone and recurrence.
- FR-REG-001: Eligible students register/cancel under event policy.
- FR-REG-002: Capacity is enforced atomically under concurrency.
- FR-REG-003: Idempotent retries do not duplicate registration.
- FR-REG-004: Waitlist promotion is deterministic, transactional and audited.
- FR-TKT-001: Ticket credentials are unguessable, revocable and server-validated.
- FR-ATT-001: Check-in is at most once except authorized correction workflow.
- FR-ATT-002: Operators access only assigned events.
- FR-ADM-001: College administrators manage publisher approvals, sources, moderation and policy.
- FR-AUD-001: Privileged actions and corrections are audited.
- FR-ANA-001: Organizers see only their events' analytics and attendee data.

## Non-functional requirements
- NFR-SEC-001: No unresolved critical/high security findings at production release without documented risk acceptance.
- NFR-SEC-002: Organization/event authorization is proven through adversarial tests.
- NFR-REL-001: Registration, waitlist and check-in invariants survive concurrency/retries.
- NFR-PERF-001: Establish representative p50/p95/p99 baselines before setting SLOs.
- NFR-A11Y-001: Target WCAG 2.2 AA for core journeys with automated and manual validation.
- NFR-PRIV-001: Minimize student personal data; define purpose, access, retention and deletion.
- NFR-OPS-001: Tested backups, restore, telemetry, alerting and rollback.
- NFR-DOC-001: Student, organizer and administrator workflows have release-matched documentation.

## Event lifecycle
DRAFT → SUBMITTED → APPROVED → PUBLISHED → COMPLETED, with controlled REJECTED, CANCELLED and ARCHIVED transitions. College policy may vary; transition rules and audit are centralized.

## MVP / release 1
College identity/login; club/department directory and memberships; event creation and approval; manual/CSV/ICS/RSS ingestion; event discovery/search/filter; registration/capacity/cancellation; basic waitlist; student dashboard/bookmarks/calendar; organizer roster; QR check-in; essential notifications; admin controls/audit; responsive accessible UX.

## Later, evidence-led
Partner integrations/webhooks, advanced deduplication, AI-assisted extraction, recommendations, advanced analytics, PWA enhancements and external calendar integrations.

## Explicit non-goals
Multi-college tenancy, institution onboarding, cross-college discovery, SaaS billing, native mobile apps, payment marketplace, public social graph, microservices, Kafka, Kubernetes, dedicated search cluster or vector DB are not part of this product baseline.

## Acceptance scenarios
1. Student cannot access another club's private roster by changing a URL/ID.
2. A club member cannot approve their own event unless policy explicitly grants that permission.
3. 200 concurrent registration attempts for 50 remaining seats yield at most 50 confirmed registrations.
4. Same idempotency key does not duplicate a registration.
5. Re-ingestion does not duplicate canonical events.
6. Cancellation prevents new registrations and triggers configured notifications.
7. Ticket replay cannot create a second check-in.
8. Check-in operator cannot export college-wide student records.
9. Admin moderation records actor, time, reason and affected revision.
10. Student account/session revocation blocks subsequent privileged actions.
