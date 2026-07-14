# Implementation Plan - Warehouse Rent Management System

We will build a complete, responsive, frontend-only Warehouse Rent Management System using React, Vite, Material UI (MUI), React Router DOM, and Recharts (for analytics). The application will include three distinct portals corresponding to user roles (Tenant, Admin, Staff) with a shared Authentication Context containing mock login/OTP flows.

## Tech Stack & Libraries
- **Build Tool**: Vite (React + Javascript template)
- **Routing**: `react-router-dom` (v6)
- **UI Framework**: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- **Charts**: `recharts` (for flexible, responsive graphs)
- **State Management & Auth**: React Context API + Local Storage for mock persistence

## User Roles
1. **Customer/Tenant**: Can view dashboard, rents, make mock payments, see lease details, create support tickets, view notifications, and update profile.
2. **Admin**: Can view global dashboard, manage warehouses, manage tenants, review payments, manage leases, assign support tickets, view performance reports, and customize settings.
3. **Staff/Support Agent**: Can view assigned support tickets, update ticket status, upload resolution files, view read-only customer records, and see support-related notifications.

---

## Proposed Changes

We will initialize the Vite app in `C:\Users\UREKHA KASI\.gemini\antigravity\scratch\warehouse-rent-mgmt` and build out the following folder structure:

```
src/
├── assets/
├── components/
│   ├── common/
│   │   ├── Breadcrumb.jsx
│   │   ├── NotificationToast.jsx
│   │   └── StatusBadge.jsx
│   ├── dashboard/
│   │   ├── StatCard.jsx
│   │   └── ActivityTable.jsx
│   ├── tables/
│   │   └── CustomTable.jsx
│   ├── forms/
│   │   ├── TicketForm.jsx
│   │   ├── PaymentForm.jsx
│   │   ├── WarehouseForm.jsx
│   │   └── TenantForm.jsx
│   ├── charts/
│   │   ├── LineTrendChart.jsx
│   │   ├── BarReportChart.jsx
│   │   └── PieReportChart.jsx
│   └── notifications/
│       └── NotificationList.jsx
├── layouts/
│   ├── AdminLayout.jsx
│   ├── TenantLayout.jsx
│   ├── StaffLayout.jsx
│   └── DashboardHeader.jsx
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── OTPVerification.jsx
│   ├── tenant/
│   │   ├── TenantDashboard.jsx
│   │   ├── RentOverview.jsx
│   │   ├── Payments.jsx
│   │   ├── LeaseDetails.jsx
│   │   ├── SupportTickets.jsx
│   │   ├── Notifications.jsx
│   │   └── TenantProfile.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── WarehouseManagement.jsx
│   │   ├── TenantManagement.jsx
│   │   ├── PaymentManagement.jsx
│   │   ├── LeaseManagement.jsx
│   │   ├── TicketMonitoring.jsx
│   │   ├── Reports.jsx
│   │   └── SystemSettings.jsx
│   └── staff/
│       ├── StaffDashboard.jsx
│       ├── AssignedTickets.jsx
│       ├── CustomerRecords.jsx
│       └── StaffNotifications.jsx
├── routes/
│   └── AppRoutes.jsx
├── context/
│   └── AuthContext.jsx
├── data/
│   └── mockData.js
├── theme.js
├── App.jsx
└── main.jsx
```

### 1. Project Initialization & Dependencies
- Check Vite creation options using `npx create-vite@latest --help`.
- Create the Vite project in `scratch/warehouse-rent-mgmt`.
- Install dependencies: `react-router-dom`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `recharts`, `canvas-confetti` (for premium pay confirmations), and setup styling config.

### 2. Core Config & Data Layer
- **`src/theme.js`**: Create a custom theme with Primary color `#1E3A8A` and Secondary color `#2563EB`. Set custom typography (using Inter/Roboto font-families) and component overrides.
- **`src/data/mockData.js`**: Mock records for warehouses, tenants, payments, leases, support tickets, notifications, system settings, and activity logs.
- **`src/context/AuthContext.jsx`**: Store authentication status (`user`, `isAuthenticated`), and handle functions: `login`, `logout`, `verifyOtp`, `sendForgotPassword`.

### 3. Layouts
- **`AdminLayout.jsx`**, **`TenantLayout.jsx`**, **`StaffLayout.jsx`**: Implement responsive sidebar drawers and app bars using Material UI. Include role-based sidebars with links to all pages. Highlight active route, add dynamic menu collapse, user avatar with quick actions, and light/dark theme toggle support.

### 4. Authentication Pages
- **`Login.jsx`**: Username, Password, Role selector (Tenant, Admin, Staff for easy demonstration), and Remember Me toggle.
- **`OTPVerification.jsx`**: A premium 6-digit OTP input with timer, auto-focus, and resend.
- **`ForgotPassword.jsx`**: Email input with status alert messaging.

### 5. Tenant Pages
- **`TenantDashboard.jsx`**: Active metrics, payment line chart, recent action table.
- **`RentOverview.jsx`**: Tabulated summary of rents (Paid, Pending, Overdue) with custom filter status.
- **`Payments.jsx`**: Form for uploading receipts and selecting payment methods. Responsive table showing history of records.
- **`LeaseDetails.jsx`**: View warehouse properties, lease timing, and a download agreement template trigger.
- **`SupportTickets.jsx`**: File-upload-capable ticket creator, with real-time feedback status list.
- **`Notifications.jsx`**: Chronological display of rent alerts and tickets.
- **`TenantProfile.jsx`**: Edit details, view and manage document uploads.

### 6. Admin Pages
- **`AdminDashboard.jsx`**: Summary metrics, detailed visual graphics (revenue bar chart, occupancy pie chart, tickets status), and alert logs.
- **`WarehouseManagement.jsx`**: Table of units with Add/Edit dialog forms (Number, Size, Block, Floor, Status).
- **`TenantManagement.jsx`**: List of tenants with detailed Add/Edit configuration modals.
- **`PaymentManagement.jsx`**: Unified list of payments with global searching, filtering, and export capabilities.
- **`LeaseManagement.jsx`**: Interactive rows for lease records with Renew/Terminate/View functions.
- **`TicketMonitoring.jsx`**: Ticket assignments panel. Admin can change staff assignee, priority level, or status.
- **`Reports.jsx`**: Deep-dive analytics, download reports mock UI (PDF / Excel).
- **`SystemSettings.jsx`**: Fine-tune dues date rules, late fee variables, template messaging, and SLA targets.

### 7. Staff Pages
- **`StaffDashboard.jsx`**: Assigned tickets overview, priority warnings, SLA visual.
- **`AssignedTickets.jsx`**: Quick actions to modify ticket stage, append internal logs, and download/upload resolution files.
- **`CustomerRecords.jsx`**: Read-only tabs displaying information on Tenants, Leases, Payments, and Warehouses.
- **`StaffNotifications.jsx`**: Notifications specific to assignments and warnings.

---

## Verification Plan

### Automated/Build Verification
- Run `npm run build` locally in the workspace to verify there are no compilation or syntax errors.

### Manual Verification
- Launch local development server `npm run dev`.
- Verify responsive layout on mobile sizes, tablet sizes, and standard screens.
- Test routing: Navigate through login/OTP steps, verify role redirects, and walk through all sidebar items.
- Perform core user flows:
  - **Tenant**: Submit a support ticket, upload receipt.
  - **Admin**: Create a warehouse, assign staff to ticket, change settings.
  - **Staff**: Update ticket status, view customer detail.
