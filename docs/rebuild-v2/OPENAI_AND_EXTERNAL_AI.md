# OpenAI Platform and External AI Usage Policy

OpenAI Platform is an optional product integration, not a development-agent requirement. Google Jules remains the implementation and documentation agent.

## Allowed candidate use cases
- Convert authorized event source content into a structured event proposal.
- Suggest event categories/tags from verified content.
- Assist organizers with copy editing, if explicitly enabled.

## Not allowed without separate approval
- Automatically publishing an event based solely on model output.
- Inferring student sensitive attributes or profiling students.
- Making eligibility, disciplinary, attendance or high-impact decisions.
- Sending student personal data to a model without approved purpose, data-processing terms and minimization.

## Engineering requirements
Compare a deterministic parser/no-AI baseline with model-based alternatives. Evaluate structured output validity, hallucination, prompt injection from source text, refusal behavior, latency, cost, rate limits, retries, provider outage and data retention. Validate every model response against strict schemas. Keep source text clearly marked as untrusted data. Store model/prompt/version metadata. Require human approval for generated event changes.

## Secrets and operations
API keys belong in a managed secret store, never GitHub, browser bundles, docs or Jules prompts. Set budget/usage limits, monitor token costs, implement timeouts and graceful fallback. Product AI is deferred until a clear requirement and ADR are approved.
