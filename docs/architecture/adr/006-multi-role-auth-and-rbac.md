# 006. Multi-Role Authentication, Club Lead Workspaces & Role-Based Access Control (RBAC)

* Status: Accepted & In Implementation
* Date: 2026-09-23
* Deciders: Principal Systems Architect, Staff Full-Stack Security Engineer & Lead Motion Designer

## Context

The initial release of CampusConnect accommodated only binary student public event discovery paired with a monolithic, hardcoded administrative password gate (`/admin/login`). While sufficient for single-operator deployments, scaling the platform to campus student organizations, academic clubs, and cultural committees reveals critical structural and operational limitations:

1. **Lack of Tenant Scoping**: All event creation and attendee management was centralized under global `ADMIN`. Club leads had no self-service mechanism to author, publish, or manage their own events without global administrative privileges.
2. **Student Privacy and Cross-Club Data Leakage**: Without scoped club ownership and fine-grained data isolation, attendee rosters and contact information could not be partitioned safely between student organizations.
3. **Session Fragility and Security Exposure**: Legacy session flows relied on basic session storage and lacked declarative, granular method-level authorization (`@PreAuthorize`), exposing API routes to unauthorized privilege escalation.
4. **Manual Attendance Verification**: Check-ins lacked a real-time validation engine, relying on external spreadsheets or paper rosters, exposing events to ticket fraud and spreadsheet formula injection (CWE-1236).

## Decision

We adopt a three-tier hierarchical Role-Based Access Control (RBAC) model (`ROLE_STUDENT` < `ROLE_ORGANIZER` < `ROLE_ADMIN`) underpinned by a dedicated database-backed `clubs` tenant model, Spring Boot 3 Method Security (`@PreAuthorize`), secure session management, and a client-side `bulletproof-react` role-aware workspace architecture:

1. **Three-Tier Hierarchical RBAC Persona Architecture**:
   * **`ROLE_STUDENT`**: Self-service student registration with university domain validation (`@klh.edu.in` / `.edu`), public catalogue exploration, 1-click RSVP, ticket generation with verifiable QR tokens, and personal registration history.
   * **`ROLE_ORGANIZER`**: Scoped club lead workspace tied directly to an assigned `club_id`. Capabilities include draft-to-published event lifecycle workflows, real-time ticket scanning / check-in engine, attendee roster governance, and sanitized CSV exports.
   * **`ROLE_ADMIN`**: Global supervisor role retaining platform-wide event governance, tenant administration, telemetry aggregation, and security audit log inspection.

2. **Backend Security Architecture**:
   * **Spring Method Security**: Enforce `@EnableMethodSecurity(prePostEnabled = true)` with a dedicated `SecurityService` evaluation bean (`@securityService.canManageEvent(principal, #id)` and `@securityService.isClubLead(principal, #clubId)`).
   * **Authentication Entry Point**: Return structured `401 Unauthorized` and `403 Forbidden` JSON payloads for REST API calls (`/api/**`), eliminating HTML login redirects for headless and SPA callers.
   * **Session & Cookie Hardening**: Enforce `HttpOnly=true`, `SameSite=Strict`, and configurable `Secure=true` cookies alongside CSRF token distribution for stateful browser sessions.
   * **Custom UserDetails Principal**: `CustomUserDetails` encapsulates `id`, `username`, `email`, `role`, `clubId`, and `rollNumber` within the `SecurityContext`.

3. **Database Schema & Tenancy Model**:
   * Introduce Flyway migration `V5__Add_Multi_Role_Auth_And_Clubs.sql`.
   * Create `clubs` entity with slug, name, category, and lead user associations.
   * Extend `users` with `role`, `club_id`, `roll_number`, and `department`.
   * Extend `events` with `club_id` and lifecycle `status` (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`).
   * Extend `registrations` with live check-in telemetry (`checked_in`, `check_in_time`, and unique `ticket_code`).

4. **Frontend Architecture (`bulletproof-react`)**:
   * Encapsulate authentication in `src/features/auth/` (`AuthContext`, `useAuth`, `AuthModal`, `RoleGuard`).
   * Encapsulate organizer studio in `src/features/organizer/` (`OrganizerDashboard`, `CheckInScanner`, `AttendeeRosterTable`).
   * Centralize query keys in `src/lib/queryKeys.ts`.
   * Implement role-aware navigation in `Sidebar.tsx` and top workspace capsule switcher in `Layout.tsx`.
   * Enforce OLED-Dark design tokens (`#0c0c12`, `--surface-base`, `--brand-primary`, `--brand-accent`), calibrated spring physics, and WCAG 2.1 AA accessibility.

5. **Defense-in-Depth Injection Mitigation**:
   * Sanitize all CSV exports (`sanitizeCsvCell`) by prepending `'` to values starting with `=`, `+`, `-`, `@`, `\t`, `\r` (mitigating CWE-1236 CSV injection).
   * Enforce university email domain validation on student registration.

## Consequences

### Positive
* **Strict Tenant Isolation**: Club organizers can only view and manage events and attendee rosters explicitly assigned to their club. Cross-tenant mutation attempts return HTTP 403 Forbidden.
* **Seamless Multi-Role Experience**: Users log in through a unified auth modal, and privileged users can switch between student discovery catalogue and club lead management via the workspace capsule.
* **Elimination of Credential Exposure**: Passwords hashed with BCrypt; session tokens protected with `HttpOnly` and `SameSite=Strict` cookies.
* **Automated QR & Code Check-In**: Eliminates manual check-in friction with instant optimistic attendance validation and tamper-evident ticket codes.
* **Zero WCAG 2.1 AA Violations**: Focus trap management, semantic ARIA attributes, and accessible color contrast preserved across all auth and organizer views.

### Neutral & Managed Trade-offs
* **Flyway Schema Evolution**: Existing MySQL schemas must be cleanly migrated from binary role names to prefixed role strings (`ROLE_ADMIN`, `ROLE_STUDENT`, `ROLE_ORGANIZER`).
* **Session Invalidation**: Role and club changes require re-authentication or session rehydration via `/api/auth/me`.
