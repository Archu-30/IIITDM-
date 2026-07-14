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
  Select,
  InputLabel,
  Grid,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationToast from '../../components/common/NotificationToast';
import { useAuth } from '../../context/AuthContext';
import HandymanIcon from '@mui/icons-material/Handyman';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AssignedTickets = () => {
  const { user, tickets, updateTicket } = useAuth();

  // Dialog state
  const [openModal, setOpenModal] = useState(false);
  const [selectedTkt, setSelectedTkt] = useState(null);

  // Form states
  const [status, setStatus] = useState('In Progress');
  const [noteText, setNoteText] = useState('');
  const [resFile, setResFile] = useState(null);

  // Toast notifications State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter assigned tickets for current support user
  const assignedTickets = tickets.filter((t) => t.assignedStaff === user?.name);

  const handleOpenAction = (tkt) => {
    setSelectedTkt(tkt);
    setStatus(tkt.status);
    setNoteText('');
    setResFile(null);
    setOpenModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedTkt) {
      // Compile internal notes
      let updatedNotes = [...(selectedTkt.internalNotes || [])];
      if (noteText) {
        updatedNotes.push({
          author: user?.name,
          text: noteText,
          date: new Date().toISOString().split('T')[0]
        });
      }

      // Compile resolution files
      let updatedFiles = [...(selectedTkt.resolutionFiles || [])];
      if (resFile) {
        updatedFiles.push(resFile.name);
      }

      updateTicket(selectedTkt.id, {
        status,
        internalNotes: updatedNotes,
        resolutionFiles: updatedFiles
      });

      setToastMessage(`Ticket #${selectedTkt.id} details successfully updated.`);
      setToastOpen(true);
      setOpenModal(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResFile(e.target.files[0]);
    }
  };

  const headers = [
    { id: 'id', label: 'Ticket ID' },
    { id: 'businessName', label: 'Tenant Company' },
    { id: 'category', label: 'Category' },
    { id: 'title', label: 'Subject' },
    { id: 'priority', label: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    { id: 'createdAt', label: 'Created' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<HandymanIcon />}
          onClick={() => handleOpenAction(row)}
          sx={{ fontSize: '0.75rem', py: 0.5 }}
        >
          Resolve
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Assigned Tickets</Typography>
        <Typography variant="body2" color="text.secondary">
          Track issues assigned to you, log internal audit remarks, and upload proof of work.
        </Typography>
      </Box>

      {/* Table grid */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            My Active Service Orders
          </Typography>
          <CustomTable
            headers={headers}
            data={assignedTickets}
            emptyMessage="No tickets assigned to you at this time."
            defaultRowsPerPage={5}
          />
        </CardContent>
      </Card>

      {/* Action modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Manage Ticket - #{selectedTkt?.id}
        </DialogTitle>
        <Divider />
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ p: 3 }}>
            {/* Ticket Info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 650 }}>
                Category: {selectedTkt?.category} | Priority: {selectedTkt?.priority}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 750, mt: 0.5, mb: 1 }}>{selectedTkt?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTkt?.description}
              </Typography>
            </Box>

            {/* List Notes */}
            {selectedTkt?.internalNotes && selectedTkt.internalNotes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 650, mb: 1 }}>Audit Log Notes</Typography>
                <List sx={{ p: 0 }}>
                  {selectedTkt.internalNotes.map((note, idx) => (
                    <ListItem key={idx} sx={{ p: 1, bgcolor: '#FFFBEB', mb: 1, borderRadius: 1 }}>
                      <ListItemText
                        primary={note.text}
                        secondary={`Logged by ${note.author} on ${note.date}`}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Grid container spacing={2}>
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Add Internal Audit Note"
                  placeholder="e.g. Parts ordered. Work scheduled for Tuesday."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <InputLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>Upload Proof of Work (Resolution file)</InputLabel>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    py: 1.5,
                    borderStyle: 'dashed',
                    borderWidth: 1.5,
                    borderColor: '#CBD5E1',
                    bgcolor: '#F8FAFC',
                    textTransform: 'none',
                    width: '100%'
                  }}
                >
                  {resFile ? resFile.name : "Select Document or Photo"}
                  <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
              Save Ticket Info
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

export default AssignedTickets;
