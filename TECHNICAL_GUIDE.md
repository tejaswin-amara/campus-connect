# 📘 Campus Event Manager - Technical Guide

Welcome to the technical documentation for the Campus Event Manager application. This guide provides an in-depth look at the architecture, key components, and implementation details of the system.

## 1. Architecture Overview 🏗️

The application follows a standard **Model-View-Controller (MVC)** architecture using the Spring Boot framework.

### Layered Structure
-   **Presentation Layer (View)**: Thymeleaf HTML templates with Bootstrap 5 and custom CSS/JS.
-   **Control Layer (Controller)**: Spring MVC Controllers (`EventController`, `AdminController`, `AuthController`) handling HTTP requests and routing.
-   **Service Layer (Service)**: Business logic encapsulation (`EventService`, `UserService`, `AuthService`).
-   **Data Access Layer (Repository)**: Spring Data JPA Repositories (`EventRepository`, `UserRepository`, `RegistrationRepository`) interacting with the database.
-   **Database Layer**: MySQL database storing structured data.

## 2. Technology Stack 💻

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Backend Framework** | Spring Boot | 3.4.2 |
| **Language** | Java | 21 (LTS) |
| **Database** | MySQL | 8.0+ |
| **ORM** | Hibernate (via Spring Data JPA) | - |
| **Frontend Engine** | Thymeleaf | - |
| **Styling** | Bootstrap | 5.3.2 |
| **Icons** | Bootstrap Icons | 1.11.3 |
| **Build Tool** | Maven (Wrapper) | - |

## 3. Key Features & Implementation Details 🔍

### 3.1 Event Management (CRUD)
-   **Create**: Admins can create events with details like title, description, venue, category, dates, and images.
-   **Read**: 
    -   **Student Dashboard**: Displays events with filtering by category and status (Upcoming/Ongoing/Past).
    -   **Admin Dashboard**: comprehensive table view with search and filter capabilities.
-   **Update**: Full edit capability for event details.
-   **Delete**: Soft delete not implemented; hard delete removes event and associated image file from disk.

### 3.2 Image Handling
-   **Storage**: Images are stored in the server's local file system under `uploads/`.
-   **Serving**: Spring Boot resource handler maps `/uploads/**` to the file system directory.
-   **Cleanup**: The `EventService.deleteEvent` method automatically deletes the corresponding image file to prevent orphan files.

### 3.3 Data Integrity & Validation
-   **Date Logic**: The system enforces `End Date > Start Date` validation in the `AdminController`.
-   **Input Safety**: Basic input sanitization is handled via Spring MVC binding.

### 3.4 Frontend Experience
-   **Filters**: Custom JavaScript functions (`filterCategory`, `filterStatus`) provide instant, client-side filtering without page reloads.
-   **Animations**: CSS3 animations with staggered delays (`.delay-100`, etc.) provide a smooth loading experience.
-   **Glassmorphism**: A consistent design language using semi-transparent backgrounds and blurs.

## 4. Security Architecture 🛡️

The application implements a "Security by Design" approach following a comprehensive security audit.

### 4.1 Authentication & Authorization
- **BCrypt Hardening**: Passwords are hashed using BCrypt. The authentication service includes a constant-time dummy execution path to prevent username enumeration via timing attacks.
- **Session Management**: Upon successful login, the existing session is invalidated and a new one is created to prevent session fixation exploits.
- **Role-Based Access**: Secured via Spring Security Filters enforcing `hasRole('ADMIN')` for all management endpoints.

### 4.2 Traffic & Forgery Control
- **Rate Limiting**: Implemented via `RateLimitingFilter` (using Bucket4j) which throttles login attempts to 5 requests per 15 minutes per IP address.
- **CSRF Protection**: All POST/PUT/DELETE forms include an `_csrf` token validated at the server level.

### 4.3 Database & Concurrency
- **Schema Migrations**: Managed via **Flyway** to ensure consistent environments.
- **Race Condition Prevention**: Pessimistic write locks are used during critical data initialization.
- **Transactional Integrity**: Strict `@Transactional` boundaries ensure atomic updates and snapshot isolation.

## 5. Database Schema 🗄️

### `User` Table
-   `id` (Long, PK)
-   `username` (String, Unique)
-   `password` (String) - *Hashed with BCrypt.*
-   `role` (String) - `ADMIN` or `STUDENT`

### `Event` Table
-   `id` (Long, PK)
-   `title` (String)
-   `description` (Text)
-   `dateTime` (DateTime) - Start date/time.
-   `endDateTime` (DateTime, Nullable) - End date/time.
-   `venue` (String)
-   `category` (String)
-   `imageUrl` (String)
-   `registrationLink` (String)
-   `maxCapacity` (Integer)

## 5. Deployment & Setup 🚀

The improved `run_app.ps1` script handles the entire lifecycle:
1.  **Database Check**: Ensures MySQL service is running.
2.  **Build**: Uses Maven Wrapper to build the executable JAR.
3.  **Run**: Starts the application on port 8080.
4.  **Launch**: Automatically opens the default browser.

For production, the application can be packaged as a Docker container or deployed to any Java-supporting platform (AWS Elastic Beanstalk, Heroku, etc.).
