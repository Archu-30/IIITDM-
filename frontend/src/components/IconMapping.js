import {
  Box,
  Warehouse,
  Package,
  RefreshCw,
  Coins,
  BarChart3,
  FileText,
  Shield,
  Building2,
  Users,
  Bell,
  Wallet,
  FileSignature,
  Fingerprint,
  Settings,
  Eye,
  Edit2,
  Trash2,
  Download,
  Upload,
  FileDown
} from 'lucide-react';

export const KPI_ICONS = {
  inventory: {
    icon: Box,
    color: 'emerald',
    gradient: ['#10b981', '#06b6d4'], // Emerald to Cyan
  },
  warehouse: {
    icon: Warehouse,
    color: 'indigo',
    gradient: ['#6366f1', '#a855f7'], // Indigo to Purple
  },
  orders: {
    icon: Package,
    color: 'amber',
    gradient: ['#f59e0b', '#f97316'], // Amber to Orange
  },
  transactions: {
    icon: RefreshCw,
    color: 'azure',
    gradient: ['#3b82f6', '#06b6d4'], // Blue to Cyan
  },
  revenue: {
    icon: Coins,
    color: 'emerald',
    gradient: ['#10b981', '#34d399'],
  },
  analytics: {
    icon: BarChart3,
    color: 'purple',
    gradient: ['#a855f7', '#ec4899'], // Purple to Pink
  },
  reports: {
    icon: FileText,
    color: 'rose',
    gradient: ['#f43f5e', '#a855f7'], // Rose to Purple
  },
  admins: {
    icon: Shield,
    color: 'crimson',
    gradient: ['#ef4444', '#f43f5e'],
  },
  organizations: {
    icon: Building2,
    color: 'indigo',
    gradient: ['#6366f1', '#3b82f6'],
  },
  customers: {
    icon: Users,
    color: 'cyan',
    gradient: ['#06b6d4', '#3b82f6'],
  },
  notifications: {
    icon: Bell,
    color: 'amber',
    gradient: ['#f59e0b', '#ef4444'],
  },
  payments: {
    icon: Wallet,
    color: 'emerald',
    gradient: ['#10b981', '#3b82f6'],
  },
  lease: {
    icon: FileSignature,
    color: 'indigo',
    gradient: ['#8b5cf6', '#3b82f6'],
  },
  audit: {
    icon: Fingerprint,
    color: 'purple',
    gradient: ['#a855f7', '#8b5cf6'],
  },
  configuration: {
    icon: Settings,
    color: 'slate',
    gradient: ['#64748b', '#94a3b8'],
  },
};

export const ACTION_ICONS = {
  view: { icon: Eye, gradient: ['#3b82f6', '#60a5fa'] },
  edit: { icon: Edit2, gradient: ['#f59e0b', '#fbbf24'] },
  delete: { icon: Trash2, gradient: ['#ef4444', '#f87171'] },
  download: { icon: Download, gradient: ['#10b981', '#34d399'] },
  upload: { icon: Upload, gradient: ['#6366f1', '#818cf8'] },
  export: { icon: FileDown, gradient: ['#a855f7', '#c084fc'] },
};
