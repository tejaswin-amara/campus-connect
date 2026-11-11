# Google Jules — Multi-Session Delivery Plan

**Product scope:** one college. **Integration branch:** rebuild/campus-connect-v2. **Implementation agent:** Google Jules.

## Session contract
Each session uses its own branch and PR, reports task ID, objective, dependencies, non-goals, owned paths, plan/risks, implementation, exact commands/results, security/migration/performance impact, docs changed, PR link, residual risks and handoff. No direct pushes to main.

## Sequential gates
- J00 Legacy audit: actual source, docs, PRs, tests, workflows, deployment, license/security and reusable code.
- J01 Product validation: confirm one-college journeys and college policy; resolve unknowns.
- J02 Architecture: compare existing stack with alternatives; approve C4, data/API/auth/job/hosting ADRs.
- J03 Open-source due diligence: isolated POCs, exact licenses, parameter/failure tests and benchmarks.
- J04 Foundation: approved toolchain, modules, local dev, CI, contracts and branch ownership.
- J05 Database: schema/migrations/invariants; sole schema owner; publish frozen contract.

## Parallel Wave 1 — max 3 sessions
After J04/J05 contracts are frozen:
- J06 Identity/access and organization/event authorization.
- J07 Organization/event/moderation domain.
- J08 Secure source ingestion.
Each owns distinct paths. J05 owns schema/migrations. No parallel migration or shared-contract edits.

## Parallel Wave 2 — max 4 sessions
After API/domain contracts stabilize:
- J09 Public discovery UI.
- J10 Student workspace UI.
- J11 Organizer and college-admin UI.
- J12 Registration/capacity/waitlist backend (sole registration schema owner, coordinated with J05).

## Sequential integration and release
- J13 Tickets/check-in/notifications after registration contract freezes.
- J14 integration and E2E after feature PRs merge.
- J15 independent security/performance audit after integration.
- J16 deployment/recovery after infra ADR approval.
- J17 docs/handover after implementation and release behavior stabilize.

## Parallel safety
Use separate branches/workspaces and PRs. Freeze shared API/schema contracts before consumers start. Keep route/component ownership separate. Integration owner merges in dependency order. No simultaneous edits to migrations, auth policy, generated API clients or shared design tokens. Request contract changes from the designated owner. Start with at most three concurrent Jules sessions; scale only when conflicts and CI capacity are measured.

## Session dependencies
~~~text
J00 → J01 → J02 → J03 → J04 → J05
                              ├─ J06 ─┐
                              ├─ J07 ─┼─ J09/J10/J11/J12 (after contracts)
                              └─ J08 ─┘
J12 → J13
All merged features → J14 → J15 → J16 → J17
~~~

## PR acceptance
Task ID, owned paths, contract version, tests, migration/security impact, docs, known limitations and merge order. Require CI green and owner review. Independent review is mandatory for auth, authorization, ingestion, registration, tickets, migrations and workflows.
