# CampusConnect project structure

> **Purpose:** Map repository paths to runtime responsibility, verification evidence, and contributor entry points.
> **Current baseline:** Java 25, Spring Boot 4.1.0, MySQL 8.4, Flyway V1–V4

CampusConnect is organized as a **layered modular monolith**. Spring component scanning, Thymeleaf view resolution, Flyway migration discovery, and CI conventions mean that a file can be required even when it has no direct caller in another Java class.

## Repository root

| Path | Responsibility |
| --- | --- |
| `pom.xml` | Maven dependencies, Spring Boot parent, Surefire, JaCoCo, and build plugins |
| `mvnw`, `mvnw.cmd`, `.mvn/wrapper/` | Reproducible Maven entry points for Unix-like systems and Windows |
| `Dockerfile` | Multi-stage Java 25 build and non-root runtime image |
| `docker-compose.yml` | MySQL 8.4 plus application local stack with health-gated startup |
| `.env.example` | Configuration contract with placeholders only; never add real secrets |
| `README.md` | Product overview, quick start, configuration, architecture, and compliance entry point |
| `TECHNICAL_GUIDE.md` | Implementation-oriented architecture and change guide |
| `PROJECT_STRUCTURE.md` | This source-tree map |
| `CONTRIBUTING.md` | Branching, commit, review, testing, and secret hygiene workflow |
| `SECURITY.md` | Responsible vulnerability disclosure policy |
| `LICENSE` | MIT license |

## Backend source tree

The Java package is `com.tejaswin.campus`.

### Application entry point

| File | Responsibility |
| --- | --- |
| `CampusEventManagerApplication.java` | Spring Boot application entry point |

### Configuration

| File | Responsibility |
| --- | --- |
| `AppConfig.java` | Typed application settings and shared beans such as BCrypt configuration |
| `DataInitializer.java` | Safe startup data initialization with transactional and locking safeguards |
| `SecurityConfig.java` | Spring Security filter chain, CSRF, session, headers, login, and role rules |
| `WebMvcConfig.java` | MVC/resource configuration and controlled media resource handling |

### Controllers

| File | Responsibility |
| --- | --- |
| `AuthController.java` | Login, logout, and authentication-facing views |
| `EventController.java` | Public catalogue, event details, interest workflow, and recommendation presentation |
| `AdminController.java` | Admin-only event lifecycle, analytics, image upload, filtering, and CSV export |

### Services

| File | Responsibility |
| --- | --- |
| `EventService.java` | Event lifecycle, validation, media handling, registration-interest transaction, analytics, and CSV export |
| `UserService.java` | User lookup, password handling, role behavior, and authentication support |
| `SessionService.java` | Small abstraction around session invalidation and session state |
| `RecommendationService.java` | Deterministic, server-side recommendation scoring over upcoming events and user interest history |

### Models

| File | Responsibility |
| --- | --- |
| `User.java` | Authentication identity, role, and password state |
| `Event.java` | Event metadata, dates, venue, capacity, external link, and database-backed media fields |
| `Registration.java` | Local user-event interest record and status; the configured external URL remains authoritative for registration |
| `RecommendedEvent.java` | Non-persistent recommendation DTO containing derived score/reason data |

### Repositories

| File | Responsibility |
| --- | --- |
| `UserRepository.java` | User lookup and pessimistic initialization queries |
| `EventRepository.java` | Event filtering, pagination, upcoming-event queries, and locking queries |
| `RegistrationRepository.java` | User-event interest persistence, uniqueness support, and analytics queries |

### Security and exception handling

| File | Responsibility |
| --- | --- |
| `RateLimitingFilter.java` | Caffeine-backed Bucket4j login throttling |
| `SecurityAuditLogger.java` | Structured security-relevant logging without raw PII or secrets |
| `PiiUtils.java` | Stable hashing/obfuscation helpers for audit fields |
| `EventNotFoundException.java` | Domain exception for missing events |
| `InvalidImageException.java` | Domain exception for invalid image content |
| `GlobalExceptionHandler.java` | Consistent user-safe handling of validation, not-found, upload, authorization, and unexpected errors |

## Resources

### Configuration and operations

| Path | Responsibility |
| --- | --- |
| `src/main/resources/application.properties` | Default environment-variable-driven configuration, Flyway plus `flyway-mysql`, JPA validation, session, uploads, resilience, logging, and Actuator settings |
| `src/main/resources/application-prod.properties` | Stricter production profile with HTTPS cookies, MySQL TLS, no database creation, and hidden health details |
| `src/main/resources/logback-spring.xml` | Console and structured Logstash logging configuration |

