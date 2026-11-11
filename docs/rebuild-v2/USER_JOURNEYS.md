# User Journeys and Acceptance Flows

All flows assume one college-wide product.

## Student
1. Open event discovery without needing an account where policy permits.
2. Filter by date, category, club/department, venue, mode and seats.
3. Open event detail and see organizer, schedule/timezone, venue, eligibility, capacity, registration deadline and policy.
4. Sign in using college-approved identity; return safely to intended event.
5. Register once; see confirmed/waitlisted state and ticket where applicable.
6. Cancel within policy; capacity/waitlist updates atomically.
7. Receive event changes/cancellation and manage preferences.
8. Present ticket; see attendance status and event history.

## Club/department organizer
1. Authorized member creates or edits organization profile/event draft.
2. Add occurrences, venue, category, eligibility, capacity, registration window, cancellation policy and publication details.
3. Submit for approval.
4. Reviewer approves/rejects with reason; immutable decision audit.
5. Organizer views registrations, waitlist and scoped analytics.
6. Assign event operators; operators can only access assigned event.
7. Check in attendees; correction requires permission and reason.
8. Cancel/reschedule; registrants are notified.

## College administrator
1. Review organization/publisher applications.
2. Manage college-wide policy, categories, venues and approved ingestion sources.
3. Review event approval queue and duplicate candidates.
4. Inspect audit events and source-sync health.
5. Suspend organization or source with reason and traceable action.
6. Export only justified college-wide reports with audit.

## Visitor
Browse only information configured as public. Private/draft events and student information are never exposed.

## Acceptance evidence
Each journey has API integration tests, browser E2E, role-scope negative tests, keyboard/accessibility checks and documented expected states. Use synthetic identities and events.
