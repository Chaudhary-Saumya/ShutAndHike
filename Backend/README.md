# Shut & Hike — Backend API Documentation

A production-grade, secure Node.js, Express & MongoDB agency management backend with complete Role-Based Access Control (RBAC).

---

## 1. System Roles & Permission Matrix

The platform supports 4 distinct roles:

| Role | Description | Can Create | Can Enable/Disable | Can Update/Delete |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Agency Owner & System Administrator | Manager, Employee, Client | Manager, Employee, Client | All Managers, Employees, Clients |
| **Manager** | Operations & Team Manager | Employee, Client | Employee, Client | Employees & Clients |
| **Employee** | Execution & Team Member | None | None | View own profile & assigned tasks |
| **Client** | Customer & Approver | None | None | View own profile & approvals |

> **Registration Policy:** Public self-registration (`POST /api/auth/register`) is strictly restricted to **Admin** accounts only. Managers, Employees, and Clients cannot self-register; their accounts are created by authorized roles.

---

## 2. Environment Configuration

Create a `.env` file in the `Backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/shut_and_hike
JWT_SECRET=your_jwt_secret_key_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## 3. Complete API Reference

All protected endpoints require an authentication token via either:
- **Authorization Header:** `Authorization: Bearer <TOKEN>`
- **HTTP-Only Cookie:** `token=<TOKEN>`

---

### A. Authentication Module (`/api/auth`)

| Method | Path | Access | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | **Public** | Register Admin | Registers the initial/owner Admin account. Enforces `role: Admin`. |
| `POST` | `/api/auth/login` | **Public** | Login User | Authenticates user (any active role). Issues JWT & sets cookie. |
| `POST` | `/api/auth/logout` | **Public** | Logout User | Clears the HTTP-only auth token cookie. |
| `GET` | `/api/auth/me` | **Authenticated** | Current Profile | Fetches current logged-in user profile with populated creator info. |
| `PATCH`| `/api/auth/change-password` | **Authenticated** | Change Password | Updates password for the authenticated user. |
| `GET` | `/api/auth/roles` | **Public** | List Roles | Returns all available roles and their permission definitions. |

#### `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Super Admin",
    "email": "admin@example.com",
    "password": "password123",
    "phone": "9876543210"        // Optional (string, null, or omit)
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Admin registered successfully.",
    "data": {
      "user": {
        "_id": "673dd3008d098e0012345670",
        "name": "Super Admin",
        "email": "admin@example.com",
        "role": "Admin",
        "phone": "9876543210",
        "isActive": true,
        "accessStatus": "active"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

#### `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully.",
    "data": {
      "user": {
        "_id": "673dd3008d098e0012345670",
        "name": "Super Admin",
        "email": "admin@example.com",
        "role": "Admin",
        "isActive": true,
        "accessStatus": "active"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

---

### B. Manager Module (`/api/manager`)

| Method | Path | Access | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/manager` | **Admin Only** | Create Manager | Creates a Manager account with designation and access status. |
| `GET` | `/api/manager` | **Admin & Manager** | List Managers | Retrieves all managers with pagination (`?page=1&limit=10`), search (`?search=john`), and status filter (`?status=active`). |
| `GET` | `/api/manager/:id` | **Admin & Manager** | Get Manager | Fetches single manager details with populated creator info. |
| `PATCH`| `/api/manager/:id/status` | **Admin Only** | Enable / Disable | Enables or disables the manager account. Real-time revocation. |
| `PUT` | `/api/manager/:id` | **Admin Only** | Update Manager | Updates manager name, email, phone, designation, status, or password. |
| `DELETE`| `/api/manager/:id` | **Admin Only** | Delete Manager | Permanently deletes the manager account from database. |

#### `POST /api/manager`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.manager@agency.com",
    "password": "managerPassword123",
    "phone": "+919876543210",                // Optional
    "designation": "Senior Operations Manager", // Optional (default: "Manager")
    "status": "active"                        // Optional ("active" | "inactive", default: "active")
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Manager created successfully.",
    "data": {
      "manager": {
        "_id": "673dd35f8d098e0012345678",
        "name": "Jane Doe",
        "email": "jane.manager@agency.com",
        "role": "Manager",
        "phone": "+919876543210",
        "designation": "Senior Operations Manager",
        "isActive": true,
        "accessStatus": "active",
        "createdBy": {
          "_id": "673dd3008d098e0012345670",
          "name": "Super Admin",
          "email": "admin@agency.com",
          "role": "Admin"
        }
      }
    }
  }
  ```

#### `PATCH /api/manager/:id/status`
- **Request Body:**
  ```json
  { "status": "inactive" }   // or { "isActive": false }, or empty body {} to toggle
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Manager account successfully disabled.",
    "data": {
      "manager": {
        "_id": "673dd35f8d098e0012345678",
        "name": "Jane Doe",
        "isActive": false,
        "accessStatus": "inactive"
      }
    }
  }
  ```

---

### C. Employee Module (`/api/employee`)

| Method | Path | Access | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/employee` | **Admin & Manager** | Create Employee | Creates an Employee account with designation and access status. |
| `GET` | `/api/employee` | **Admin & Manager** | List Employees | Retrieves all employees with pagination (`?page=1&limit=10`), search (`?search=dev`), and status filter (`?status=active`). |
| `GET` | `/api/employee/:id` | **Admin, Manager, Employee** | Get Employee | Fetches employee by ID. Employees can only view their own profile. |
| `PATCH`| `/api/employee/:id/status` | **Admin & Manager** | Enable / Disable | Enables or disables employee account. Real-time revocation. |
| `PUT` | `/api/employee/:id` | **Admin & Manager** | Update Employee | Updates employee details. Re-hashes password if provided. |
| `DELETE`| `/api/employee/:id` | **Admin & Manager** | Delete Employee | Deletes employee account. |

#### `POST /api/employee`
- **Request Body:**
  ```json
  {
    "name": "Bob Developer",
    "email": "bob@agency.com",
    "password": "employeePassword123",
    "phone": "9876543211",                   // Optional
    "designation": "Senior Backend Engineer", // Optional (default: "Employee")
    "status": "active"                        // Optional ("active" | "inactive")
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Employee created successfully.",
    "data": {
      "employee": {
        "_id": "673dd3bf8d098e0012345679",
        "name": "Bob Developer",
        "email": "bob@agency.com",
        "role": "Employee",
        "phone": "9876543211",
        "designation": "Senior Backend Engineer",
        "isActive": true,
        "accessStatus": "active",
        "createdBy": {
          "_id": "673dd35f8d098e0012345678",
          "name": "Jane Doe",
          "email": "jane.manager@agency.com",
          "role": "Manager"
        }
      }
    }
  }
  ```

#### `PATCH /api/employee/:id/status`
- **Request Body:**
  ```json
  { "status": "inactive" }   // or { "isActive": false }, or empty body {} to toggle
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Employee account successfully disabled.",
    "data": {
      "employee": {
        "_id": "673dd3bf8d098e0012345679",
        "name": "Bob Developer",
        "isActive": false,
        "accessStatus": "inactive"
      }
    }
  }
  ```

---

### D. Client Module (`/api/client`)

| Method | Path | Access | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/client` | **Admin & Manager** | Create Client | Creates a Client account with access status. |
| `GET` | `/api/client` | **Admin & Manager** | List Clients | Retrieves all clients with pagination (`?page=1&limit=10`), search, and status filter. |
| `GET` | `/api/client/:id` | **Admin, Manager, Client** | Get Client | Fetches client by ID. Clients can only view their own profile. |
| `PATCH`| `/api/client/:id/status` | **Admin & Manager** | Enable / Disable | Enables or disables client account. Real-time revocation. |
| `PUT` | `/api/client/:id` | **Admin & Manager** | Update Client | Updates client details. Re-hashes password if provided. |
| `DELETE`| `/api/client/:id` | **Admin & Manager** | Delete Client | Deletes client account. |

#### `POST /api/client`
- **Request Body:**
  ```json
  {
    "name": "Acme Corp (Client)",
    "email": "contact@acme.com",
    "password": "clientPassword123",
    "phone": "9876543212",      // Optional
    "status": "active"           // Optional ("active" | "inactive")
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Client created successfully.",
    "data": {
      "client": {
        "_id": "673dd4008d098e0012345680",
        "name": "Acme Corp (Client)",
        "email": "contact@acme.com",
        "role": "Client",
        "phone": "9876543212",
        "isActive": true,
        "accessStatus": "active",
        "createdBy": {
          "_id": "673dd35f8d098e0012345678",
          "name": "Jane Doe",
          "email": "jane.manager@agency.com",
          "role": "Manager"
        }
      }
    }
  }
  ```

---

### E. Universal User Management Module (`/api/user`)

For centralized Admin dashboard operations across all accounts:

| Method | Path | Access | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/user` | **Admin Only** | List All Users | Retrieves all users across all roles (Admin, Manager, Employee, Client) with filters (`?role=Manager`, `?status=inactive`, `?search=john`). |
| `GET` | `/api/user/:id` | **Admin Only** | Get Any User | Fetches user details by ID for any role. |
| `PATCH`| `/api/user/:id/status` | **Admin Only** | Enable / Disable | Enables or disables **ANY** account (Manager, Employee, or Client) accurately. Prevents Admin from disabling self. |

#### `PATCH /api/user/:id/status`
- **Request Body:**
  ```json
  { "status": "inactive" }   // or { "isActive": false }, or empty body {} to toggle
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Manager account (Jane Doe) successfully disabled.",
    "data": {
      "user": {
        "_id": "673dd35f8d098e0012345678",
        "name": "Jane Doe",
        "role": "Manager",
        "isActive": false,
        "accessStatus": "inactive"
      }
    }
  }
  ```

---

### F. Health Check (`/health`)

| Method | Path | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | **Public** | Returns server status, uptime, and timestamp. |

- **Response (`200 OK`):**
  ```json
  {
    "status": "ok",
    "uptime": 124.52,
    "timestamp": "2026-11-20T09:30:00.000Z"
  }
  ```

---

## 4. Query Parameter Support

For all listing endpoints (`/api/manager`, `/api/employee`, `/api/client`, `/api/user`):

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `page` | Integer | `?page=1` | Current page number (default: 1) |
| `limit` | Integer | `?limit=10` | Records per page (default: 10, max: 100) |
| `search` | String | `?search=doe` | Matches name, email, phone, and designation (case-insensitive) |
| `status` | String | `?status=active` | Filters by account access status (`active` or `inactive`) |
| `designation` | String | `?designation=lead` | Filters by designation |
| `role` | String | `?role=Manager` | *(On `/api/user` only)* Filters by user role (`Admin`, `Manager`, `Employee`, `Client`) |

---

## 5. Security & Error Handling

- **Immediate Real-Time Revocation:** Whenever an account is marked `isActive: false`, the `authenticate` middleware immediately stops accepting requests from that token, returning `403 Forbidden`.
- **Password Protection:** Passwords are automatically hashed with bcrypt (`salt rounds = 10`) on creation and update. Passwords are never returned in responses (`select: false`).
- **Standardized Error Format:**
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
  ```
