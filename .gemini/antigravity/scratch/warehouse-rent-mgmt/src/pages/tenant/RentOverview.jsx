import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';

const RentOverview = () => {
  const { user, payments } = useAuth();
  const [tabValue, setTabValue] = useState('all');
  const [search, setSearch] = useState('');

  // Filter payments for this tenant
  const tenantPayments = payments.filter((p) => p.tenantId === user?.id);

  // Compute aggregates
  const paidTotal = tenantPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingTotal = tenantPayments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueTotal = tenantPayments
    .filter((p) => p.status === 'Overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredData = tenantPayments.filter((p) => {
    const matchesSearch = p.month.toLowerCase().includes(search.toLowerCase()) || 
                          (p.refNum && p.refNum.toLowerCase().includes(search.toLowerCase()));
    
    if (tabValue === 'all') return matchesSearch;
    return p.status.toLowerCase() === tabValue && matchesSearch;
  });

  const headers = [
    { id: 'month', label: 'Month/Billing Period' },
    { id: 'amount', label: 'Amount Due', render: (row) => `$${row.amount.toLocaleString()}` },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'payDate', label: 'Payment Date', render: (row) => row.payDate || '-' },
    { id: 'method', label: 'Method', render: (row) => row.method || '-' },
    { id: 'refNum', label: 'Transaction Reference', render: (row) => row.refNum || '-' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Rent Overview</Typography>
        <Typography variant="body2" color="text.secondary">
          Track invoice history, payment records, and outstanding dues.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '5px solid #10B981', bgcolor: '#F0FDF4' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Paid</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#10B981' }}>
                ${paidTotal.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '5px solid #F59E0B', bgcolor: '#FEF3C7' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#D97706' }}>
                ${pendingTotal.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '5px solid #EF4444', bgcolor: '#FEF2F2' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Overdue</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#EF4444' }}>
                ${overdueTotal.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
              <Tab label="All Invoices" value="all" sx={{ fontWeight: 600 }} />
              <Tab label="Paid" value="paid" sx={{ fontWeight: 650 }} />
              <Tab label="Pending" value="pending" sx={{ fontWeight: 650 }} />
              <Tab label="Overdue" value="overdue" sx={{ fontWeight: 650 }} />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search month or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 250 } }}
            />
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>
            <CustomTable
              headers={headers}
              data={filteredData}
              emptyMessage="No matching invoices found."
              defaultRowsPerPage={5}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RentOverview;
