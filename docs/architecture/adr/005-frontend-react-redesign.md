# 005. Modernized React + TypeScript Single-Page Application Redesign

* Status: Accepted & Implemented
* Date: 2026-09-22
* Deciders: tejaswin-amara, Principal DevOps & Release Engineering Team

## Context

The legacy CampusConnect architecture coupled UI generation tightly to server-side Thymeleaf templates with vanilla JavaScript DOM manipulation. While operationally straightforward, this architecture exhibited several structural drawbacks:
1. High perceived page-load and navigation latency caused by full server roundtrips on every filter, search, and pagination request.
2. Fragmented accessibility support across disparate HTML templates, failing strict WCAG 2.1 AA compliance (missing focus traps, broken ARIA dialog roles, non-compliant contrast ratios).
3. Inability to support responsive client-side interactions, optimistic updates, and offline or local-first demonstration capabilities without an active database link.
4. Conflation of frontend styling with server templates, inhibiting automated frontend verification pipelines (linting, type-checking, headless accessibility testing).

## Decision

We have adopted a modernized, decoupled Single-Page Application (SPA) architecture located under `frontend-redesign/` and integrated into the Spring Boot production delivery lifecycle:

1. **Technology Stack**:
   * **Framework**: React 19 with strict TypeScript (`tsc --noEmit`).
   * **Build Tooling**: Vite 6 for high-speed HMR development and optimized production asset chunking.
   * **Design System**: OLED-dark token system (`#000000` / `#050505` surfaces, slate neutral scales) built with Tailwind CSS.
   * **Animation & Visual Accents**: React Bits motion primitives (interactive spotlight cards, ambient aurora accents, magnetic controls) respecting `prefers-reduced-motion`.
   * **State & Data Caching**: TanStack Query (`@tanstack/react-query` v5) for client-side server-state caching, automatic cache invalidation, and debounced queries.
   * **Dual-Mode API Execution**: Resilient API client (`apiClient.ts`) communicating directly with Spring Boot REST endpoints (`/api/**`, `/login`) when available, while gracefully falling back to a deterministic in-memory store for standalone verification and offline preview.

2. **Automated Verification Standards**:
   * **Linter & Formatter**: Biome (`@biomejs/biome`) for sub-second formatting and linting.
   * **Unit & Component Testing**: Vitest with `@testing-library/react` and JSDOM achieving comprehensive component test coverage.
   * **End-to-End & Accessibility Gate**: Playwright driving automated browser tests paired with `@axe-core/playwright` ensuring 0 WCAG 2.1 AA violations.

3. **Packaging & Delivery Integration**:
   * **Multi-stage OCI Containerization**: 3-stage minimal footprint Docker build (Node 20 Alpine builder -> Temurin 21 Maven packager -> Temurin 21 JRE Alpine runtime under unprivileged UID 10001).
   * **Static Asset Hosting**: Production Vite output (`dist/`) embedded directly into Spring Boot's `classpath:/static/` with client-side fallback routing.
   * **CI/CD Pipeline**: GitHub Actions matrix workflow partitioning verification into `frontend-gate`, `backend-gate`, and `security-gate`.

## Consequences

### Positive
* **Enhanced UX & Latency**: Sub-50ms instant client-side filtering, searching, and tab switching without browser refreshes.
* **Strict WCAG 2.1 AA Compliance**: Automated axe-core regression checks guarantee accessible dialogs, drawer focus traps, aria landmarks, and contrast ratios.
* **Dual-Mode Operational Flexibility**: The application runs completely decoupled in Vite dev mode or embedded inside the production Spring Boot JAR.
* **Isolated Monorepo Build Lifecycles**: Frontend dependencies and toolchains are encapsulated in `frontend-redesign/`, preventing Maven / Node bloat entanglement.
* **Minimal Production Footprint**: Alpine JRE runtime maintains a compressed image size under 350 MB running as an unprivileged user (`nonroot`).

### Neutral & Managed Trade-offs
* **Monorepo Hook Overhead**: Pre-commit hooks (`lefthook.yml`) must monitor both TypeScript and Java changes, requiring PNPM availability during local commits.
* **CORS Management**: Local hybrid development (`localhost:5173` talking to `localhost:8080`) requires CORS origin mappings, addressed through centralized environment variables (`CORS_ALLOWED_ORIGINS`).
