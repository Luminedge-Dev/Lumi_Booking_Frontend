<div align="center">

# 🎓 Luminedge Booking Portal

### *Enterprise Student Mock-Test Scheduling, Entitlement Engine & TRF Evaluation Platform*

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-4.7-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)](https://daisyui.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)
[![Build Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)]()
[![Deployment](https://img.shields.io/badge/Deployment-Netlify%20%7C%20Vercel-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com)

<p align="center">
  <a href="#-project-overview">Overview</a> •
  <a href="#-core-value--engineering-highlights">Core Value</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#%EF%B8%8F-system-architecture--internal-workflow">Architecture</a> •
  <a href="#-api-integration--data-flow">API & Data Flow</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-folder-structure">Folder Structure</a> •
  <a href="#-installation--local-setup">Setup</a>
</p>

---

[🌐 Live Demo Platform](#) • [📡 Backend API Repository](../Lumi_Booking_Backend) • [📑 Architectural Specs](../context/architecture.md)

</div>

---

## 📌 Project Overview

**Luminedge Booking Portal** is a production-grade, multi-role academic examination scheduling and evaluation system designed for standardized English testing institutions (e.g., IELTS, mock assessments). The application bridges candidates, administrative operations, and academic evaluators into a unified, secure digital workflow.

### 🎯 The Challenge
High-stakes mock examinations suffer from disjointed workflows: candidates schedule exams across physical test centers and virtual home sessions, remaining balances are tracked on disconnected spreadsheets, seat capacities suffer from race conditions, and evaluators manually compile multi-skill scores (Listening, Reading, Writing, Speaking) into Test Report Forms (TRF) before dispatching them over email.

### 💡 The Solution
The Luminedge frontend delivers an end-to-end, edge-guarded web portal engineered with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**. It provides:
- **Instant Candidate Self-Service**: Live seat calendar, dual-mode bookings (Physical Test Center vs. Home-Based), and real-time quota tracking.
- **Strict Role-Gated Workspaces**: Isolated execution environments for four distinct personas: `user` (Students), `admin` (Directors), `bdm` (Business Development Managers), and `teacher` (Academic Assessors).
- **Automated TRF Engine**: In-browser score calculation, dynamic band score derivation, PDF synthesis (`jspdf` + `html2canvas`), and transactional email dispatch.
- **Operational Intelligence**: Visual throughput aggregations, monthly mock trends, and attendance monitoring via `Chart.js` and `Recharts`.

---

## 💎 Core Value & Engineering Highlights

This system transcends conventional CRUD architectures through complex domain constraints and rigorous runtime guarantees:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CORE DOMAIN INVARIANTS                           │
├────────────────────────────────┬────────────────────────────────────────────┤
│ 1. Atomic Entitlement Quotas   │ Every reservation decrements user balance   │
│                                │ while conditionally consuming physical     │
│                                │ capacity; cancellation reverses both in an │
│                                │ all-or-nothing transaction.                │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 2. Dual-Mode Eligibility Gate  │ Test Center bookings enforce strict seat   │
│                                │ counts; Home bookings validate courses     │
│                                │ against dynamic course capability rules.   │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 3. Multi-Skill TRF Scoring     │ Four discrete sections (L, R, W, S) with   │
│                                │ individual sub-scores, teacher audit trails│
│                                │ and client-rendered high-fidelity reports. │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 4. Edge-Shielded Navigation    │ Microsecond JWT inspection at the Edge     │
│                                │ preventing unauthenticated route access or │
│                                │ privilege escalation before SSR execution. │
└────────────────────────────────┴────────────────────────────────────────────┘
```

- **Zero-Flicker Edge Security**: Next.js Edge Middleware decodes incoming JWT cookies, validating expiry and routing authorized users straight to their respective role homes (`/dashboard`, `/admin/dashboard`, `/bdm/dashboard`, `/teacher/dashboard`), while injecting strict HTTP security headers (`CSP`, `HSTS`, `X-Frame-Options: DENY`).
- **Resilient Distributed State**: HTTP interceptors automatically inject authenticated bearer credentials, sanitize payloads, and manage session invalidations with zero user intervention.
- **High-Density Academic Dashboards**: Built with custom UI tokens featuring Montserrat typography, sleek dark surfaces (`#00000F`), and signature golden accents (`#FACE39`).

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose & Technical Justification |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) | `^15.5.x` | Hybrid SSR/SSG App Router, server-driven layouts, and lightning-fast Edge Middleware routing. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.x` | Strict compile-time safety across API payloads, role policies, and complex TRF grading forms. |
| **Core UI** | [React](https://react.dev/) | `~19.2.x` | Modern reactive UI paradigm utilizing high-concurrency client component trees. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^3.4.x` | Utility-first styling enabling micro-tailored UI tokens, animations, and responsive breakpoints. |
| **Component Kit** | [DaisyUI](https://daisyui.com/) | `^4.7.x` | Accessible semantic UI primitives configured over the custom brand design system. |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | `^12.6.x` | Smooth page transitions, sliding authentication panes, and interactive modal state changes. |
| **Networking** | [Axios](https://axios-http.com/) | `^1.20.x` | Centralized HTTP client configured with bearer token injection, interceptors, and strict timeouts. |
| **Edge Auth** | [jwt-decode](https://github.com/auth0/jwt-decode) | `^4.0.x` | Edge-compatible lightweight token decoder powering route guards without heavy crypto overhead. |
| **Visualization**| [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/) | `^4.4` / `^2.15` | Dual visualization engines powering administrative enrollment ratios and monthly attendance trends. |
| **Document Export**| [jspdf](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/) | `4.2.1` / `^1.4` | High-fidelity vector PDF generation converting live HTML TRF mockups into downloadable certificates. |
| **Form Engine** | [React Hook Form](https://react-hook-form.com/) | `^7.52.x` | Performant, uncontrolled form state management for massive multi-input teacher feedback assessments. |

---

## 🏗️ System Architecture & Internal Workflow

The platform follows a decoupled, client-server API-driven architecture. The frontend application operates as an intelligent client layer interfacing with an Express/MongoDB backend service.

```
                                      CLIENT BROWSER
                                            │
                             ┌──────────────▼──────────────┐
                             │    Next.js Edge Runtime     │
                             │   (src/middleware.ts)       │
                             └──────────────┬──────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
             Valid Token / Role Match                      Invalid / Expired
                     │                                             │
      ┌──────────────▼──────────────┐                ┌─────────────▼─────────────┐
      │   Role Route Groups         │                │  Redirect to /login       │
      │   ├── (withDashboard)       │                │  + Flash Notification     │
      │   ├── (withAdmin)           │                └───────────────────────────┘
      │   ├── (withBDM)             │
      │   └── (withTEACHER)         │
      └──────────────┬──────────────┘
                     │
         User Actions / Mutations
                     │
      ┌──────────────▼──────────────┐
      │   HTTP Client Layer         │
      │   (src/lib/http.ts)         │  ─── Auto-attaches Bearer Token from Cookie
      └──────────────┬──────────────┘
                     │
              HTTPS REST API
                     │
      ┌──────────────▼──────────────┐
      │   Backend Express Engine    │
      │   (src/app/modules/*)       │
      └──────────────┬──────────────┘
                     │
             MongoDB Transaction
                     │
      ┌──────────────▼──────────────┐
      │   Replica Set / Native DB   │
      │   [users, schedules, mocks] │
      └─────────────────────────────┘
```

### 1. Edge Authentication & Role Gateway
1. When a browser initiates a page request, **`src/middleware.ts`** intercepts the traffic at the edge.
2. The cookie `accessToken` is parsed and evaluated using `jwt-decode`.
3. If unauthenticated, access to protected endpoints (`/dashboard`, `/admin/*`, `/bdm/*`, `/teacher/*`) triggers an immediate redirect to `/login`.
4. If authenticated, role claims are cross-referenced against target namespaces:
   - Students attempting to enter `/admin` are bounced to `/dashboard`.
   - Teachers attempting to enter administrative billing are redirected to `/teacher/dashboard`.
5. Edge responses apply strict security policies (`X-Frame-Options: DENY`, `Strict-Transport-Security`, `CSP`).

### 2. Networking & Client Pipeline
1. Client components execute mutations via **`src/lib/http.ts`** or dedicated server actions.
2. The client fetches authentication tokens from local storage / cookies, mounting an `Authorization: Bearer <token>` header.
3. Errors (e.g., `401 Unauthorized`, `403 Forbidden`, `409 Conflict`) are parsed into user-friendly notifications via `react-hot-toast`.

---

## 📡 API Integration & Data Flow

The frontend coordinates with the backend across **6 functional domains**:

### 1. Authentication & Credentials
| Method | Endpoint | Description | Request Context | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/register` | Student self-registration | Full candidate profile, contact & receipt ID | `{ success: true, message, user }` |
| `POST` | `/api/v1/login` | Authenticate & issue session | Email, Password | `{ token, role, userId, user }` |
| `POST` | `/api/v1/auth/forget-password` | Dispatch password reset link | Registered Email | `{ message: "Reset email dispatched" }` |
| `PUT` | `/api/v1/auth/reset-password` | Finalize password reset token | New Password, Token | `{ success: true }` |
| `PUT` | `/api/v1/user/change-password` | Authenticated credential rotation | Current & New Password | `{ success: true }` |

### 2. Slot Booking & Scheduling Engine
| Method | Endpoint | Description | Request Context | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/courses` | Retrieve active courses | Public catalog request | `Course[]` |
| `GET` | `/api/v1/schedule/:date/:courseId` | Inspect seat availability | Date, Target Course ID | `ScheduleSlot[]` |
| `POST` | `/api/v1/user/book-slot` | Reserve Home or Center slot | `bookingType`, `scheduleId`, `slotId` | `{ bookingId, status: "confirmed" }` |
| `GET` | `/api/v1/user/bookings/:userId` | Retrieve candidate bookings | User ID parameter | `BookingRecord[]` |
| `DELETE`| `/api/v1/bookings/:bookingId` | Cancel slot & restore credit | Booking ID parameter | `{ restoredBalance: number }` |

### 3. Teacher Feedback & Test Report Form (TRF)
| Method | Endpoint | Description | Request Context | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/admin/save-feedback` | Record teacher evaluation | Scores for L, R, W, S + descriptive feedback | `{ updated: true }` |
| `PUT` | `/api/v1/admin/save-admin-section`| Commit official test scores | Band score, TRF candidate metadata | `{ saved: true }` |
| `GET` | `/api/v1/admin/feedback-status/:uId/:sId` | Retrieve evaluation completeness | User ID & Schedule ID | `{ completedSections: string[] }` |
| `POST` | `/api/v1/admin/send-trf-email/:uId/:sId` | Dispatch TRF PDF to candidate | User ID & Schedule ID | `{ dispatched: true }` |

### 4. Administrative Operations & Analytics
| Method | Endpoint | Description | Request Context | Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | Paginated search of candidates | Query parameters (`search`, `page`, `status`) | `{ users: User[], total: number }` |
| `PUT` | `/api/v1/user/status/:userId` | Activate / Suspend candidate | Target User ID, Status (`active` / `blocked`) | `{ user: UpdatedUser }` |
| `PUT` | `/api/v1/user/update-multiple/:userId` | Allocate / Adjust mock quotas | Updated mock packages and balances | `{ remainingMocks: number }` |
| `GET` | `/api/v1/admin/stats/bookings/attendance`| Aggregate attendance metrics | Date range filters | `{ attended: number, absent: number }`|

---

## ⚡ Key Features

### 👨‍🎓 Student Experience (`/dashboard`)
- **Interactive Slot Selector**: Clean calendar view filtering physical test center locations and available time windows.
- **Dual-Mode Booking**: Seamless switching between in-person test venues and verified home assessments.
- **Credit Vault**: Transparent display of purchased mock entitlements, remaining attempts, and booking receipts.
- **Automated TRF Download**: Direct in-dashboard viewing and vector PDF downloading of scored Test Report Forms.

### 🛡️ Administrative Command Center (`/admin`)
- **Quota & Balance Management**: Increment or decrement candidate mock credits with full audit notes.
- **Real-Time Schedule Matrix**: Create and schedule slots with customizable capacity caps and room assignments.
- **Master Attendance Roster**: Bulk check-in toggles (`Present`, `Absent`, `Excused`) synchronizing live exam participation.
- **Intelligence Dashboard**: Real-time analytical charts tracking monthly registration velocity and venue capacity utilization.

### 🧑‍🏫 Teacher Evaluation Workspace (`/teacher`)
- **Multi-Skill Scoring Sheet**: Structured grading inputs for Listening, Reading, Writing, and Speaking skills.
- **Band Score Calculator**: Automatic calculation of component and overall band scores adhering to official rubrics.
- **Teacher Assignment View**: Real-time rosters showing candidates assigned to specific examiners.

### 💼 Business Development Management (`/bdm`)
- **Candidate Inquiry Tracking**: Fast-search candidate directory with registration validation statuses.
- **Schedule Utilization Audit**: Live visibility over under-booked and fully-booked examination dates.

---

## 📂 Folder Structure

```bash
Lumi_Booking_Frontend/
 ┣ public/                         # Static assets, brand logos, banners & screenshots
 ┣ src/
 ┃ ┣ app/                          # Next.js App Router (Layouts, Pages, Route Groups)
 ┃ ┃ ┣ (withAdmin)/admin/          # Administrator portal (TRF, schedules, analytics, users)
 ┃ ┃ ┣ (withBDM)/bdm/              # Business Development Manager workspace
 ┃ ┃ ┣ (withDashboard)/dashboard/  # Candidate self-service dashboard & booking calendar
 ┃ ┃ ┣ (withTEACHER)/teacher/      # Academic evaluation & TRF scoring sheets
 ┃ ┃ ┣ login/                      # Responsive sliding split-panel login page
 ┃ ┃ ┣ register/                   # Multi-field student registration with receipt verification
 ┃ ┃ ┣ forget-password/           # Self-service password recovery flow
 ┃ ┃ ┣ reset-password/            # Secure credential rotation screen
 ┃ ┃ ┣ helpers/                    # JWT decoding utilities and token storage helpers
 ┃ ┃ ┣ utils/                      # Date/time calculators, teacher assignments & actions
 ┃ ┃ ┣ layout.tsx                  # Root HTML shell, Montserrat font injection & providers
 ┃ ┃ ┗ globals.css                 # Core CSS design tokens, custom shadows & animations
 ┃ ┣ components/                   # Modular React UI components
 ┃ ┃ ┣ shared/                     # Multi-role Navbars, Sidebar navigation layouts
 ┃ ┃ ┣ FinalTRFPage.tsx            # Full printable & exportable official Test Report Form
 ┃ ┃ ┣ TestReportForm.tsx          # Dynamic multi-skill assessment input forms
 ┃ ┃ ┣ tableAdmin.tsx              # High-density data table with filters, search & pagination
 ┃ ┃ ┣ DonutChart.tsx              # Analytics donut chart widget (Chart.js)
 ┃ ┃ ┗ AuthGuard.tsx               # Client-side component authorization wrapper
 ┃ ┣ hooks/                        # Custom React hooks (e.g., useUser state tracker)
 ┃ ┣ lib/                          # Core runtime configurations & HTTP abstractions
 ┃ ┃ ┣ config.ts                   # Strict environment variable assertions & URL validation
 ┃ ┃ ┣ http.ts                     # Pre-configured Axios instance with bearer interceptors
 ┃ ┃ ┗ courseConfig.ts             # Course mapping constants and system definitions
 ┃ ┗ middleware.ts                 # Next.js Edge Middleware for zero-trust route protection
 ┣ netlify.toml                    # Netlify production edge deployment configuration
 ┣ tailwind.config.ts              # Tailwind CSS design system and DaisyUI plugin config
 ┣ tsconfig.json                   # Strict TypeScript compiler options
 ┗ package.json                    # Project manifest, scripts, and runtime dependencies
```

---


<div align="center">

**Built with precision for educational assessment excellence.**
*Luminedge Booking Portal • Designed & Maintained by the Luminedge Engineering Team*

</div>
