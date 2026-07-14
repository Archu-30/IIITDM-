import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  FormHelperText,
  Divider,
  Alert
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationToast from '../../components/common/NotificationToast';
import { useAuth } from '../../context/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Payments = () => {
  const { user, payments, addPayment } = useAuth();
  
  // Form States
  const [month, setMonth] = useState('June 2026');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [refNum, setRefNum] = useState('');
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');

  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const tenantPayments = payments.filter((p) => p.tenantId === user?.id);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!refNum) {
      setFormError('Please enter a reference number.');
      return;
    }
    if (!file) {
      setFormError('Please upload your payment receipt.');
      return;
    }

    addPayment({
      month,
      amount: parseFloat(amount),
      method,
      refNum,
      receipt: file.name
    });

    // Reset Form
    setAmount('');
    setRefNum('');
    setFile(null);
    
    // Trigger Success Toast
    setToastMessage('Payment receipt uploaded successfully! It is pending approval.');
    setToastOpen(true);
  };

  const historyHeaders = [
    { id: 'month', label: 'Month' },
    { id: 'amount', label: 'Amount', render: (row) => `$${row.amount.toLocaleString()}` },
    { id: 'payDate', label: 'Date Paid', render: (row) => row.payDate || 'Processing' },
    { id: 'method', label: 'Method', render: (row) => row.method || '-' },
    { id: 'refNum', label: 'Ref #', render: (row) => row.refNum || '-' },
    { id: 'receipt', label: 'Receipt File', render: (row) => row.receipt || '-' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Payments</Typography>
        <Typography variant="body2" color="text.secondary">
          Upload bank receipts, submit new payments, and view historical statements.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Payment Form */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Submit Rent Payment
              </Typography>

              {formError && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                  {formError}
                </Alert>
              )}

              <form onSubmit={handleFormSubmit}>
                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel id="month-select-label">Billing Period</InputLabel>
                  <Select
                    labelId="month-select-label"
                    value={month}
                    label="Billing Period"
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <MenuItem value="June 2026">June 2026</MenuItem>
                    <MenuItem value="July 2026">July 2026</MenuItem>
                    <MenuItem value="August 2026">August 2026</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Payment Amount ($)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  sx={{ mb: 2.5 }}
                  placeholder="e.g. 4500"
                  required
                />

                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel id="method-select-label">Payment Method</InputLabel>
                  <Select
                    labelId="method-select-label"
                    value={method}
                    label="Payment Method"
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="ACH Debit">ACH Debit</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Transaction Reference Number"
                  value={refNum}
                  onChange={(e) => setRefNum(e.target.value)}
                  sx={{ mb: 3 }}
                  placeholder="e.g. TXN10293847"
                  required
                />

                {/* Upload Section */}
                <Box sx={{ mb: 3.5 }}>
                  <InputLabel sx={{ mb: 1, fontWeight: 650, fontSize: '0.875rem' }}>Upload Bank Receipt</InputLabel>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      py: 3,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: file ? 'primary.main' : '#CBD5E1',
                      bgcolor: '#F8FAFC',
                      textTransform: 'none',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    {file ? file.name : "Select Receipt File (PDF, JPG, PNG)"}
                    <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
                  </Button>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{ fontWeight: 600, py: 1.2 }}
                >
                  Submit Payment Details
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* History Table */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Payment History
              </Typography>
              <CustomTable
                headers={historyHeaders}
                data={tenantPayments}
                emptyMessage="No payment records found."
                defaultRowsPerPage={5}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Toast */}
      <NotificationToast
        open={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default Payments;
