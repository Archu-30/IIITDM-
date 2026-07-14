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

const WarehouseManagement = () => {
  const { warehouses, addWarehouse, updateWarehouse } = useAuth();

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWhId, setSelectedWhId] = useState(null);

  // Form Fields State
  const [number, setNumber] = useState('');
  const [size, setSize] = useState('');
  const [block, setBlock] = useState('Block A');
  const [floor, setFloor] = useState('Ground Floor');
  const [rent, setRent] = useState('');
  const [status, setStatus] = useState('Available');
  const [formError, setFormError] = useState('');

  // Toast notifications State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedWhId(null);
    setNumber('');
    setSize('');
    setBlock('Block A');
    setFloor('Ground Floor');
    setRent('');
    setStatus('Available');
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (wh) => {
    setEditMode(true);
    setSelectedWhId(wh.id);
    setNumber(wh.number);
    setSize(wh.size);
    setBlock(wh.block);
    setFloor(wh.floor);
    setRent(wh.rent.toString());
    setStatus(wh.status);
    setFormError('');
    setOpenModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!number || !size || !rent) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (isNaN(rent) || parseFloat(rent) <= 0) {
      setFormError('Please enter a valid positive rent amount.');
      return;
    }

    const payload = {
      number,
      size,
      block,
      floor,
      rent: parseFloat(rent),
      status
    };

    if (editMode) {
      updateWarehouse(selectedWhId, payload);
      setToastMessage(`Warehouse ${number} updated successfully!`);
    } else {
      addWarehouse(payload);
      setToastMessage(`Warehouse ${number} created successfully!`);
    }

    setOpenModal(false);
    setToastOpen(true);
  };

  const headers = [
    { id: 'number', label: 'Warehouse Number' },
    { id: 'size', label: 'Size (sq ft)' },
    { id: 'block', label: 'Block' },
    { id: 'floor', label: 'Floor Level' },
    { id: 'rent', label: 'Monthly Rent', render: (row) => `$${row.rent.toLocaleString()}` },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Warehouse Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your physical assets, record floor mappings, and set lease prices.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 600 }}
        >
          Add Warehouse
        </Button>
      </Box>

      {/* Warehouses Table */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Warehouse Fleet Registry
          </Typography>
          <CustomTable
            headers={headers}
            data={warehouses}
            emptyMessage="No warehouses recorded in the system."
            defaultRowsPerPage={5}
          />
        </CardContent>
      </Card>

      {/* Add / Edit Dialog Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editMode ? `Edit Warehouse - ${number}` : 'Add New Warehouse'}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Warehouse Number"
                  required
                  placeholder="e.g. WH-104"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  disabled={editMode} // lock number on edit
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dimensions (e.g. 15,000 sq ft)"
                  required
                  placeholder="e.g. 12,500 sq ft"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="block-select-label">Block Section</InputLabel>
                  <Select
                    labelId="block-select-label"
                    value={block}
                    label="Block Section"
                    onChange={(e) => setBlock(e.target.value)}
                  >
                    <MenuItem value="Block A">Block A</MenuItem>
                    <MenuItem value="Block B">Block B</MenuItem>
                    <MenuItem value="Block C">Block C</MenuItem>
                    <MenuItem value="Block D">Block D</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="floor-select-label">Floor Location</InputLabel>
                  <Select
                    labelId="floor-select-label"
                    value={floor}
                    label="Floor Location"
                    onChange={(e) => setFloor(e.target.value)}
                  >
                    <MenuItem value="Ground Floor">Ground Floor</MenuItem>
                    <MenuItem value="1st Floor">1st Floor</MenuItem>
                    <MenuItem value="2nd Floor">2nd Floor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monthly Rent Charge ($)"
                  required
                  placeholder="e.g. 3500"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="status-select-label">Unit Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={status}
                    label="Unit Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Booked">Booked</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
              {editMode ? 'Save Changes' : 'Register Unit'}
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

export default WarehouseManagement;
