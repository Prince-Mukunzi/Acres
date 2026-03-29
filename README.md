# Acres -- Property Management System

Acres is a full-stack property management platform built to digitize and streamline day-to-day property operations. It gives landlords and property managers a centralized workspace to manage properties, units, tenants, maintenance tickets, and tenant communications -- all behind a secure, authenticated interface.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation and Setup](#installation-and-setup)
   - [Backend](#1-backend)
   - [Frontend](#2-frontend)
   - [Database](#3-database)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [API Overview](#api-overview)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Features

### Dashboard and Analytics
- Overview dashboard displaying key metrics such as total properties, occupied vs. vacant units, and overdue tenants.
- Interactive charts (powered by Recharts) for visualizing rent distribution and occupancy status.

### Property Management
- Create, view, update, and delete properties.
- Each property scopes its own set of units, tenants, and tickets.

### Unit Management
- Add individual units or bulk-create up to 50+ units in a single transaction via the `/bulk` API endpoint.
- Track unit status (occupied or vacant) and associated rent amounts.
- CSV export of unit data for offline reporting.

### Tenant Management
- Full CRUD operations on tenant records, including lease start and end dates.
- Tenants are linked to specific units, enabling automatic occupancy tracking.
- Filter and identify overdue tenants from the dashboard.

### Maintenance Tickets
- Property managers can create and resolve maintenance tickets tied to specific units.
- QR code generation per unit -- tenants scan the code to access a public ticket submission form pre-filled with their unit information.
- Ticket status tracking through RECEIVED, IN_PROGRESS, and COMPLETED stages.

### Tenant Communication
- Send email communications to tenants directly from the platform.
- Emails are dispatched through the Resend email service.
- Communication history is stored and associated with the relevant tenant and unit.

### Authentication and Security
- Google OAuth login via `@react-oauth/google`.
- JWT-based session management with server-side validation.
- Row-level data isolation: every database query is scoped to the authenticated user, ensuring tenants of one manager are never visible to another.

### Optimistic UI Updates
- All data mutations use TanStack React Query with optimistic updates, providing a zero-latency feel for the end user while changes sync with the backend in the background.

---

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Frontend       | React 19, TypeScript, Vite                       |
| Styling        | TailwindCSS 4, Radix UI, Lucide Icons            |
| State/Data     | TanStack React Query, TanStack React Table        |
| Routing        | React Router DOM v7                              |
| Backend        | Python 3, Flask                                  |
| Database       | CockroachDB (PostgreSQL-compatible), psycopg2    |
| Authentication | Google OAuth 2.0, PyJWT                          |
| Email Service  | Resend                                           |

---

## Project Structure

```
Acres/
├── app.py                  # Flask application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Root environment variables
├── backend/
│   ├── routes/
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── property.py     # Property CRUD
│   │   ├── unit.py         # Unit CRUD and bulk operations
│   │   ├── tenant.py       # Tenant CRUD
│   │   ├── ticket.py       # Maintenance ticket endpoints
│   │   ├── communication.py# Email communication endpoints
│   │   ├── stats.py        # Dashboard statistics
│   │   └── seed.py         # Database seeding endpoint
│   └── utils/
│       ├── db.py           # Database connection utility
│       └── auth_middleware.py  # JWT validation middleware
├── database/
│   ├── schema.sql          # Table definitions
│   ├── dummy_data.sql      # Sample seed data
│   └── setup_db.py         # Automated schema + seed runner
├── frontend/
│   ├── package.json        # Node dependencies
│   ├── vite.config.ts      # Vite configuration
│   ├── index.html          # HTML entry point
│   └── src/
│       ├── App.tsx          # Root component with routing
│       ├── main.tsx         # React DOM mount
│       ├── index.css        # Global styles
│       ├── pages/           # Page-level components
│       ├── components/      # Reusable UI and feature components
│       ├── contexts/        # React context providers (Auth)
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utility libraries
│       ├── types/           # TypeScript type definitions
│       └── utils/           # Helper functions
└── tests/
    ├── test_property.py
    ├── test_unit.py
    ├── test_tenant.py
    ├── test_ticket.py
    └── test_communication.py
```

---

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher and npm
- A PostgreSQL-compatible database (CockroachDB or standard PostgreSQL)
- A Google Cloud project with OAuth 2.0 credentials configured
- A Resend account and API key (for email functionality)

---

## Installation and Setup

### 1. Backend

From the project root directory:

```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. Database

The database setup script will create all tables and optionally seed them with sample data:

```bash
python database/setup_db.py
```

This script drops any existing tables, applies `schema.sql`, and then inserts the records defined in `dummy_data.sql`.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DB_USER=your_db_username
DB_PASS=your_db_password
DB_HOST=your_db_host
DB_PORT=26257
DB_NAME=your_db_name

# Authentication
AUTH_SECRET=your_jwt_secret_key

# Email
RESEND_API_KEY=your_resend_api_key
```

Create a separate `.env` file inside the `frontend/` directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## Running the Application

Start the backend server (defaults to `http://localhost:5000`):

```bash
python3 app.py
```

In a separate terminal, start the frontend dev server:

```bash
cd frontend
npm run dev
```

The frontend development server will start on `http://localhost:5173` by default and proxy API requests to the Flask backend.

---

## API Overview

All API routes are versioned under `/api/v1`. The following blueprints are registered:

| Blueprint       | Prefix          | Description                                      |
|-----------------|-----------------|--------------------------------------------------|
| `auth`          | `/api/v1`       | Google OAuth callback and JWT token issuance      |
| `property`      | `/api/v1`       | CRUD operations for properties                    |
| `unit`          | `/api/v1`       | CRUD and bulk creation for units                  |
| `tenant`        | `/api/v1`       | CRUD operations for tenants                       |
| `ticket`        | `/api/v1`       | Maintenance ticket creation, updates, resolution  |
| `communication` | `/api/v1`       | Send and log email communications                 |
| `stats`         | `/api/v1`       | Aggregated statistics for the dashboard           |
| `seed`          | `/api/v1`       | Database seeding for development                  |

All endpoints (except ticket submission and authentication) require a valid JWT token passed in the `Authorization` header.

---

## Testing

Unit tests are located in the `tests/` directory and cover the core route modules:

```bash
python -m pytest tests/
```

Test files:
- `test_property.py` -- Property route tests
- `test_unit.py` -- Unit route tests
- `test_tenant.py` -- Tenant route tests
- `test_ticket.py` -- Ticket route tests
- `test_communication.py` -- Communication route tests

---

## Deployment

### Frontend

Build the production bundle:

```bash
cd frontend
npm run build
```

The output is written to `frontend/dist/`. Deploy this directory to any static hosting provider (Vercel, Netlify, Nginx, etc.).

### Backend

Run the Flask application behind a production WSGI server:

```bash
pip install gunicorn
gunicorn app:app --bind 0.0.0.0:5000
```

Make sure all environment variables are configured on the production server and that the database is accessible from the deployment environment.
