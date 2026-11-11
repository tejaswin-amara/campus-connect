# Event Source Ingestion Specification

## Supported source classes
Release 1 prioritizes manual entry, CSV import, ICS calendars and RSS/Atom feeds. Add HTML/JSON-LD scraping or partner APIs only after source-specific authorization, terms, stability and security review.

## Pipeline
Source registry → scheduled/manual trigger → safe fetch → bounded parse → normalized candidate → schema validation → duplicate matching → provenance record → moderation queue → canonical event/occurrences → publication.

## Source registry
Record owner/contact, source type, canonical URL, allowed hostnames, allowed paths where possible, expected cadence, rate limit, parser/version, enabled state, terms/permission evidence, last success, last failure and next run. Never accept arbitrary user-submitted URLs as trusted source configuration.

## Fetch safety
- Permit only approved schemes and hosts.
- Resolve DNS and reject loopback, private, link-local, multicast, reserved and cloud metadata ranges; revalidate on redirects and connection.
- Limit redirects, response bytes, decompressed bytes, content types, connect/read/total time and concurrent requests.
- Block credential-bearing URLs and unsafe ports.
- Apply egress firewall where available.
- Do not execute scripts or render source HTML in a browser context.
- Store sanitized source excerpts only when necessary and permitted.
- Treat all fetched content as untrusted prompt/input data.

## Normalization
Normalize title, description, start/end, IANA timezone, venue, organizer, categories, registration URL, source URL, external ID and source timestamps. Validate chronology, required fields, timezone and size. Preserve source provenance and parser version.

## Deduplication
Prefer stable source/external IDs. Otherwise use deterministic normalized keys and scored candidate matching (title/time/venue/organizer). High-confidence match updates only allowed fields under source policy; uncertain match enters human review. Never silently merge materially different events.

## Idempotency and retry
Repeated sync produces no duplicate event or occurrence. Use ETag/Last-Modified where supported. Retry transient errors with bounded exponential backoff and jitter; do not retry permanent validation/permission failures indefinitely. Record attempts and dead-letter state.

## AI extraction
Optional, later phase. Model output is untrusted structured proposal; validate against schema, record model/prompt/version and source provenance, require human approval before publication. No model may invent missing details or override a verified source without review.

## Tests
SSRF, DNS rebinding, redirect to private address, oversized/decompression bomb, malformed feed, hostile HTML, timezone/DST, duplicate item, changed item, deleted item, stale ETag, 429/5xx, timeout, partial parse, credential leak, retry storm and parser-version migration.
