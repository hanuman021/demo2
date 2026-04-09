# LogiTrack – Logistics App Frontend

A React + Vite frontend for a logistics management platform.

## Features

- **Login / Register** pages with JWT authentication (tokens stored in `localStorage`)
- **Customer Dashboard** – create new delivery orders and view existing ones
- **Delivery Dashboard** – accept available orders, mark them in-transit / delivered, track earnings
- **Admin Dashboard** – view total orders, revenue, profit, and filter/browse all orders
- **Role-based routing** – each role is redirected to its own dashboard
- **Axios interceptors** – JWT is attached to every API request; 401 responses auto-redirect to login

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI library |
| Vite 8 | Build tool / dev server |
| React Router v7 | Client-side routing |
| Axios | HTTP client + JWT interceptors |
| CSS Modules | Scoped component styling |

## Getting Started

```bash
cd frontend
cp .env.example .env          # set VITE_API_BASE_URL to your backend
npm install
npm run dev                   # starts on http://localhost:5173
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Backend REST API base URL |

## Expected API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | public | Returns `{ token, user }` |
| POST | `/auth/register` | public | Returns `{ token, user }` |
| GET | `/orders/my` | customer | Customer's own orders |
| POST | `/orders` | customer | Create a new order |
| GET | `/orders/available` | delivery | Pending orders available to accept |
| GET | `/orders/my-deliveries` | delivery | Orders assigned to the agent |
| PUT | `/orders/:id/accept` | delivery | Accept a pending order |
| PUT | `/orders/:id/status` | delivery | Update order status |
| GET | `/admin/stats` | admin | `{ totalOrders, revenue, profit }` |
| GET | `/admin/orders` | admin | All orders (full list) |

## Project Structure

```
frontend/
└── src/
    ├── api/
    │   └── axios.js            # Axios instance with JWT interceptors
    ├── context/
    │   └── AuthContext.jsx     # Auth state, login, register, logout
    ├── components/
    │   ├── Auth/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Auth.module.css
    │   ├── Customer/
    │   │   ├── CustomerDashboard.jsx
    │   │   └── Customer.module.css
    │   ├── Delivery/
    │   │   ├── DeliveryDashboard.jsx
    │   │   └── Delivery.module.css
    │   ├── Admin/
    │   │   ├── AdminDashboard.jsx
    │   │   └── Admin.module.css
    │   ├── Navbar.jsx
    │   ├── Navbar.module.css
    │   └── ProtectedRoute.jsx
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

