# Open-Source Repository, Package and Tool Adoption

## Rule
Popularity, stars and agent recommendations are not proof. Evaluate exact upstream repository, release and intended use before adoption.

## Candidate record
Unique REUSE ID; upstream URL; immutable tag/version/commit; intended capability and project gap; SPDX license/notices; maintainer/release/security activity; runtime compatibility; dependency tree/install scripts; permissions/network/telemetry; API stability; data handling; reproducible build/test; functional, boundary, negative, failure and concurrency results; benchmark; security scan; operational burden; exit path; decision and reviewer.

## Evaluation stages
1. Relevance: define requirement and compare simple in-house alternative.
2. Provenance/legal: verify canonical source, tag/commit, actual license, notices, patents and redistribution obligations. Unclear license means reject/defer.
3. Maintenance/security: inspect releases, maintainers, advisories, security policy and abandoned transitive dependencies.
4. Compatibility: isolated proof of concept with actual runtime, OS, framework, DB, module format, TS and deployment target.
5. Parameter testing: defaults; min/max; omitted/null/empty; invalid types/values; boundaries; option interactions; concurrency; repeated calls; cancellation; timeout; retries; network loss; partial failure; missing credentials; permission denial; large/Unicode/malicious inputs; restart and cleanup.
6. Benchmark: representative workload; latency distribution, throughput, memory, CPU, cold start, bundle impact and operational burden against simple baseline. Record environment, dataset, repetitions and variance.
7. Decision: ADOPT/ADAPT/REJECT/DEFER. Pin version, preserve notices, add regression tests, document upgrade/removal.

Use pairwise coverage for interacting options and exhaustive testing for security-sensitive invariants. Record exclusions and rationale; do not claim all combinations tested if they were not.

## Candidate shortlist — NOT APPROVED
| Capability | Candidates | Proof |
|---|---|---|
| UI primitives | shadcn/ui, Radix | A11y, keyboard, theme, bundle, license |
| Calendar | FullCalendar, React Big Calendar | Recurrence/timezone, accessibility, feature licensing |
| API | Fastify | Plugin isolation, validation, error behavior, load |
| ORM/migrations | Drizzle; compare Kysely/direct SQL | Generated SQL, transactions/RLS, migration safety |
| Auth | Better Auth and institutional OIDC/SSO | MFA, sessions, recovery, account linking |
| Jobs | pg-boss and DB-native alternatives | Retry, idempotency, crash recovery, DB contention |
| Validation | TypeBox/Ajv or Zod | Schema source-of-truth, performance, errors |
| Tests | Playwright, Vitest, axe-core | CI reliability, fixtures, coverage and accessibility |
| Security | CodeQL, Semgrep, Gitleaks, Trivy, Zizmor, Scorecard | Overlap, false positives, actionable gates |
| Telemetry/load | OpenTelemetry, k6 | Propagation, privacy, cardinality, overhead |

## Reference repositories and tools
ECC: selectively evaluate skills/hooks/security, not entire catalog. Karpathy skills: simplicity and goal-driven execution. Ponytail: independent audit only after exact workflow and Jules compatibility validation. Engineering Pipeline v3.1.0: lifecycle and gate reference.

Context7 provides current documentation, not suitability proof. GitHub is used for upstream/release/license/security inspection. Linear tracks evaluations. OpenAI Platform is optional only for a justified product AI requirement; it is not required for Jules.

## Reject conditions
Unclear/incompatible license; abandoned project; unacceptable security; unsupported runtime; unsafe permissions; irreproducible tests; unclear configuration; untestable critical behavior; worse benchmark; or maintenance burden exceeds value.
