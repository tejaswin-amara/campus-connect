# Engineering Standards

## Repository and change discipline
- Inspect existing patterns before creating new ones.
- Keep changes cohesive and scoped; no unrelated refactors.
- Use Conventional Commits and PRs with traceable task IDs.
- Prefer deterministic builds, pinned toolchain and committed lockfiles.
- No secrets, generated artifacts or real student data in Git.
- Do not commit generated API clients unless repository policy requires them; document generation command.

## Code quality
- Strict types/null handling; avoid unsafe casts and broad exception swallowing.
- Validate untrusted input at boundaries; domain invariants remain in domain/application layer.
- Keep functions/modules cohesive; avoid speculative abstraction and duplicate business rules.
- No business authorization solely in UI or route middleware.
- Structured logs with request/correlation IDs; redact personal data and credentials.
- Use explicit time, currency, locale and timezone types/conventions.

## Database
- Versioned migrations only; no runtime schema mutation.
- Constraints enforce uniqueness and integrity.
- Review indexes with query plans and representative data.
- Avoid long transactions around network calls.
- Use transactional outbox or durable queue only when delivery semantics require it.

## Frontend
- Reuse approved components and design tokens.
- Semantic HTML and keyboard accessibility by default.
- Model loading/empty/error/unauthorized/offline states.
- Avoid global mutable state unless justified.
- Measure bundle and web performance before optimizing.

## Dependencies
- Minimal direct dependencies; no duplicate libraries for same capability without ADR.
- Pin and audit; update intentionally with changelog and regression tests.
- Record license notices and SBOM.
- Avoid unmaintained packages and postinstall scripts unless reviewed.

## Documentation
- Update requirement, API, data, ADR, security, testing and operational docs with behavior changes.
- Code comments explain why, not restate code.
- Never claim a test, scan, benchmark or deployment passed without output evidence.
