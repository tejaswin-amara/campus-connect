# Product and Technical Decisions Required

Jules must not guess these items. Record owner answer, evidence, decision date and affected requirement.

## College policy
- What is the canonical college identity provider/SSO, and is integration access available?
- Who can create clubs/departments and who approves them?
- Which roles can submit, approve, publish, edit and cancel events?
- Can an organizer approve their own event? Default: no.
- Are events public, college-login-only or restricted to groups?
- What student eligibility data may be used, and what is the authoritative source?
- What is the registration cancellation deadline and waitlist promotion policy?
- What ticket/QR scanner devices and connectivity are available at venues?
- Which categories, venues, campus locations and timezone are authoritative?
- Which external sources may legally/contractually be aggregated?
- What notifications are permitted and which college channels are approved?
- What retention/deletion and audit periods apply?

## Technical
- Is existing Spring Boot/Java 21/MySQL backend retained or replaced, based on J00 evidence?
- Is current React frontend redesign reusable?
- What is the production hosting/account owner and budget?
- What domain/email sender is available?
- What peak registration and concurrent event check-in load should be tested?
- What backup RPO/RTO is required?
- What operational owner handles incidents and access requests?

## Decision handling
Each answer becomes a PRD update, ADR, policy record or explicit deferred requirement. Do not block unrelated work on questions that do not affect its contract.
