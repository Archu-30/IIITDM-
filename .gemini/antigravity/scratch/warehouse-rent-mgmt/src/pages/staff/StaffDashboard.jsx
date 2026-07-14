import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Button } from '@mui/material';
import StatCard from '../../components/dashboard/StatCard';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AlarmIcon from '@mui/icons-material/Alarm';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, tickets } = useAuth();
  const navigate = useNavigate();

  // Filter assigned tickets
  const assignedTickets = tickets.filter((t) => t.assignedStaff === user?.name);

  // Stats
  const totalAssigned = assignedTickets.length;
  const resolvedCount = assignedTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
  const pendingCount = assignedTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const slaAlerts = assignedTickets.filter((t) => t.priority === 'High' && t.status !== 'Resolved').length;

  const headers = [
    { id: 'id', label: 'Ticket ID' },
    { id: 'businessName', label: 'Tenant Company' },
    { id: 'title', label: 'Subject' },
    { id: 'priority', label: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Staff Support Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your daily tasks, assigned technical complaints, and lease compliance requests.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/staff/assigned-tickets')}
        >
          View Ticket Queue
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned Tickets"
            value={totalAssigned}
            icon={<ConfirmationNumberIcon />}
            color="#1E3A8A"
            subtitle="Total assigned to you"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved Cases"
            value={resolvedCount}
            icon={<TaskAltIcon />}
            color="#10B981"
            subtitle="Completed operations"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Pending"
            value={pendingCount}
            icon={<HourglassEmptyIcon />}
            color="#F59E0B"
            subtitle="In progress or open"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="SLA Risk Alerts"
            value={slaAlerts}
            icon={<AlarmIcon />}
            color="#EF4444"
            subtitle="High priority un-resolved"
          />
        </Grid>
      </Grid>

      {/* Quick Queue */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            My Active Priority Assignments
          </Typography>
          <CustomTable
            headers={headers}
            data={assignedTickets.slice(0, 5)}
            emptyMessage="Great work! You have no pending tickets assigned."
            defaultRowsPerPage={5}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default StaffDashboard;
