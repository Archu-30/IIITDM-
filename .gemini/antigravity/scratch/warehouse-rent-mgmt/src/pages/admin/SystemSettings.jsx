import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import NotificationToast from '../../components/common/NotificationToast';
import SaveIcon from '@mui/icons-material/Save';

const SystemSettings = () => {
  const { settings, updateSettings } = useAuth();

  // Form Fields State
  const [rentDueDate, setRentDueDate] = useState(settings?.rentDueDate || '5th of every month');
  const [lateFeePercentage, setLateFeePercentage] = useState(settings?.lateFeePercentage || 5);
  const [gracePeriodDays, setGracePeriodDays] = useState(settings?.gracePeriodDays || 3);
  const [invoiceTemplate, setInvoiceTemplate] = useState(settings?.notificationTemplateInvoice || '');
  const [slaHigh, setSlaHigh] = useState(settings?.slaTicketsHours?.High || 4);
  const [slaMedium, setSlaMedium] = useState(settings?.slaTicketsHours?.Medium || 12);
  const [slaLow, setSlaLow] = useState(settings?.slaTicketsHours?.Low || 24);

  const [formError, setFormError] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (isNaN(lateFeePercentage) || isNaN(gracePeriodDays) || isNaN(slaHigh) || isNaN(slaMedium) || isNaN(slaLow)) {
      setFormError('Numerical inputs must be valid digits.');
      return;
    }

    updateSettings({
      rentDueDate,
      lateFeePercentage: parseFloat(lateFeePercentage),
      gracePeriodDays: parseInt(gracePeriodDays, 10),
      notificationTemplateInvoice: invoiceTemplate,
      slaTicketsHours: {
        High: parseInt(slaHigh, 10),
        Medium: parseInt(slaMedium, 10),
        Low: parseInt(slaLow, 10)
      }
    });

    setToastMessage('System configurations and SLA rules updated successfully.');
    setToastOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>System Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure financial rules, invoice payment grace terms, automated notifications, and ticket SLAs.
        </Typography>
      </Box>

      {formError && <Alert severity="error" sx={{ mb: 3 }}>{formError}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Rent & Late Fee Logic
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rent Due Schedule"
                  value={rentDueDate}
                  onChange={(e) => setRentDueDate(e.target.value)}
                  placeholder="e.g. 5th of every month"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Late Fee Percentage (%)"
                  type="number"
                  value={lateFeePercentage}
                  onChange={(e) => setLateFeePercentage(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Grace Period Duration (Days)"
                  type="number"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Support SLA Thresholds (Hours)
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="High Priority Target (hrs)"
                  type="number"
                  value={slaHigh}
                  onChange={(e) => setSlaHigh(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Medium Priority Target (hrs)"
                  type="number"
                  value={slaMedium}
                  onChange={(e) => setSlaMedium(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Low Priority Target (hrs)"
                  type="number"
                  value={slaLow}
                  onChange={(e) => setSlaLow(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Notification Dispatch Templates
            </Typography>
            <TextField
              fullWidth
              label="Invoice Dispatch Email Text Template"
              multiline
              rows={4}
              value={invoiceTemplate}
              onChange={(e) => setInvoiceTemplate(e.target.value)}
              placeholder="e.g. Dear [Tenant], your invoice is ready..."
              required
            />
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SaveIcon />}
            sx={{ px: 4, py: 1.2, fontWeight: 600 }}
          >
            Apply Configurations
          </Button>
        </Box>
      </form>

      {/* Success Toast */}
      <NotificationToast
        open={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default SystemSettings;
