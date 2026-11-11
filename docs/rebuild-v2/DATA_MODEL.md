# Data Model and Persistence

**Product boundary:** One college. There is no institution tenant table, tenant resolver, tenant header or cross-tenant data isolation feature. The college is the sole deployment scope.

## Entity groups
Identity: users, accounts, sessions, authenticators as provider requires. Directory: campuses/buildings/venues if needed; departments; clubs/student organizations. Membership: organization memberships, invitations, scoped grants. Events: events, occurrences, revisions, categories, tags, venues. Moderation: approval requests and decisions. Aggregation: sources, sync runs, source items, external mappings, duplicate candidates and failures. Participation: registrations, idempotency records, waitlist entries, tickets, verification events, attendance and corrections. Governance: notification preferences/deliveries, audit events and scoped analytics.

## Scope model
Every club/department-owned resource has an explicit organization foreign key. Event ownership/visibility is explicit. User membership may span multiple clubs/departments. College administrators have college-wide permissions. Event operators have event-specific permissions. Do not create a generic tenant_id column merely for hypothetical future SaaS support.

## Time
Store occurrence instants in UTC and retain the IANA timezone used for local scheduling. Recurrence follows event timezone. Test daylight-saving gaps, overlaps and invalid dates.

## Invariants
Unique external mapping per source/external ID where semantics allow; unique registration per user/occurrence; capacity never exceeded; idempotency scoped to actor/operation with request fingerprint; ticket secrets protected; check-in uniqueness enforced by DB constraint/transaction; state transitions validated/audited; retention avoids unnecessary personal data.

## Registration transaction
Validate occurrence and eligibility; claim idempotency key; atomically claim capacity; create registration or waitlist entry; issue confirmation/ticket only after successful mutation; commit stable replay response. Benchmark row-lock and conditional-update strategies under contention.

## Migration policy
Immutable versioned migrations. Review SQL, locks, table rewrites and indexes. Test fresh setup, upgrade, rollback/forward-fix and backup restore. Use expand/contract. Never mutate production schema at app startup.

## Indexing
Base indexes on actual feed/search/organizer/source-sync/registration/ticket/audit queries. Use EXPLAIN and representative data. Avoid speculative indexes.
