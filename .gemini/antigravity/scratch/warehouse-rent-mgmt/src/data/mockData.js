// Mock Database for Warehouse Rent Management System

export const MOCK_USERS = [
  {
    id: "user-1",
    username: "tenant",
    password: "password123", // in mock app, plain text is fine
    email: "tenant@acme.com",
    role: "tenant",
    name: "John Doe",
    businessName: "Acme Logistics Corp",
    phone: "+1 (555) 019-2834",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    documents: [
      { id: "doc-1", name: "Business_Registration_Certificate.pdf", date: "2025-01-15", size: "2.4 MB" },
      { id: "doc-2", name: "Lease_Agreement_Signed.pdf", date: "2025-01-18", size: "4.1 MB" }
    ]
  },
  {
    id: "user-2",
    username: "admin",
    password: "password123",
    email: "admin@wareflow.com",
    role: "admin",
    name: "Sarah Jenkins",
    phone: "+1 (555) 014-9988",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "user-3",
    username: "staff",
    password: "password123",
    email: "agent.smith@wareflow.com",
    role: "staff",
    name: "Agent Smith",
    phone: "+1 (555) 017-7722",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"
  }
];

export const MOCK_WAREHOUSES = [
  { id: "wh-101", number: "WH-101", size: "15,000 sq ft", block: "Block A", floor: "Ground Floor", status: "Booked", rent: 4500, tenantId: "user-1" },
  { id: "wh-102", number: "WH-102", size: "10,000 sq ft", block: "Block A", floor: "Ground Floor", status: "Available", rent: 3000 },
  { id: "wh-103", number: "WH-103", size: "20,000 sq ft", block: "Block B", floor: "Ground Floor", status: "Booked", rent: 6000, tenantId: "user-1" },
  { id: "wh-201", number: "WH-201", size: "12,000 sq ft", block: "Block C", floor: "1st Floor", status: "Maintenance", rent: 3500 },
  { id: "wh-202", number: "WH-202", size: "8,000 sq ft", block: "Block C", floor: "1st Floor", status: "Available", rent: 2500 },
  { id: "wh-301", number: "WH-301", size: "18,000 sq ft", block: "Block D", floor: "Ground Floor", status: "Booked", rent: 5500, tenantId: "tenant-2" }
];

export const MOCK_TENANTS = [
  { id: "user-1", name: "John Doe", businessName: "Acme Logistics Corp", email: "tenant@acme.com", warehouse: "WH-101, WH-103", leasePeriod: "12 Months", status: "Active" },
  { id: "tenant-2", name: "Alice Vance", businessName: "Apex Global Trade", email: "alice@apex.com", warehouse: "WH-301", leasePeriod: "24 Months", status: "Active" },
  { id: "tenant-3", name: "Robert Chen", businessName: "Zenith Distributing", email: "robert@zenith.com", warehouse: "None", leasePeriod: "Expired", status: "Inactive" }
];

export const MOCK_PAYMENTS = [
  { id: "pay-001", tenantId: "user-1", tenantName: "John Doe", businessName: "Acme Logistics Corp", month: "June 2026", amount: 4500, dueDate: "2026-06-05", payDate: "2026-06-04", method: "Bank Transfer", refNum: "TXN9823102", receipt: "receipt_june.pdf", status: "Paid" },
  { id: "pay-002", tenantId: "user-1", tenantName: "John Doe", businessName: "Acme Logistics Corp", month: "June 2026", amount: 6000, dueDate: "2026-06-05", payDate: null, method: null, refNum: null, receipt: null, status: "Overdue" },
  { id: "pay-003", tenantId: "tenant-2", tenantName: "Alice Vance", businessName: "Apex Global Trade", month: "June 2026", amount: 5500, dueDate: "2026-06-05", payDate: "2026-06-05", method: "Credit Card", refNum: "TXN1122334", receipt: "receipt_301_june.pdf", status: "Paid" },
  { id: "pay-004", tenantId: "user-1", tenantName: "John Doe", businessName: "Acme Logistics Corp", month: "July 2026", amount: 10500, dueDate: "2026-07-05", payDate: null, method: null, refNum: null, receipt: null, status: "Pending" }
];

