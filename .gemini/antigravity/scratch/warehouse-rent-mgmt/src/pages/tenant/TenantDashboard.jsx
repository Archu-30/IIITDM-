import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Button } from '@mui/material';
import StatCard from '../../components/dashboard/StatCard';
import LineTrendChart from '../../components/charts/LineTrendChart';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const TenantDashboard = () => {
  const { user, payments, leases, tickets } = useAuth();
  const navigate = useNavigate();

  // Filter items for current user
  const tenantPayments = payments.filter((p) => p.tenantId === user?.id);
  const tenantLeases = leases.filter((l) => l.tenantId === user?.id);
  const tenantTickets = tickets.filter((t) => t.tenantId === user?.id);

  // Compute stats
  const outstanding = tenantPayments
    .filter((p) => p.status === 'Overdue' || p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const rentStatus = tenantPayments.some((p) => p.status === 'Overdue')
    ? 'Overdue'
    : tenantPayments.some((p) => p.status === 'Pending')
    ? 'Pending'
    : 'Paid';

  const upcomingDue = tenantPayments
    .filter((p) => p.status === 'Pending' || p.status === 'Overdue')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]?.dueDate || 'No upcoming dues';

  const activeLeaseCount = tenantLeases.filter((l) => l.status === 'Active').length;

  // Payments Trend data (mock payments are monthly)
  const chartData = tenantPayments
    .filter((p) => p.status === 'Paid')
    .map((p) => ({ name: p.month, amount: p.amount }))
    .reverse(); // chronological order

  // Table Headers
  const recentHeaders = [
    { id: 'month', label: 'Billing Period' },
    { id: 'amount', label: 'Amount', render: (row) => `$${row.amount.toLocaleString()}` },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Welcome Back, {user?.name}!</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your leased warehouses, payments, and open support cases here.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/tenant/payments')}
        >
          Pay Rent
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rent Status"
            value={rentStatus}
            icon={<WarningAmberIcon />}
            color={rentStatus === 'Overdue' ? '#EF4444' : rentStatus === 'Pending' ? '#F59E0B' : '#10B981'}
            subtitle={rentStatus === 'Overdue' ? 'Immediate payment required' : rentStatus === 'Pending' ? 'Due soon' : 'All clear'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding Dues"
            value={`$${outstanding.toLocaleString()}`}
            icon={<AccountBalanceWalletIcon />}
            color="#EF4444"
            subtitle="Accumulated pending rents"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Next Due Date"
            value={upcomingDue}
            icon={<CalendarMonthIcon />}
            color="#2563EB"
            subtitle="Upcoming billing deadline"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Leases"
            value={`${activeLeaseCount} Warehouse(s)`}
            icon={<CorporateFareIcon />}
            color="#1E3A8A"
            subtitle={`${tenantLeases.map(l => l.warehouseNum).join(', ') || 'No units'}`}
          />
        </Grid>
      </Grid>

      {/* Chart & Tables */}
      <Grid container spacing={3}>
        {/* Payment Trend Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Rent Payment Trend
              </Typography>
              {chartData.length > 0 ? (
                <LineTrendChart data={chartData} />
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No paid transaction history to plot.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Rent Activity */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Recent Invoices
                </Typography>
                <Button size="small" onClick={() => navigate('/tenant/rent-overview')}>
                  View All
                </Button>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <CustomTable
                  headers={recentHeaders}
                  data={tenantPayments.slice(0, 3)}
                  emptyMessage="No invoice records available."
                  defaultRowsPerPage={3}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantDashboard;
