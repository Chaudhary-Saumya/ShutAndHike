# Shut & Hike — API Reference

Base URL: `http://localhost:5000` (or configured `PORT`)  
Auth: `Authorization: Bearer <token>` or Cookie `token=<token>`

---

## Complete API List

### 1. Authentication (`/api/auth`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/auth/register` | Public | Register initial Admin account |
| 2 | `POST` | `/api/auth/login` | Public | Login user & issue JWT |
| 3 | `POST` | `/api/auth/logout` | Public | Clear auth cookie / logout |
| 4 | `GET` | `/api/auth/me` | Authenticated | Get current logged-in user profile |
| 5 | `PATCH` | `/api/auth/change-password` | Authenticated | Change current user password |
| 6 | `GET` | `/api/auth/roles` | Public | Get system roles & permissions |

---

### 2. Manager Management (`/api/manager`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/manager` | Admin | Create a new Manager |
| 2 | `GET` | `/api/manager` | Admin, Manager | List all Managers (supports `?page`, `?limit`, `?search`, `?status`) |
| 3 | `GET` | `/api/manager/:id` | Admin, Manager | Get Manager details by ID |
| 4 | `PATCH` | `/api/manager/:id/status` | Admin | Enable or disable Manager account |
| 5 | `PUT` | `/api/manager/:id` | Admin | Update Manager details |
| 6 | `DELETE` | `/api/manager/:id` | Admin | Permanently delete Manager |

---

### 3. Employee Management (`/api/employee`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/employee` | Admin, Manager | Create a new Employee |
| 2 | `GET` | `/api/employee` | Admin, Manager | List all Employees (supports `?page`, `?limit`, `?search`, `?status`) |
| 3 | `GET` | `/api/employee/:id` | Admin, Manager, Employee | Get Employee details by ID (Employee: own profile only) |
| 4 | `PATCH` | `/api/employee/:id/status` | Admin, Manager | Enable or disable Employee account |
| 5 | `PUT` | `/api/employee/:id` | Admin, Manager | Update Employee details |
| 6 | `DELETE` | `/api/employee/:id` | Admin, Manager | Permanently delete Employee |

---

### 4. Client Management (`/api/client`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/client` | Admin, Manager | Create a new Client account |
| 2 | `GET` | `/api/client` | Admin, Manager | List all Clients (supports `?page`, `?limit`, `?search`, `?status`) |
| 3 | `GET` | `/api/client/:id` | Admin, Manager, Client | Get Client details by ID (Client: own profile only) |
| 4 | `PATCH` | `/api/client/:id/status` | Admin, Manager | Enable or disable Client account |
| 5 | `PUT` | `/api/client/:id` | Admin, Manager | Update Client details |
| 6 | `DELETE` | `/api/client/:id` | Admin, Manager | Permanently delete Client |

---

### 5. Universal User Management (`/api/user`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/api/user` | Admin | List all users across all roles (`?role`, `?status`, `?search`) |
| 2 | `GET` | `/api/user/:id` | Admin | Get any user details by ID |
| 3 | `PATCH` | `/api/user/:id/status` | Admin | Toggle status for any user account |

---

### 6. Company Management (`/api/company`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/company` | Admin, Manager | Create Company linked to Client |
| 2 | `GET` | `/api/company` | Admin, Manager | List all Companies (`?page`, `?limit`, `?search`, `?status`) |
| 3 | `GET` | `/api/company/client/:clientId` | Admin, Manager, Client | Get Companies by Client ID (Client: own only) |
| 4 | `GET` | `/api/company/:id` | Admin, Manager, Client | Get Company by ID (Client: own only) |
| 5 | `PUT` | `/api/company/:id` | Admin, Manager | Update Company details |
| 6 | `DELETE` | `/api/company/:id` | Admin, Manager | Permanently delete Company |

---

### 7. Master Services (`/api/master_service`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/master_service` | Admin, Manager | Create a Master Service in catalog |
| 2 | `GET` | `/api/master_service` | Admin, Manager | List Master Services (`?page`, `?limit`, `?category`, `?status`, `?search`) |
| 3 | `GET` | `/api/master_service/:id` | Admin, Manager | Get Master Service details by ID |
| 4 | `PUT` | `/api/master_service/:id` | Admin, Manager | Update Master Service |
| 5 | `DELETE` | `/api/master_service/:id` | Admin, Manager | Permanently delete Master Service |

---

### 8. Proposal Management (`/api/proposal`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/proposal` | Admin, Manager | Create Proposal with services & pricing |
| 2 | `GET` | `/api/proposal` | Admin, Manager | List all Proposals (`?page`, `?limit`, `?status`, `?clientId`, `?search`) |
| 3 | `GET` | `/api/proposal/client/:clientId` | Admin, Manager, Client | Get Proposals by Client ID (Client: own only) |
| 4 | `GET` | `/api/proposal/:id` | Admin, Manager, Client | Get Proposal details by ID (Client: own only) |
| 5 | `PATCH` | `/api/proposal/:id/status` | Admin, Manager | Update Proposal status (`draft`, `accepted`, `rejected`, `revision_requested`) |
| 6 | `PATCH` | `/api/proposal/:id/client-status` | Client | Client respond to Proposal (`accepted`, `rejected`, `revision_requested`) |
| 7 | `PUT` | `/api/proposal/:id` | Admin, Manager | Update Proposal details & services |
| 8 | `DELETE` | `/api/proposal/:id` | Admin, Manager | Permanently delete Proposal |

---

### 9. Client Services (`/api/client_service`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/client_service` | Admin, Manager, Client | Create Client Service from accepted Proposal |
| 2 | `GET` | `/api/client_service` | Admin, Manager, Client | List Client Services (`?page`, `?limit`, `?status`, `?clientId`, `?search`) |
| 3 | `GET` | `/api/client_service/client/:clientId` | Admin, Manager, Client | Get Client Services by Client ID (Client: own only) |
| 4 | `GET` | `/api/client_service/:id` | Admin, Manager, Client | Get Client Service details by ID (Client: own only) |
| 5 | `PATCH` | `/api/client_service/:id/status` | Admin, Manager | Update Client Service status (`active`, `paused`, `completed`, `cancelled`) |
| 6 | `PUT` | `/api/client_service/:id` | Admin, Manager | Update Client Service details, pricing & dates |
| 7 | `DELETE` | `/api/client_service/:id` | Admin, Manager | Permanently delete Client Service |

---

### 10. System Health (`/health`)

| # | Method | Endpoint | Access | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/health` | Public | Server uptime and health check |
