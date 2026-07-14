import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationToast from '../../components/common/NotificationToast';
import { useAuth } from '../../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const PaymentManagement = () => {
  const { payments, approvePayment } = useAuth();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Toast alert state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleApprove = (payId, tenantName) => {
    approvePayment(payId);
    setToastMessage(`Rent payment from ${tenantName} has been approved successfully.`);
    setToastOpen(true);
  };

  const handleExport = (format) => {
    alert(`Exporting Payment Records as ${format} ...`);
  };

  // Filtered Payments Data
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch = pay.tenantName.toLowerCase().includes(search.toLowerCase()) ||
                          pay.businessName.toLowerCase().includes(search.toLowerCase()) ||
                          (pay.refNum && pay.refNum.toLowerCase().includes(search.toLowerCase())) ||
                          pay.month.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || pay.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const headers = [
    { id: 'businessName', label: 'Company / Business' },
    { id: 'tenantName', label: 'Liaison Name' },
    { id: 'month', label: 'Period' },
    { id: 'amount', label: 'Amount Due', render: (row) => `$${row.amount.toLocaleString()}` },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'payDate', label: 'Date Submitted', render: (row) => row.payDate || '-' },
    { id: 'refNum', label: 'Transaction Ref', render: (row) => row.refNum || '-' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {row.status !== 'Paid' ? (
            <Tooltip title="Mark as Paid (Approve)">
              <IconButton size="small" color="success" onClick={() => handleApprove(row.id, row.tenantName)}>
                <CheckCircleOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 650, pr: 1 }}>Approved</Typography>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Payment Registry</Typography>
          <Typography variant="body2" color="text.secondary">
            Approve submitted bank transactions, review overdue notifications, and export accounts ledger.
          </Typography>
        </Box>
        
        {/* Export Buttons */}
        <ButtonGroup variant="outlined" color="secondary" size="small" sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          <Button startIcon={<FileDownloadIcon />} onClick={() => handleExport('Excel')}>Excel</Button>
          <Button startIcon={<FileDownloadIcon />} onClick={() => handleExport('PDF')}>PDF</Button>
        </ButtonGroup>
      </Box>

      {/* Filters and List */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', gap: 2.5, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              sx={{ flexGrow: 1 }}
              size="small"
              placeholder="Search by company, tenant, month or reference number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="status-filter-label">Filter Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Filter Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Transactions</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <CustomTable
            headers={headers}
            data={filteredPayments}
            emptyMessage="No billing or payment records found."
            defaultRowsPerPage={10}
          />
        </CardContent>
      </Card>

      {/* Toast Alert */}
      <NotificationToast
        open={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default PaymentManagement;
