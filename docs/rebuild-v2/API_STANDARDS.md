# API Standards

## Contract-first
Version OpenAPI under the approved contracts package and validate in CI. Generate typed clients where practical; avoid duplicate handwritten schemas.

## Conventions
Base path /api/v1; resource nouns and standard methods; opaque stable IDs (not authorization); cursor pagination for large/changing collections; documented filter/sort allowlists; ISO 8601 dates and explicit timezone offsets/Z for instants.

## Authorization
Every protected operation resolves actor identity and checks college-admin, organization membership, event assignment and action. Club/department IDs in request bodies are selectors only, never proof of permission. Do not accept tenant headers or client-selected institution context. Validate authorization for list, detail, export, search, upload, download, background job and websocket paths.

## Errors
Stable envelope with machine code, safe message, optional field details and request ID. Never expose stack traces, SQL, internal hostnames or secrets. Distinguish 401, 403, 404, 400/422, 409, 429 and 5xx.

## Idempotency and abuse
Registration, cancellation, invitation acceptance and check-in corrections document retry semantics. Repeated request cannot duplicate state. Route-specific limits for login, recovery, registration, ticket verification, source sync and expensive search. Avoid naive IP-only lockouts that penalize campus NAT.

## Gates
Request/response schema validation; OpenAPI lint and breaking-change detection; contract tests for errors/pagination/auth; organization/event-scope negative tests; generated-client compatibility; no undocumented production endpoint.
