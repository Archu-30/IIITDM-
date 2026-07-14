import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationToast from '../../components/common/NotificationToast';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const TenantManagement = () => {
  const { tenants, addTenant, updateTenant, warehouses } = useAuth();

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [warehouse, setWarehouse] = useState('WH-102');
  const [leasePeriod, setLeasePeriod] = useState('12 Months');
  const [status, setStatus] = useState('Active');
  const [formError, setFormError] = useState('');

  // Toast notifications State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter out available warehouses for assignment in selection dropdown
  const availableWarehouses = warehouses.filter((w) => w.status === 'Available' || w.status === 'Booked');

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedTenantId(null);
    setName('');
    setBusinessName('');
    setEmail('');
    setWarehouse(availableWarehouses[0]?.number || 'None');
    setLeasePeriod('12 Months');
    setStatus('Active');
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (tenant) => {
    setEditMode(true);
    setSelectedTenantId(tenant.id);
    setName(tenant.name);
    setBusinessName(tenant.businessName);
    setEmail(tenant.email);
    setWarehouse(tenant.warehouse);
    setLeasePeriod(tenant.leasePeriod);
    setStatus(tenant.status);
    setFormError('');
    setOpenModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !businessName || !email) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      businessName,
      email,
      warehouse,
      leasePeriod,
      status
    };

    if (editMode) {
      updateTenant(selectedTenantId, payload);
      setToastMessage(`Tenant ${businessName} updated successfully!`);
    } else {
      addTenant(payload);
      setToastMessage(`Tenant ${businessName} onboarded successfully!`);
    }

    setOpenModal(false);
    setToastOpen(true);
  };

  const headers = [
    { id: 'businessName', label: 'Company / Business' },
    { id: 'name', label: 'Contact Liaison' },
    { id: 'email', label: 'Contact Email' },
    { id: 'warehouse', label: 'Assigned Unit' },
    { id: 'leasePeriod', label: 'Lease Period' },
    { id: 'status', label: 'Account Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <IconButton size="small" color="secondary" onClick={() => handleOpenEdit(row)}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Tenant Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Onboard new corporate tenants, assign warehouse allotments, and set leasing lengths.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          Onboard Tenant
        </Button>
      </Box>

      {/* Tenants Table */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Active Corporate Tenant Directories
          </Typography>
          <CustomTable
            headers={headers}
            data={tenants}
            emptyMessage="No tenants onboarded in the system."
            defaultRowsPerPage={5}
          />
        </CardContent>
      </Card>

      {/* Onboard / Edit Tenant Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editMode ? `Edit Tenant - ${businessName}` : 'Onboard New Corporate Tenant'}
        </DialogTitle>
        <Divider />
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ p: 3 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Corporate Entity Business Name"
                  required
                  placeholder="e.g. Acme Logistics Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Liaison Name"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Liaison Email"
                  required
                  type="email"
                  placeholder="e.g. john@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="warehouse-select-label">Assign Warehouse</InputLabel>
                  <Select
                    labelId="warehouse-select-label"
                    value={warehouse}
                    label="Assign Warehouse"
                    onChange={(e) => setWarehouse(e.target.value)}
                  >
                    <MenuItem value="None">None</MenuItem>
                    {availableWarehouses.map((wh) => (
                      <MenuItem key={wh.id} value={wh.number}>
                        {wh.number} ({wh.block})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="lease-select-label">Lease Duration</InputLabel>
                  <Select
                    labelId="lease-select-label"
                    value={leasePeriod}
                    label="Lease Duration"
                    onChange={(e) => setLeasePeriod(e.target.value)}
                  >
                    <MenuItem value="6 Months">6 Months</MenuItem>
                    <MenuItem value="12 Months">12 Months</MenuItem>
                    <MenuItem value="24 Months">24 Months</MenuItem>
                    <MenuItem value="36 Months">36 Months</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="status-select-label">Account Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      value={status}
                      label="Account Status"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
              {editMode ? 'Save Changes' : 'Onboard Tenant'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Toast Alert */}
      <NotificationToast
        open={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default TenantManagement;
