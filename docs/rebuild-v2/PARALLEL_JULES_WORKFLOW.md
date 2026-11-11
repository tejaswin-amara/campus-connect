# Parallel Google Jules Session Workflow

## Critical rule
Do not start every session at once. Parallelize only after shared contracts and ownership are stable. All sessions are independent branches/PRs; never have two sessions commit to the same working branch.

## Wave 0 — sequential gates
1. J00 legacy audit.
2. J01 validate this single-college PRD with project owner.
3. J02 approve architecture, stack, data model and API contracts.
4. J03 evaluate open-source candidates and produce REUSE decisions.
5. J04 establish integration branch, CI, local environment and shared contracts.
6. J05 own database schema/migrations and publish a frozen v1 schema contract.

## Wave 1 — controlled parallelism
After J04/J05 merge or are explicitly frozen:
- Stream A — J06 identity/access and authorization (owns auth/policy files).
- Stream B — J07 organization/event/moderation domain (owns domain/event files; consumes frozen schema contract).
- Stream C — J08 ingestion (owns connectors/parser/worker ingestion paths; consumes event/source contracts).
These streams must not independently modify shared schema, generated contracts or authentication policy. Changes requiring those areas go through a request to the designated owner.

## Wave 2 — parallel product surfaces
After J06/J07/J08 API contracts stabilize:
- Stream D — J09 public discovery UI.
- Stream E — J10 student workspace.
- Stream F — J11 organizer/college-admin UI.
- Stream G — J12 registration/capacity/waitlist backend.
Keep frontend sessions on distinct route/component folders. J12 owns registration domain/schema changes; other streams consume its contract.

## Wave 3 — integration and hardening
- J13 tickets/check-in/notifications after registration contract freezes.
- J14 integration/E2E after feature PRs merge.
- J15 independent security/performance review after integration.
- J16 deployment/recovery after runtime and infra decisions accepted.
- J17 documentation/handover after implementation and release behavior stabilize.

## Merge protocol
One PR per session. Require CI green, owner review and conflict-free rebase. Integration owner merges in dependency order. No direct pushes to main. No parallel migration authors. Rebase on latest integration branch before review. Avoid broad formatting churn. Resolve conflicts semantically, never choose one side blindly.

## Session limits
Begin with at most 3 concurrent Jules sessions in Wave 1; increase only if repository/CI capacity and code ownership prove safe. Do not launch a session whose dependency is still moving.

## Handoff
Each PR includes task ID, owned paths, contract version, tests, migrations, security impact, docs, known limitations and merge order. Integration owner maintains a session/branch matrix.