### Database migrations

| File | Responsibility |
| --- | --- |
| `V1__Initial_Schema.sql` | Baseline users, events, registrations, keys, and initial constraints |
| `V2__Add_Image_Blob_Columns.sql` | Database-backed image data and MIME metadata |
| `V3__Add_event_query_indexes_and_integrity_checks.sql` | Query-aware indexes, event date checks, status constraints, and integrity hardening |
| `V4__Hardening_and_audit.sql` | Domain CHECK constraints, status lifecycle states, composite index `idx_events_status_date_time`, and `outbox_events` transactional outbox |

Flyway migration filenames are part of the database contract. Do not rename or delete an applied migration; add a new version instead.

### Thymeleaf templates

| Template | Responsibility |
| --- | --- |
| `dashboard.html` | Student-facing event catalogue and recommendations |
| `event_detail.html` | Event details, image, external registration link, and interest action |
| `admin_login.html` | Admin login form |
| `admin_dashboard.html` | Admin event management, analytics, filtering, and export controls |
| `error.html` | User-safe error fallback |

### Static assets

| Path | Responsibility |
| --- | --- |
| `static/css/style.css` | Visual system, responsive layout, glassmorphism surfaces, and accessibility-conscious states |
| `static/js/main.js` | Catalogue interactions, search/filter behavior, and progressive enhancement |
| `static/js/dashboard.js` | Dashboard-specific behavior and recommendation interactions |
| `static/js/admin-dashboard.js` | Admin dashboard interactions and visualization behavior |
| `static/images/logo.png` | Application brand asset |
| `static/favicon.svg` | Browser favicon |
| `static/manifest.json`, `static/sw.js` | PWA metadata and service-worker behavior; preserve only when the corresponding install/offline experience is supported |

## Tests

The repository contains **65 automated tests** across unit, model, controller, security, service, and concurrency stress test classes.

| Test class | Evidence area |
| --- | --- |
| `EventServiceConcurrencyTest` | 10-thread simultaneous race condition stress testing (Invariant 1: 1062 duplicate rejection, Invariant 2: 8-user throughput) |

| Test class | Evidence area |
| --- | --- |
| `AppConfigTest`, `DataInitializerTest` | Configuration and safe bootstrap |
| `AdminControllerIntegrationTest`, `AdminControllerSecurityTest` | Admin workflows and authorization |
| `AuthControllerTest`, `SessionFixationTest` | Authentication and session security |
| `EventControllerTest` | Public event routes and request behavior |
| `GlobalExceptionHandlerTest` | User-safe error mapping |
| `EventTest`, `RecommendedEventTest` | Domain/model invariants and DTO behavior |
| `RateLimitingFilterTest`, `SecurityAuditLoggerTest` | Abuse controls and structured audit behavior |
| `EventServiceTest`, `RecommendationServiceTest`, `SessionServiceTest`, `UserServiceTest` | Core application services and recommendation logic |

Run the complete suite with `./mvnw -B verify`. Runtime-backed tests require the documented MySQL configuration; the CI and Compose verification path uses MySQL 8.4.

## CI and documentation evidence

| Path | Responsibility |
| --- | --- |
| `.github/workflows/ci.yml` | Java 25 build, MySQL 8.4 service, tests, coverage, dependency review, and image checks |
| `.github/ISSUE_TEMPLATE/` | Reproducible bug and feature intake |
| `.github/PULL_REQUEST_TEMPLATE.md` | Review, test, security, and documentation checklist |
| `scripts/smoke-test.sh` | Health/OpenAPI runtime smoke checks |
| `scripts/load-test.sh` | Repeatable lightweight concurrency sanity check |
| `docs/` | Requirements, C4 architecture, data, API, services, operations, security, testing, compliance, showcase, cleanup audit, version record, and reference provenance |

## Cleanup boundary

The Ponytail cleanup audit is documented in [`docs/cleanup-audit.md`](docs/cleanup-audit.md). The cleanup removed stale remediation notes, a machine-specific CodeRabbit rule, optional Windows wrappers, local editor settings, orphaned screenshots, an obsolete standalone QA plan, and the unused Spring Boot DevTools dependency. Runtime dependencies, migrations, tests, CI, security controls, and application assets remain because they have documented behavior or handout-evidence value.

## References

[1]: https://docs.spring.io/spring-boot/docs/current/reference/html/ "Spring Boot reference"
[2]: https://documentation.red-gate.com/flyway/reference "Flyway reference"
[3]: https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail-audit/SKILL.md "Ponytail audit skill"
