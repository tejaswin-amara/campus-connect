# Release Readiness Checklist

## Product
- [ ] One-college scope and policy questions resolved.
- [ ] Student, organizer, operator and college-admin journeys pass.
- [ ] Event lifecycle, cancellation and approval policy approved.
- [ ] Student-facing help and privacy notices reviewed by college.

## Security and privacy
- [ ] Authorization matrix implemented and adversarial tests pass.
- [ ] No unresolved release-blocking findings.
- [ ] Secrets, permissions, dependency licenses and SBOM reviewed.
- [ ] Data inventory, retention, export and deletion policy approved.
- [ ] No real student data in CI/Jules/test fixtures.

## Data integrity
- [ ] Fresh database and upgrade migrations pass.
- [ ] Registration capacity and idempotency concurrency tests pass.
- [ ] Waitlist promotion and ticket/check-in replay tests pass.
- [ ] Backup restore and integrity verification pass.

## Experience
- [ ] Responsive student discovery, registration and ticket flows.
- [ ] Organizer and admin role-scoped flows.
- [ ] WCAG 2.2 AA automated and manual review.
- [ ] Performance baseline and agreed SLOs met.

## Operations
- [ ] Staging smoke/E2E passes.
- [ ] Monitoring, alerting and runbooks ready.
- [ ] Rollback rehearsed.
- [ ] Support owner and incident contacts assigned.
- [ ] Known limitations documented.
- [ ] Release notes and user documentation match deployed build.

A checked box must link to evidence in CI, an approved decision, a test report or an operational record.
