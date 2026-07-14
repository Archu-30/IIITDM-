import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid,
  Button,
  Chip
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationToast from '../../components/common/NotificationToast';
import { useAuth } from '../../context/AuthContext';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EditNoteIcon from '@mui/icons-material/EditNote';

const TicketMonitoring = () => {
  const { tickets, updateTicket } = useAuth();

  // Dialog State
  const [openModal, setOpenModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form Fields State
  const [assignedStaff, setAssignedStaff] = useState('Agent Smith');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Medium');

  // Toast notification
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleOpenEdit = (ticket) => {
    setSelectedTicket(ticket);
    setAssignedStaff(ticket.assignedStaff || 'Unassigned');
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setOpenModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedTicket) {
      updateTicket(selectedTicket.id, {
        assignedStaff,
        status,
        priority
      });
      setToastMessage(`Ticket #${selectedTicket.id} updated successfully!`);
      setToastOpen(true);
      setOpenModal(false);
    }
  };

  const headers = [
    { id: 'id', label: 'Ticket ID' },
    { id: 'businessName', label: 'Tenant Company' },
    { id: 'category', label: 'Category' },
    { id: 'title', label: 'Subject' },
    { id: 'priority', label: 'Priority', render: (row) => (
      <Chip
        label={row.priority}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.7rem',
          bgcolor: row.priority === 'High' ? '#EF4444' : row.priority === 'Medium' ? '#2563EB' : '#10B981',
          color: '#FFFFFF'
        }}
      />
    )},
    { id: 'assignedStaff', label: 'Assigned Staff', render: (row) => (
      <Chip
        label={row.assignedStaff || 'Unassigned'}
        size="small"
        variant="outlined"
        color={row.assignedStaff === 'Unassigned' ? 'error' : 'default'}
        sx={{ fontWeight: 600 }}
      />
    )},
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
          <AssignmentIndIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Support Ticket Monitoring</Typography>
        <Typography variant="body2" color="text.secondary">
          Review tenant support requests, assign support personnel, and update resolution states.
        </Typography>
      </Box>

      {/* Tickets List */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Tenant Support Queue
          </Typography>
          <CustomTable
            headers={headers}
            data={tickets}
            emptyMessage="No tickets in queue."
            defaultRowsPerPage={10}
          />
        </CardContent>
      </Card>

      {/* Edit Assignment Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Manage Ticket Assignment - #{selectedTicket?.id}
        </DialogTitle>
        <Divider />
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Subject</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>{selectedTicket?.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                {selectedTicket?.description}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="assign-staff-label">Assign Staff</InputLabel>
                  <Select
                    labelId="assign-staff-label"
                    value={assignedStaff}
                    label="Assign Staff"
                    onChange={(e) => setAssignedStaff(e.target.value)}
                  >
                    <MenuItem value="Unassigned">Unassigned</MenuItem>
                    <MenuItem value="Agent Smith">Agent Smith (Support)</MenuItem>
                    <MenuItem value="Staff member 1">Sarah Jenkins (Admin)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="ticket-priority-label">Set Priority</InputLabel>
                  <Select
                    labelId="ticket-priority-label"
                    value={priority}
                    label="Set Priority"
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="ticket-status-label">Update Status</InputLabel>
                  <Select
                    labelId="ticket-status-label"
                    value={status}
                    label="Update Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
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
              Update Assignment
            </Button>
          </DialogActions>
        </form>
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

export default TicketMonitoring;
