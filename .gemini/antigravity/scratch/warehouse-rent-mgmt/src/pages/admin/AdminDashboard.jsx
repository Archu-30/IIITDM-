import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Button } from '@mui/material';
import StatCard from '../../components/dashboard/StatCard';
import BarReportChart from '../../components/charts/BarReportChart';
import PieReportChart from '../../components/charts/PieReportChart';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import SupportIcon from '@mui/icons-material/Support';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { warehouses, payments, tickets } = useAuth();
  const navigate = useNavigate();

  // Stats calculation
  const totalWarehouses = warehouses.length;
  const occupiedCount = warehouses.filter((w) => w.status === 'Booked').length;
  const vacantCount = warehouses.filter((w) => w.status === 'Available').length;
  const maintenanceCount = warehouses.filter((w) => w.status === 'Maintenance').length;

  const totalRevenue = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'Pending' || p.status === 'Overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  // Pie Chart Occupancy Data
  const occupancyData = [
    { name: 'Occupied (Booked)', value: occupiedCount },
    { name: 'Vacant (Available)', value: vacantCount },
    { name: 'Maintenance', value: maintenanceCount }
  ];

  // Revenue chart data grouped by month
  const monthlyRevenueData = [
    { name: 'Jan 2026', value: 12000 },
    { name: 'Feb 2026', value: 14500 },
    { name: 'Mar 2026', value: 13000 },
    { name: 'Apr 2026', value: 16000 },
    { name: 'May 2026', value: 15500 },
    { name: 'Jun 2026', value: totalRevenue > 0 ? totalRevenue : 10000 }
  ];

  // Table Headers
  const payHeaders = [
    { id: 'businessName', label: 'Tenant Company' },
    { id: 'month', label: 'Billing Period' },
    { id: 'amount', label: 'Amount', render: (row) => `$${row.amount.toLocaleString()}` },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const ticketHeaders = [
    { id: 'id', label: 'Ticket ID' },
    { id: 'businessName', label: 'Company' },
    { id: 'category', label: 'Category' },
    { id: 'priority', label: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Global warehouse logistics metrics, revenue summaries, and ticket resolution logs.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/admin/reports')}
        >
          View Full Reports
        </Button>
      </Box>

      {/* Statistics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Units"
            value={totalWarehouses}
            icon={<CorporateFareIcon />}
            color="#1E3A8A"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Occupied"
            value={occupiedCount}
            icon={<CheckCircleIcon />}
            color="#10B981"
            subtitle={`${((occupiedCount / totalWarehouses) * 100).toFixed(0)}% Occupancy`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Vacant"
            value={vacantCount}
            icon={<WarningIcon />}
            color="#F59E0B"
            subtitle={`${((vacantCount / totalWarehouses) * 100).toFixed(0)}% Available`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Revenue Collected"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<MonetizationOnIcon />}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Pending Dues"
            value={`$${pendingAmount.toLocaleString()}`}
            icon={<AssignmentLateIcon />}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Open Tickets"
            value={openTicketsCount}
            icon={<SupportIcon />}
            color="#2563EB"
            subtitle="Require response"
          />
        </Grid>
      </Grid>

      {/* Visual Analytics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Revenue Performance (Monthly)
              </Typography>
              <BarReportChart data={monthlyRevenueData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                Occupancy Breakdown
              </Typography>
              <PieReportChart data={occupancyData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Records Row */}
      <Grid container spacing={3}>
        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Recent Rents Received
                </Typography>
                <Button size="small" onClick={() => navigate('/admin/payments')}>
                  Manage Payments
                </Button>
              </Box>
              <CustomTable
                headers={payHeaders}
                data={payments.slice(0, 4)}
                emptyMessage="No recent payments recorded."
                defaultRowsPerPage={4}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tickets */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Active Support Tickets
                </Typography>
                <Button size="small" onClick={() => navigate('/admin/tickets')}>
                  Monitor Tickets
                </Button>
              </Box>
              <CustomTable
                headers={ticketHeaders}
                data={tickets.slice(0, 4)}
                emptyMessage="No active tickets."
                defaultRowsPerPage={4}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
