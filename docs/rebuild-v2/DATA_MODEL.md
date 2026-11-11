# Data Model and Persistence

**Status:** Conceptual model; Jules produces and reviews physical schema.

## Entity groups
Identity: users, accounts, sessions, authenticators as provider requires. Tenancy: institutions, campuses, institution memberships. Organizations: organizations, memberships, invitations, scoped grants. Events: events, occurrences, revisions, categories, tags, venues. Moderation: requests and decisions. Aggregation: sources, sync runs, source items, external mappings, duplicate candidates, failures. Participation: registrations, idempotency records, waitlist, tickets, verification events, attendance and corrections. Governance: notification preferences/deliveries, audit events and scoped analytics.

## Tenancy
Tenant-owned records carry institution scope or an unambiguous FK path. Users can belong to multiple tenants. Never infer tenant from an untrusted header or client field. Application policy and DB access enforce boundaries. If PostgreSQL RLS is used with pooled connections, tenant context is transaction-local and reset. Test missing context and connection reuse fail-closed.

## Time
Store occurrence instants in UTC and retain IANA timezone used for local scheduling. Recurrence follows event timezone. Test daylight-saving gaps, overlaps and invalid dates.

## Invariants
Unique external mapping per source/external ID where semantics allow; unique registration per user/occurrence; capacity never exceeded; idempotency scoped to actor/operation with request fingerprint; ticket secrets protected; check-in uniqueness enforced by DB constraint/transaction; state transitions validated/audited; retention avoids unnecessary personal data.

## Registration transaction
Validate occurrence/eligibility; claim idempotency key; atomically claim capacity; create registration or waitlist entry; issue confirmation/ticket only after successful mutation; commit stable replay response. Benchmark row-lock and conditional-update strategies under contention.

## Migration policy
Immutable versioned migrations. Review SQL, locks, table rewrites and indexes. Test fresh setup, upgrade, rollback/forward-fix and backup restore. Use expand/contract. Never mutate production schema at app startup.

## Indexing
Base indexes on actual feed/search/organizer/source-sync/registration/ticket/audit queries. Use EXPLAIN and representative data. Avoid speculative indexes.