export const MOCK_LEASES = [
  { id: "lease-101", tenantName: "John Doe", businessName: "Acme Logistics Corp", tenantId: "user-1", warehouseNum: "WH-101", block: "Block A", floor: "Ground Floor", size: "15,000 sq ft", rent: 4500, startDate: "2025-01-20", endDate: "2026-01-20", status: "Active" },
  { id: "lease-103", tenantName: "John Doe", businessName: "Acme Logistics Corp", tenantId: "user-1", warehouseNum: "WH-103", block: "Block B", floor: "Ground Floor", size: "20,000 sq ft", rent: 6000, startDate: "2025-03-01", endDate: "2026-03-01", status: "Active" },
  { id: "lease-301", tenantName: "Alice Vance", businessName: "Apex Global Trade", tenantId: "tenant-2", warehouseNum: "WH-301", block: "Block D", floor: "Ground Floor", size: "18,000 sq ft", rent: 5500, startDate: "2024-06-01", endDate: "2026-06-01", status: "Active" }
];

export const MOCK_TICKETS = [
  {
    id: "tkt-1001",
    tenantId: "user-1",
    tenantName: "John Doe",
    businessName: "Acme Logistics Corp",
    category: "Maintenance",
    title: "Leaking ceiling in WH-101",
    description: "Water is dripping from the northeast corner ceiling. It could damage the packed boxes. Please resolve ASAP.",
    attachment: "ceiling_leak_photo.jpg",
    priority: "High",
    status: "In Progress",
    assignedStaff: "Agent Smith",
    createdAt: "2026-06-15",
    updatedAt: "2026-06-18",
    internalNotes: [
      { author: "Agent Smith", text: "Inspected block A ceiling. Plumber scheduled for June 20.", date: "2026-06-18" }
    ],
    resolutionFiles: []
  },
  {
    id: "tkt-1002",
    tenantId: "user-1",
    tenantName: "John Doe",
    businessName: "Acme Logistics Corp",
    category: "Billing",
    title: "Request for invoice revision",
    description: "The upcoming payment for WH-103 doesn't reflect the discounted rate negotiated last week.",
    attachment: null,
    priority: "Medium",
    status: "Open",
    assignedStaff: "Unassigned",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
    internalNotes: [],
    resolutionFiles: []
  },
  {
    id: "tkt-1003",
    tenantId: "tenant-2",
    tenantName: "Alice Vance",
    businessName: "Apex Global Trade",
    category: "Security",
    title: "Lost badge access for WH-301",
    description: "One of our forklift drivers lost their access badge. Need a replacement card and to deactivate the old one.",
    attachment: null,
    priority: "Low",
    status: "Resolved",
    assignedStaff: "Agent Smith",
    createdAt: "2026-06-10",
    updatedAt: "2026-06-12",
    internalNotes: [
      { author: "Agent Smith", text: "Old card deactivated. New keycard hand-delivered.", date: "2026-06-12" }
    ],
    resolutionFiles: ["badge_receipt_signed.pdf"]
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: "notif-1", role: "tenant", userId: "user-1", type: "Rent Reminder", title: "Rent Overdue", message: "Your rent payment of $6,000 for WH-103 is overdue since June 5.", time: "1 day ago", read: false },
  { id: "notif-2", role: "tenant", userId: "user-1", type: "Ticket Update", title: "Ticket #tkt-1001 Updated", message: "Plumber scheduled for ceiling leak resolution on June 20.", time: "2 hours ago", read: false },
  { id: "notif-3", role: "admin", type: "Payment Notification", title: "New Receipt Uploaded", message: "John Doe uploaded a payment receipt for WH-101.", time: "3 hours ago", read: false },
  { id: "notif-4", role: "admin", type: "Ticket Alert", title: "New Support Ticket", message: "Acme Logistics Corp created a billing support ticket (#tkt-1002).", time: "1 day ago", read: true },
  { id: "notif-5", role: "staff", type: "Ticket Assignment", title: "Ticket Assigned", message: "Leaking ceiling in WH-101 has been assigned to you.", time: "4 days ago", read: true },
  { id: "notif-6", role: "staff", type: "SLA Alert", title: "SLA SLA Breach Warning", message: "Ticket #tkt-1002 has been open for 24 hours without response.", time: "1 hour ago", read: false }
];

export const MOCK_SETTINGS = {
  rentDueDate: "5th of every month",
  lateFeePercentage: 5,
  gracePeriodDays: 3,
  notificationTemplateInvoice: "Dear [Tenant], your invoice for [Month] is ready. Amount: $[Amount]. Due by [DueDate].",
  slaTicketsHours: {
    High: 4,
    Medium: 12,
    Low: 24
  }
};
