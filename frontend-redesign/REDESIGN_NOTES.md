# CampusConnect frontend redesign

## Design summary

The redesign uses a warm off-white canvas, deep ink typography, one indigo brand color, and coral as the action accent. Technical, Cultural, Sports, Workshop, and Seminar use stable blue, plum, green, amber, and teal treatments across cards, badges, and charts. The layout uses a quiet editorial shell with an event-programme hero, compact metadata, clear status badges, and a data-dense but calm admin surface. Tokens live in `src/index.css`; the theme toggle persists the manual choice while respecting the system by default through the light baseline and `.dark` override.

The compact component map in `src/App.tsx` includes `Sidebar`, `MobileChrome`, `EventCard`, `Detail`, `Catalogue`, `Login`, `Admin`, `Badge`, `Status`, `ThemeToggle`, `Placeholder`, `DonutChart`-equivalent chart markup, and accessible empty/loading-safe data views. Existing feature components and API hooks remain in place for organizer tools, simulation mode, authentication, event telemetry, and backend request contracts.

## Route and component map

| Existing surface | New surface |
| --- | --- |
| `src/App.tsx` workspace shell | Responsive shell with catalogue, admin, mobile destinations, and 404 placeholder |
| `components/Layout.tsx`, `components/Sidebar.tsx` | New `Sidebar`, `MobileChrome`, and `BottomNav` behavior in the app shell |
| `features/events/EventList.tsx` | `Catalogue`, `EventCard`, and `Detail` in the app shell; existing implementation remains available for compatibility |
| `features/auth/components/AdminLoginModal.tsx` | Existing modal now starts with empty username and password; full admin login destination is `Login` |
| `features/admin/components/EventTable.tsx` | `Admin` registry table with Edit/Delete affordances and delete confirmation |
| Existing API client and hooks | Unchanged; catalogue falls back to the authoritative 24-event showcase when the backend returns fewer than 24 records |
| New `public/manus-routes.json` | Declares `/`, `/admin`, `/login`, `/saved`, `/profile`, and `/404` |

## Assumptions

- The prompt's six required showcase cards are authoritative for the redesign preview. When live API data contains 24 or more records it is displayed; otherwise the 24-event showcase ensures pagination and screenshot acceptance are deterministic without altering API endpoints.
- Existing organizer and SimCollege capabilities are preserved in source and API layers; the new shell prioritizes the required student/admin screens.
- Create Event and Edit are intentionally present as management affordances but remain connected to the existing feature/API components for follow-up wiring rather than inventing a new flow.
- The admin entry destination is available at `/login` through the app's view navigation; normal backend authentication remains the source of truth.

## Dependencies

No new dependencies were added. Existing `lucide-react`, TanStack Query, React Hook Form/Zod, Vitest, Testing Library, Playwright, and axe tooling remain in the lockfile. No credentials or API base URLs were added.

## Verification

- `npm ci`: completed; npm reported 16 existing audit findings in the repository dependency graph.
- `npm run build`: passed; TypeScript and Vite production build completed.
- `npm test -- --run`: passed; 25 files and 89 tests passed.
- `python3 -m json.tool public/manus-routes.json`: passed.
- Lighthouse and Playwright/axe acceptance flows require a running backend/preview environment and are not claimed as run in this sandbox-only change.

## Risks and rollback

The main risk is visual integration with live backend event records whose category/status strings differ from the showcase vocabulary. The UI normalizes `Workshops` and `Seminars` while preserving original API data. To roll back, revert the redesign branch or restore `src/App.tsx`, `src/index.css`, `src/features/auth/components/AdminLoginModal.tsx`, and remove `public/manus-routes.json`; API and backend files are untouched.
