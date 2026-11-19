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
| `PATCH` | `/api/auth/change-password` | Update authenticated user password |
| `GET` | `/api/auth/roles` | List available roles and descriptions |

---

## Manager API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/manager/create-manager` | Create a new manager account (`name`, `email`, `password`, `phone`, `designation`) |
| `GET` | `/api/manager/get-manager` | Fetch all manager accounts with creator info |
| `GET` | `/api/manager/get-manager/:id` | Fetch single manager account by ID |
| `PUT` | `/api/manager/update-manager/:id` | Update manager account details by ID |
| `DELETE` | `/api/manager/delete-manager/:id` | Delete a manager account by ID |

---

## Employee API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/employee/create-employee` | Create a new employee account (Admin and Manager) |
| `GET` | `/api/employee/get-employee` | Fetch all employee accounts |
| `GET` | `/api/employee/get-employee/:id` | Fetch single employee account by ID |
| `PUT` | `/api/employee/update-employee/:id` | Update employee account by ID |
| `DELETE` | `/api/employee/delete-employee/:id` | Delete employee account by ID |

---

## Client API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/client/create-client` | Create a new client account (`name`, `email`, `password`, `phone`, `companyName`, `industry`, `billingAddress`, `reportingTo`) |
| `GET` | `/api/client/get-client` | Fetch all client accounts with pagination & search |
| `GET` | `/api/client/get-client/:id` | Fetch single client account by ID |
| `PUT` | `/api/client/update-client/:id` | Update client account details by ID |
| `DELETE` | `/api/client/delete-client/:id` | Delete a client account by ID (Admin only) |
