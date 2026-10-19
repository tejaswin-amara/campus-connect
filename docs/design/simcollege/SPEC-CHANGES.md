# SimCollege Specification Changes & Conflict Resolution (SPEC-CHANGES.md)

This document formally records all conflicts, ambiguities, and rule discrepancies between external design references and the SimCollege technical specification, in compliance with **Amendment 5** (`docs/design/simcollege/REFERENCES.md`).

> **Guiding Principle**: When an external reference or secondary guide contradicts project engineering guardrails or WCAG accessibility standards, the **stricter rule** is strictly enforced.

---

## Conflict Matrix & Resolutions

### 1. Target Size Standards (SC 2.5.8 vs SC 2.5.5)
- **Reference**: [W3C WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) permits 24×24 CSS pixels or sufficient spacing for interactive targets and mentions map pins can qualify as essential exceptions.
- **Specification Rule**: Stricter **SC 2.5.5 Target Size (Enhanced)** is enforced.
- **Resolution**: All interactive map pins, building focus targets, and toolbar action buttons MUST provide a minimum bounding hit target of **44×44 CSS pixels**. Visual pin icons may be smaller (e.g. 24px-32px) if wrapped inside a 44×44px transparent touch target container with accessible focus rings.

---

### 2. ARIA Map Semantics (`role="application"` vs Native Semantic HTML + Roving Tabindex)
- **Reference**: [EZUD Accessible Map Geospatial Design](https://ezud.com/accessible-map-geospatial-design/) suggests wrapping complex web maps with `role="application"`.
- **Specification Rule**: Screen reader browse mode must remain intact without trapping or suppressing assistive technology shortcuts.
- **Resolution**: **Do NOT use `role="application"`**. The map container uses native semantic HTML (`<region>`, `<section aria-label="Campus Interactive Map">`), keyboard navigation using standard roving `tabindex` on interactive pins, and an `aria-live="polite"` region for dynamic spatial announcements.

---

### 3. Interaction to Next Paint (INP) Verification in Automated CI
- **Reference**: [web.dev/vitals](https://web.dev/articles/vitals) and [web.dev/inp](https://web.dev/articles/inp) establish INP <= 200ms at p75 as a Core Web Vital.
- **Specification Ambiguity**: Default synthetic Lighthouse runs do not trigger real user interaction flows required to measure INP directly.
- **Resolution**: 
  1. In synthetic CI/Lighthouse runs, **Total Blocking Time (TBT <= 200ms)** is used as the strict lab proxy.
  2. In end-to-end Playwright tests, the official `web-vitals` library (`onINP`) is injected into interactive user journeys (rapid pan, zoom, pin selection, modal triggers) to record and assert real INP values.

---

### 4. Color Contrast on Dimetric Terrain (Okabe-Ito Color Adjustments)
- **Reference**: [Siegal Lab Okabe-Ito 8-Color Palette](https://siegal.bio.nyu.edu/?p=108) defines `#F0E442` (Yellow) and `#56B4E9` (Sky Blue).
- **Specification Constraint**: On light green campus lawn tiles (`#86efac` / `#bbf7d0`), raw Okabe-Ito yellow and light blue fail WCAG 1.4.11 Non-text Contrast (3:1).
- **Resolution**: All map markers and UI badges utilizing Yellow or Sky Blue must feature a dark boundary stroke (`border-2 border-slate-900` or SVG `stroke="#0f172a"` with `stroke-width="2"`) to guarantee crisp visual delineation and >= 3:1 contrast against all background tile surfaces.

---

### 5. Telemetry Ingestion Idempotency & Security
- **Reference**: [Tinybird Events API documentation](https://www.tinybird.co/docs/api-reference/events-api) exhibits version discrepancies regarding native ingestion idempotency.
- **Specification Rule**: Ingestion must prevent duplicate analytics events during network retries without exposing write tokens to client browsers.
- **Resolution**:
  1. Client events generate a deterministic or v4 UUID `eventId` and timestamp prior to transmission.
  2. Client-side telemetry dispatches to a backend proxy route (`/api/telemetry/event`), ensuring the Tinybird token (`DATASOURCE:APPEND` scope) is strictly held server-side.
  3. The proxy forwards NDJSON payloads to Tinybird with resilient exponential backoff and error recovery.

---

### 6. Synchronized Dual-Modality View (List & Map Pairing)
- **Reference**: Spatial accessibility best practices ([MNIT QuickCard](https://mn.gov/mnit/assets/InteractiveMapsQuickCard_tcm38-725698.pdf) & [SitePen 2D Navigation](https://sitepen.com/blog/navigating-accessibility-in-two-dimensions)).
- **Specification Rule**: Users must have equal access whether browsing visually or via screen reader / keyboard list.
- **Resolution**: A synchronized dual-modality UI is implemented. Selecting an event in the structured list highlights and centers the map pin; focusing or selecting a map pin updates the list selection and opens the associated event drawer.
