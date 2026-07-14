import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Paper
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const CustomerRecords = () => {
  const { tenants, warehouses, payments, leases } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Headers for each section
  const tenantHeaders = [
    { id: 'businessName', label: 'Company / Business' },
    { id: 'name', label: 'Primary Contact' },
    { id: 'email', label: 'Email' },
    { id: 'warehouse', label: 'Leased Units' },
    { id: 'leasePeriod', label: 'Lease Length' },
    { id: 'status', label: 'Account Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const warehouseHeaders = [
    { id: 'number', label: 'Unit #' },
    { id: 'size', label: 'Size (sq ft)' },
    { id: 'block', label: 'Block' },
    { id: 'floor', label: 'Floor' },
    { id: 'rent', label: 'Rent Rate', render: (row) => `$${row.rent.toLocaleString()}` },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const paymentHeaders = [
    { id: 'businessName', label: 'Tenant Company' },
    { id: 'month', label: 'Billing Month' },
    { id: 'amount', label: 'Amount', render: (row) => `$${row.amount.toLocaleString()}` },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'payDate', label: 'Payment Date', render: (row) => row.payDate || '-' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const leaseHeaders = [
    { id: 'businessName', label: 'Tenant Company' },
    { id: 'warehouseNum', label: 'Warehouse #' },
    { id: 'size', label: 'Size' },
    { id: 'rent', label: 'Monthly Rent', render: (row) => `$${row.rent.toLocaleString()}` },
    { id: 'startDate', label: 'Start Date' },
    { id: 'endDate', label: 'End Date' },
    { id: 'status', label: 'Lease Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Customer Records</Typography>
        <Typography variant="body2" color="text.secondary">
          Read-only directories of active tenant accounts, leases, warehouse spacing, and payment history.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Tab Navigation */}
          <Box sx={{ px: 3, pt: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
              <Tab label="Tenants" sx={{ fontWeight: 650 }} />
              <Tab label="Warehouses" sx={{ fontWeight: 650 }} />
              <Tab label="Payments" sx={{ fontWeight: 650 }} />
              <Tab label="Lease Contracts" sx={{ fontWeight: 650 }} />
            </Tabs>
          </Box>
          <Divider />

          {/* Tab Contents */}
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <CustomTable
                headers={tenantHeaders}
                data={tenants}
                emptyMessage="No tenants onboarded."
                defaultRowsPerPage={10}
              />
            )}
            {tabValue === 1 && (
              <CustomTable
                headers={warehouseHeaders}
                data={warehouses}
                emptyMessage="No warehouses logged."
                defaultRowsPerPage={10}
              />
            )}
            {tabValue === 2 && (
              <CustomTable
                headers={paymentHeaders}
                data={payments}
                emptyMessage="No payments registered."
                defaultRowsPerPage={10}
              />
            )}
            {tabValue === 3 && (
              <CustomTable
                headers={leaseHeaders}
                data={leases}
                emptyMessage="No contracts found."
                defaultRowsPerPage={10}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerRecords;
