<div align="center">

# ⚡ Reactivities

### 🌐 Enterprise-Grade Social Activities Platform

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SignalR](https://img.shields.io/badge/SignalR-Real--Time-FF6B35?style=for-the-badge&logo=microsoft&logoColor=white)](https://signalr.net/)
[![License](https://img.shields.io/badge/License-Educational-brightgreen?style=for-the-badge)](./LICENSE)

> **A modern full-stack social platform where people discover, create, and join activities — powered by Clean Architecture, CQRS, and real-time communication.**

</div>

---

Reactivities is more than a CRUD app. It's a **professional-grade social activities platform** built to demonstrate what real-world enterprise software looks like from the ground up — clean, scalable, and production-minded.

---

## 🗺️ Table of Contents

| # | Section |
|---|---------|
| 01 | [🎯 Business Goals](#-business-goals) |
| 02 | [🏛️ Architecture Overview](#️-architecture-overview) |
| 03 | [⚙️ System Design](#️-system-design) |
| 04 | [🔧 Backend Architecture](#-backend-architecture) |
| 05 | [🎨 Frontend Architecture](#-frontend-architecture) |
| 06 | [🔄 Request Flow](#-request-flow) |
| 07 | [🚀 Core Features](#-core-features) |
| 08 | [🔐 Authentication & Authorization](#-authentication--authorization) |
| 09 | [🗃️ Database Design](#️-database-design) |
| 10 | [📡 Real-Time Communication](#-real-time-communication) |
| 11 | [🛡️ Error Handling & Validation](#️-error-handling--validation) |
| 12 | [🛠️ Technologies Used](#️-technologies-used) |
| 13 | [📁 Folder Structure](#-folder-structure) |
| 14 | [🚦 Getting Started](#-getting-started) |
| 15 | [🔬 Testing Strategy](#-testing-strategy) |
| 16 | [🔒 Security Considerations](#-security-considerations) |
| 17 | [🚀 Future Improvements](#-future-improvements) |
| 18 | [👤 Author](#-author) |

---

## 🎯 Business Goals

<table>
<tr>
<td width="50%">

### 👤 User Management
- ✅ Register & authenticate securely
- ✅ Maintain rich user profiles
- ✅ Upload profile images
- ✅ Follow other users
- ✅ Manage hosted & joined activities

</td>
<td width="50%">

### 📅 Activity Management
- ✅ Create, edit, and cancel activities
- ✅ Browse an activity feed
- ✅ Join or leave activities
- ✅ Manage attendees
- ✅ Real-time comment threads

</td>
</tr>
<tr>
<td>

### 🌟 Platform Goals
- ✅ Scalability & maintainability
- ✅ Clean, extensible codebase
- ✅ Secure authentication
- ✅ Responsive UI/UX

</td>
<td>

### 🔮 Coming Soon
- 🔲 Email notifications
- 🔲 Admin dashboard
- 🔲 Activity recommendations
- 🔲 Mobile support

</td>
</tr>
</table>

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│           🖥️  Frontend (React + TS)          │
│         Vite · TanStack Query · Axios        │
└───────────────────┬─────────────────────────┘
                    │ HTTP / WebSocket
┌───────────────────▼─────────────────────────┐
│          🌐  API Layer (ASP.NET Core)        │
│     Controllers · Middleware · SignalR       │
└───────────────────┬─────────────────────────┘
                    │ MediatR
┌───────────────────▼─────────────────────────┐
│        ⚙️  Application Layer (CQRS)          │
│   Commands · Queries · Validators · DTOs     │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│          💎  Domain Layer                    │
│     Entities · Business Rules · Models       │
└───────────────────┬─────────────────────────┘
                    │ EF Core
┌───────────────────▼─────────────────────────┐
│          🗃️  Persistence Layer               │
│     AppDbContext · Migrations · Repos        │
└─────────────────────────────────────────────┘
```

---

## ⚙️ System Design

Each layer has **one job and does it well**:

| Layer | Responsibility |
|-------|---------------|
| 🌐 **API** | Receive HTTP/WS requests, delegate to Application layer |
| ⚙️ **Application** | Business logic, CQRS handlers, DTO mapping, validation |
| 💎 **Domain** | Core entities, relationships, business rules |
| 🗃️ **Persistence** | EF Core, migrations, query optimization |
| 🖥️ **Frontend** | UI rendering, state management, routing, API calls |

---

## 🔧 Backend Architecture

### 🔀 CQRS — Commands vs Queries

Instead of bloated services, every operation is a **focused handler**:

```
📝 Commands → Change state         📖 Queries → Read state
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CreateActivity                      GetActivityList
EditActivity                        GetActivityDetails
DeleteActivity                      GetUserProfile
JoinActivity                        GetComments
```

### 📨 MediatR — The Internal Messenger

Controllers stay thin. Business logic stays clean.

```
Controller  ──►  IRequest  ──►  Handler  ──►  Database
                 (Command/Query)
```

### 🗺️ AutoMapper — Clean Object Transformation

```
Entity  ──►  DTO  (no manual mapping boilerplate)
```

### ✅ FluentValidation — Centralized Validation

```csharp
// Every command validates itself
RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
RuleFor(x => x.Date).GreaterThan(DateTime.Now);
```

---

## 🎨 Frontend Architecture

### Core Stack

| Tool | Purpose |
|------|---------|
| ⚛️ **React 18** | UI component framework |
| 🔷 **TypeScript** | Type safety across the board |
| ⚡ **Vite** | Lightning-fast dev server & build |
| 🔄 **TanStack Query** | Server state, caching, mutations |
| 🌐 **Axios** | HTTP client with interceptors |
| 🛣️ **React Router** | Client-side routing |

### Why TanStack Query?

```
✅ Automatic background refetching
✅ Optimistic UI updates
✅ Request deduplication
✅ Cache invalidation on mutation
✅ Loading & error state built-in
```

---

## 🔄 Request Flow

### Example: Creating an Activity

```
1. 📝  User fills out the form in React
2. 📤  Axios sends POST /api/activities
3. 🛡️  JWT middleware validates the token
4. 🎯  Controller dispatches MediatR command
5. ⚙️  Handler executes business logic
6. 💾  EF Core persists to the database
7. ✅  API returns the created activity
8. 🔄  TanStack Query invalidates & refetches
9. 🖥️  UI updates automatically
```

---

## 🚀 Core Features

### 🔑 Authentication
- Register · Login · JWT tokens
- Protected routes on frontend
- Persistent auth state

### 📅 Activities
- Full CRUD with validation
- Category-based organization
- Attendee management
- Cancellation flow

### 👤 User Profiles
- Profile page with bio & photos
- Hosted vs. attending activities
- Follow / unfollow system
- Activity history

### 💬 Real-Time
- Live comment threads via SignalR
- Instant notifications
- Real-time attendee updates

### 💳 Payments & Bookings
- Booking status tracking
- Payment processing flow
- Receipt generation

### 🛡️ Error Handling
- Global exception middleware
- Toast notifications
- Field-level validation errors

---

## 🔐 Authentication & Authorization

```
1. 🧑  User submits credentials
2. 🔍  ASP.NET Identity validates
3. 🔑  JWT token generated & returned
4. 💾  Frontend stores token securely
5. 📎  Token attached to every request
6. 🛡️  Protected endpoints verify token
7. 👮  Policy/role checks enforced
```

**Token payload includes:** username · email · display name · profile image

---

## 🗃️ Database Design

### Core Entity Relationships

```
👤 User          ─── hosts ──────►  📅 Activity
👤 User          ─── attends ────►  📅 Activity  (via ActivityAttendee)
👤 User          ─── follows ────►  👤 User       (self-referencing)
📅 Activity      ─── has ────────►  💬 Comments
👤 User          ─── has ────────►  🖼️ Photos
📅 Activity      ─── has ────────►  💳 Payments
```

### Key Relationships

| Relationship | Type |
|-------------|------|
| User ↔ Activity | Many-to-Many (via ActivityAttendee) |
| User ↔ User | Self-referencing (UserFollowing) |
| Activity ↔ Comments | One-to-Many |
| User ↔ Photos | One-to-Many |

---

## 📡 Real-Time Communication

SignalR powers the live experience:

```
🔔 Notifications    →  Activity updates, new followers
💬 Comments         →  Live threads per activity
👥 Attendee changes →  Join/leave reflected instantly
```

---

## 🛠️ Technologies Used

<table>
<tr>
<th>🔧 Backend</th>
<th>🎨 Frontend</th>
<th>🧰 Tooling</th>
</tr>
<tr>
<td>

- ASP.NET Core 8
- Entity Framework Core
- ASP.NET Identity
- MediatR
- AutoMapper
- FluentValidation
- SignalR
- SQLite / SQL Server

</td>
<td>

- React 18
- TypeScript 5
- Vite
- TanStack Query
- Axios
- React Router
- Tailwind CSS

</td>
<td>

- Git & GitHub
- Visual Studio
- VS Code
- Postman
- xUnit & Playwright
- Docker *(planned)*

</td>
</tr>
</table>

---

## 📁 Folder Structure

```
📦 Reactivities/
├── 🌐 API/                    → Controllers, Middleware, SignalR Hubs
│   ├── Controllers/
│   ├── SignalR/
│   ├── Middleware/
│   └── Extensions/
├── ⚙️  Application/           → CQRS Handlers, Validators, DTOs
│   ├── Activities/
│   │   ├── Commands/
│   │   ├── Queries/
│   │   └── Validators/
│   ├── Profiles/
│   └── Interfaces/
├── 💎 Domain/                 → Core Business Entities
├── 🗃️  Persistence/           → EF Core, Migrations, Repositories
├── 🔒 Infrastructure/         → Photos, Security
└── 🖥️  client/                → React + TypeScript Frontend
    └── src/
        ├── app/               → Global config, layout, stores
        ├── features/          → Feature-based components
        ├── lib/               → Utilities, hooks
        └── api/               → Axios agents
```

---

## 🚦 Getting Started

### Prerequisites

```
✅ .NET 8 SDK
✅ Node.js 18+  (or Bun)
✅ Git
```

### 🖥️ Backend Setup

```bash
# Clone the repository
git clone https://github.com/IordacheFabian/Reactivities.git
cd Reactivities

# Restore packages
dotnet restore

# Apply database migrations
dotnet ef database update --project Persistence --startup-project API

# Start the API
cd API && dotnet run
```

> 🔗 API available at `https://localhost:5001`

### 🎨 Frontend Setup

```bash
cd client

# Install dependencies (pick one)
npm install     # or: bun install

# Start dev server
npm run dev     # or: bun dev
```

> 🔗 App available at `http://localhost:3000`

### 🔧 Environment Variables

**Backend** — `appsettings.Development.json`:
```json
{
  "TokenKey": "your-super-secret-jwt-key",
  "Cloudinary": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  }
}
```

**Frontend** — `.env.local`:
```env
VITE_API_URL=https://localhost:5001/api
```

---

## 🔬 Testing Strategy

| Layer | Tool | Type |
|-------|------|------|
| 🔧 Backend handlers | xUnit + FluentAssertions | Unit tests |
| 🌐 API endpoints | xUnit + WebApplicationFactory | Integration tests |
| 🎨 Components | Vitest + React Testing Library | Component tests |
| 🌍 End-to-end | Playwright | E2E tests |

---

## 🔒 Security Considerations

### ✅ Implemented
- JWT authentication with expiry
- ASP.NET Identity password hashing
- Authorization policies on endpoints
- FluentValidation at API boundary
- HTTPS enforcement

### 🔲 Planned
- Refresh token rotation
- Rate limiting
- Security response headers
- Role-based access control (RBAC)
- Audit logging
- CSRF protection

---

## 🚀 Future Improvements

### 🌟 Platform Features
```
📧 Email notifications          🗓️ Calendar integration
🔍 Advanced activity search     📊 Admin analytics dashboard
📱 Mobile-responsive design     🤖 Activity recommendations
🏷️  Tagging system              🗺️  Map-based activity discovery
```

### ⚙️ Technical Improvements
```
🐳 Docker + Docker Compose      ☸️  Kubernetes orchestration
🔴 Redis caching                📨 Background job processing
🔄 Event-driven architecture    📈 Observability (logs, traces, metrics)
🚀 CI/CD with GitHub Actions    ☁️  Azure / cloud deployment
```

---

## 👤 Author

<div align="center">

### Fabian Iordache

*Full-Stack Developer · Clean Architecture Enthusiast · Lifelong Learner*

[![GitHub](https://img.shields.io/badge/GitHub-IordacheFabian-181717?style=for-the-badge&logo=github)](https://github.com/IordacheFabian)

</div>

---

<div align="center">

**⭐ If you found this project useful or inspiring, consider giving it a star!**

*Built with ❤️ as a professional portfolio & learning platform.*

</div>
