# Walkthrough - Warehouse Rent Management System

We have successfully created a COMPLETE, responsive, frontend-only Warehouse Rent Management System named **WareFlow** inside `C:\Users\UREKHA KASI\.gemini\antigravity\scratch\warehouse-rent-mgmt`.

---

## 🛠️ Tech Stack & Architecture Built

1. **Vite + React (React 18)**: Configured using a clean folder structure.
2. **React Router DOM (v6)**: Implemented complete routes, redirects, and role-based guards in [AppRoutes.jsx](file:///C:/Users/UREKHA%20KASI/.gemini/antigravity/scratch/warehouse-rent-mgmt/src/routes/AppRoutes.jsx).
3. **Material UI (MUI)**: Styled widgets, drawers, cards, badges, menus, appbars, dialogs, and textfields.
4. **Context API**: Managed globally synchronized state in [AuthContext.jsx](file:///C:/Users/UREKHA%20KASI/.gemini/antigravity/scratch/warehouse-rent-mgmt/src/context/AuthContext.jsx).
5. **Recharts**: Integrated responsive charts for analytics (bar charts, line graphs, donut charts).
6. **Data Layer**: Standard mock dataset for warehouses, tenants, leases, payments, notifications, and settings in [mockData.js](file:///C:/Users/UREKHA%20KASI/.gemini/antigravity/scratch/warehouse-rent-mgmt/src/data/mockData.js).

---

## 🔑 Demo Access Credentials

The login page includes quick-click shortcuts to auto-fill these roles:

| Role | Username | Password | OTP Code (Second Step) | Home Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Tenant** | `tenant` | `password123` | `123456` | `/tenant/dashboard` |
| **Admin** | `admin` | `password123` | `123456` | `/admin/dashboard` |
| **Staff / Support** | `staff` | `password123` | `123456` | `/staff/dashboard` |

---

## 📂 Codebase Folder Structure Created

```
src/
├── data/
│   └── mockData.js               # In-memory mock database state
├── context/
│   └── AuthContext.jsx           # Global state manager & mutations
├── theme.js                      # Custom MUI colors (#1E3A8A / #2563EB) & shape overrides
├── components/
│   ├── common/
│   │   ├── Breadcrumb.jsx        # Navigation breadcrumbs
│   │   ├── StatusBadge.jsx       # Universal color chip for statuses
│   │   └── NotificationToast.jsx # Snackbar alert confirmations
│   ├── dashboard/
│   │   └── StatCard.jsx          # Reusable statistic display
│   ├── tables/
│   │   └── CustomTable.jsx       # Reusable paginated custom tables
│   └── charts/
│       ├── LineTrendChart.jsx    # Recharts Line chart component
│       ├── BarReportChart.jsx    # Recharts Bar chart component
│       └── PieReportChart.jsx    # Recharts Pie donut chart component
├── layouts/
│   ├── DashboardHeader.jsx       # Shared Topbar with Profile menu & notifications
│   ├── TenantLayout.jsx          # Tenant sidebar wrapper
│   ├── AdminLayout.jsx           # Admin sidebar wrapper
│   └── StaffLayout.jsx           # Staff sidebar wrapper
├── pages/
│   ├── auth/
│   │   ├── Login.jsx             # Role select login form
│   │   ├── ForgotPassword.jsx    # Simulation reset mail
│   │   └── OTPVerification.jsx   # 6-digit OTP code form
│   ├── tenant/                   # Tenant dashboard, payments, ticket, lease forms
│   ├── admin/                    # Admin assets, billing ledger, SLA settings dashboards
│   └── staff/                    # Support ticket resolution audits & customer records
├── routes/
│   └── AppRoutes.jsx             # Guarded router matching
```

---

## ⚙️ Compilation & Build Validation

A complete production bundle build was executed successfully in the workspace:
- **Build Tool**: Vite
- **Compilation Output**:
  - `dist/index.html` (0.78 kB)
  - `dist/assets/index.css` (0.48 kB)
  - `dist/assets/index.js` (1083.75 kB)
- **Status**: ✓ successfully built without errors.

---

## 🚀 How to Run the Project Locally

To run the system in your local web browser:

1. Open your terminal in the project directory:
   ```bash
   cd "C:\Users\UREKHA KASI\.gemini\antigravity\scratch\warehouse-rent-mgmt"
   ```
2. Start the local Vite development server:
   ```bash
   npm run dev
   ```
3. Open the displayed URL (e.g., `http://localhost:5173`) in your web browser.
