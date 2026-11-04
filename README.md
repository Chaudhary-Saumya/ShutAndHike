# Shut & Hike

A full-stack agency and project management platform featuring role-based access control and production-ready security.

---

## Roles Overview

| Role | Responsibility |
| :--- | :--- |
| **Admin** | Agency owner / system administrator. Manages organization settings, users, services, clients, proposals, projects, tasks, invoices, reports, and all agency data. |
| **Manager** | Runs day-to-day client servicing and delivery. Manages clients, proposals, services, projects, tasks, campaigns, and leads. |
| **Employee** | Executes assigned agency work. Views assigned projects and tasks, updates task statuses, and submits work. |
| **Client** | Agency customer and approver. Views active services, project progress, submitted deliverables, and invoices. |

---

## Tech Stack

### Backend
- **Runtime:** Node.js & Express
- **Database:** MongoDB via Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with HTTP-only Cookies
- **Validation:** Zod
- **Security:** Rate limiting (`express-rate-limit`), bcrypt password hashing, CORS protection

### Frontend
- **Framework:** React 19 + Vite
- **HTTP Client:** Axios

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string or local MongoDB instance

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (refer to `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Authentication API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user with role validation |
| `POST` | `/api/auth/login` | Authenticate and issue JWT / secure cookie |
| `POST` | `/api/auth/logout` | Clear authentication cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/auth/roles` | List available roles and descriptions |
