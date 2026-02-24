# 🎓 Campus Event Manager
  
*A modern, full-stack event management system tailored for university campuses.*

[![Java Platforms](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Thymeleaf](https://img.shields.io/badge/Thymeleaf-Frontend-005F0F?style=for-the-badge&logo=thymeleaf&logoColor=white)](https://www.thymeleaf.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[Student Dashboard](http://localhost:9090/) · [Admin Panel](http://localhost:9090/admin/login) · [Report Bug](#contributing) · [Request Feature](#contributing)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features (Ultimate Edition)](#-features-ultimate-edition)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start (PowerShell)](#quick-start-powershell)
  - [Docker](#docker)
- [Access Details](#-access-details)
- [Environment Variables](#%EF%B8%8F-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Structure Overview](#-structure-overview)

---

## 🎯 About the Project

**Campus Event Manager** is a complete, mobile-first solution aiming to bridge the gap between students and university event organizers. It provides an intuitive platform where students can seamlessly discover and register for events while granting administrators powerful tools to create, manage, and analyze event data efficiently.

---

## ✨ Features (Ultimate Edition)

The system is split into two primary experiences, ensuring each user archetype gets a tailored, distraction-free environment.

### 🧑‍🎓 Student Experience
- **Mobile-First Design**: Glassmorphism and micro-animations for a premium feel on any device.
- **Fast Category Switching**: Interactive sidebar with skeleton loaders for instant feedback.
- **Dynamic QR Codes**: Instant registration QR codes generated for every event.
- **Add to Calendar**: One-click ICS generation for Google/Outlook integration.
- **Premium Toasts**: Animated notifications for fluid and beautiful feedback.
- **Time Filters**: Easily filter events by *Upcoming*, *Ongoing*, and *Past*.

### 👨‍💼 Admin Management Panel
- **Full Event Control**: Create, update, and securely manage all campus events.
- **Interactive Analytics**: Dynamic and beautiful `Chart.js` visual data representations.
- **Zero-Overflow Layout**: Clean UI optimized for high-density data management.
- **CSV Export**: Instantly export the full event database for offline analysis.
- **SEO Optimized**: Open Graph tags integrated for rich social sharing.
- **Auto-Cleanup**: Smart storage management that automatically deletes images when events are removed.

### 🛡️ Security & Hardening
- **Zero-Trust Auth**: Replaced legacy hashing with `BCrypt` and constant-time execution to prevent timing attacks.
- **CSRF Protection**: Integrated Spring Security CSRF protection across all administrative state-changing operations.
- **Dynamic Rate Limiting**: Per-IP throttling implemented for admin logins using `Bucket4j`.
- **Database Resilience**: Managed schema migrations via **Flyway** and atomic concurrency control with **Pessimistic Locks**.
- **Secure Sessions**: Enforced `SameSite=Strict`, `HttpOnly`, and `Secure` cookie attributes.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed before starting:
- **Java 21** or higher
- **MySQL Server**
- **Docker** (Optional, for containerized deployments)
- Windows PowerShell (for the provided scripts)

### Quick Start (PowerShell)

The easiest way to launch the application is via the integrated PowerShell script.

1. **Run the Application:**

```powershell
.\run_app.ps1
```

> 💡 **Automated Workflow**: This script automatically starts the MySQL service, builds the Java Spring Boot application using Maven, and opens the app in your default browser at `http://localhost:9090`.

2. **Stop & Restart:**
- **Stop gracefully**: Press `Ctrl + C` in the running terminal.
- **Forced Stop**: Run `.\stop_app.ps1` to kill any port 9090 conflicts.
- **Restart**: Simply execute `.\run_app.ps1` again.

### 🐳 Docker

Prefer containers? You can easily spin up the environment using Docker:

```bash
# Build the Docker image
docker build -t campus-events .

# Run the container (Make sure to map the database correctly)
docker run -p 9090:9090 \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/campus_events?createDatabaseIfNotExist=true \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  campus-events
```

---

## 🔑 Access Details

Once the application is running, you can access the different portals using the links and credentials below.

| Portal | App Link | Login Credentials |
| :--- | :--- | :--- |
| **Student Dashboard** | [localhost:9090](http://localhost:9090/) | *Guest Login (No credentials required)* |
| **Admin Panel** | [localhost:9090/admin/login](http://localhost:9090/admin/login) | Username: `admin` <br> Password: `admin123` |

---

## ⚙️ Environment Variables

The application can be configured via the `application.properties` file or by setting the following environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `9090` | The port the Spring Boot server runs on |
| `DB_URL` | `jdbc:mysql://localhost:3306/campus_events` | The JDBC connection URL for MySQL |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | `root` | Database password |
| `DDL_AUTO` | `update` | Hibernate DDL mode (`update`, `validate`, `none`) |
| `ADMIN_PASSWORD` | `admin123` | The default password for the admin account |
| `UPLOAD_DIR` | `uploads` | Local directory for storing uploaded event images |
| `LOG_LEVEL` | `DEBUG` | Application logging verbosity |
| `SESSION_COOKIE_SECURE` | `false` | Sets the secure flag for session cookies (Set to `true` in Production) |

---

## 🔗 API Endpoints

A quick reference for the core routing of the application:

### Public & Student routes
- `GET /` - Root directly auto-logins as guest and redirects to the dashboard.
- `GET /student/dashboard` - Main student event listing interface.
- `GET /student/event/{id}` - Event detail page (or redirects back to dashboard in some configurations).
- `GET /student/register-external/{id}` - Redirects the user to an external registration link.

### Admin routes
- `GET /admin/login` - Admin authentication page.
- `POST /admin/login` - Form submission for admin authentication.
- `GET /admin/dashboard` - Admin dashboard featuring analytics and event management.
- `POST /admin/events/add` - Endpoint to process new event creations.
- `POST /admin/events/edit/{id}` - Endpoint to process event updates.
- `POST /admin/events/delete/{id}` - Endpoint to handle event deletions.
- `GET /admin/events/export/csv` - Initiates a CSV file download of all events.

---

## 📂 Structure Overview

```text
📦 Campus Event Manager
 ┣ 📂 src/main/resources
 ┃ ┣ 📂 static             # CSS, Micro-animations, PWA Assets, JS
 ┃ ┗ 📂 templates          # Thymeleaf HTML Views
 ┣ 📜 run_app.ps1          # Integrated startup script (App + DB)
 ┣ 📜 stop_app.ps1         # Emergency port killer
 ┣ 📜 Dockerfile           # Multi-stage Docker build config
 ┣ 📜 .dockerignore        # Docker context exclusions
 ┗ 📜 pom.xml              # Maven project dependencies
```  
 
 
