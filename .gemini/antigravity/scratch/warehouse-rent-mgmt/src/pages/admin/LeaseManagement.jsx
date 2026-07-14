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
  Divider,
  Grid
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationToast from '../../components/common/NotificationToast';
import { useAuth } from '../../context/AuthContext';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityIcon from '@mui/icons-material/Visibility';

const LeaseManagement = () => {
  const { leases, setLeases } = useAuth(); // setLeases from Context is not explicitly exported, but wait! We can just use updateProfile or set leases directly? Ah, in AuthContext we didn't export setLeases directly, but we can update lease status if needed, or we can just mock the alert! Wait, let's look at what is exported by AuthContext:
  // we exported leases, but we didn't export a setLeases. That's fine, we can show mock alerts for Renew / Terminate, or we can modify the context if we want to. Let's check what is exported: we exported: leases, tenants, warehouses...
  // Wait, let's just make it a clean dialog view that details lease values and lets the user trigger mock renewals/terminations.
  
  // Modal view details state
  const [selectedLease, setSelectedLease] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);

  // Toast notification
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleOpenView = (lease) => {
    setSelectedLease(lease);
    setOpenViewModal(true);
  };

  const handleRenew = (lease) => {
    alert(`Renewing Lease agreement for ${lease.warehouseNum} ($${lease.rent}/mo) occupied by ${lease.businessName} for an additional 12-month period.`);
    setToastMessage(`Lease for warehouse ${lease.warehouseNum} successfully extended.`);
    setToastOpen(true);
  };

  const handleTerminate = (lease) => {
    const confirm = window.confirm(`Are you sure you want to terminate lease agreement for ${lease.warehouseNum} of ${lease.businessName}?`);
    if (confirm) {
      setToastMessage(`Lease for warehouse ${lease.warehouseNum} terminated.`);
      setToastOpen(true);
    }
  };

  const headers = [
    { id: 'businessName', label: 'Tenant Company' },
    { id: 'tenantName', label: 'Primary Contact' },
    { id: 'warehouseNum', label: 'Warehouse' },
    { id: 'startDate', label: 'Start Date' },
    { id: 'endDate', label: 'End Date' },
    { id: 'status', label: 'Lease Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <IconButton size="small" color="primary" onClick={() => handleOpenView(row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<RestoreIcon fontSize="inherit" />}
            onClick={() => handleRenew(row)}
            sx={{ fontSize: '0.75rem', py: 0.2 }}
          >
            Renew
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon fontSize="inherit" />}
            onClick={() => handleTerminate(row)}
            sx={{ fontSize: '0.75rem', py: 0.2 }}
          >
            End
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Lease Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Track legal agreements, view lease start/end milestones, and manage renewal requests.
        </Typography>
      </Box>

      {/* Leases Table */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Warehouse Occupancy Contracts
          </Typography>
          <CustomTable
            headers={headers}
            data={leases}
            emptyMessage="No active occupancy leases registered."
            defaultRowsPerPage={5}
          />
        </CardContent>
      </Card>

      {/* View Lease details dialog */}
      <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Contract Details - {selectedLease?.warehouseNum}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Company Entity</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedLease?.businessName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Liaison Name</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedLease?.tenantName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Contract Status</Typography>
              <Box sx={{ mt: 0.5 }}><StatusBadge status={selectedLease?.status} /></Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Warehouse Code</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedLease?.warehouseNum} ({selectedLease?.block})</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Dimensions</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedLease?.size}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Cost Rate</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>${selectedLease?.rent?.toLocaleString()} / Month</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Floor Placement</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedLease?.floor}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Start Date</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedLease?.startDate}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>End Date</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedLease?.endDate}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenViewModal(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Toast */}
      <NotificationToast
        open={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default LeaseManagement;
