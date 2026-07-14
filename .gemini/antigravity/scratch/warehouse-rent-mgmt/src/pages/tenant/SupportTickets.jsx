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
  FormControl,
  InputLabel,
  Select,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip
} from '@mui/material';
import CustomTable from '../../components/tables/CustomTable';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationToast from '../../components/common/NotificationToast';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const SupportTickets = () => {
  const { user, tickets, addTicket } = useAuth();

  // Create Modal State
  const [openModal, setOpenModal] = useState(false);

  // Form States
  const [category, setCategory] = useState('Maintenance');
  const [priority, setPriority] = useState('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [formError, setFormError] = useState('');

  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter tickets for this tenant
  const tenantTickets = tickets.filter((t) => t.tenantId === user?.id);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description) {
      setFormError('Please enter a title and description.');
      return;
    }

    addTicket({
      category,
      priority,
      title,
      description,
      attachment: attachment ? attachment.name : null
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setAttachment(null);
    setOpenModal(false);

    // Toast Alert
    setToastMessage('Support ticket created successfully!');
    setToastOpen(true);
  };

  const headers = [
    { id: 'id', label: 'Ticket ID' },
    { id: 'title', label: 'Subject / Title' },
    { id: 'category', label: 'Category' },
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
    { id: 'createdAt', label: 'Created Date' },
    { id: 'assignedStaff', label: 'Assigned Agent' },
    { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Support Tickets</Typography>
          <Typography variant="body2" color="text.secondary">
            Request repairs, submit utility queries, or log security incidents.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ fontWeight: 600 }}
        >
          Create Support Ticket
        </Button>
      </Box>

      {/* Tickets Table */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            My Active & Past Cases
          </Typography>
          <CustomTable
            headers={headers}
            data={tenantTickets}
            emptyMessage="No logged support tickets found."
            defaultRowsPerPage={10}
          />
        </CardContent>
      </Card>

      {/* Create Ticket Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Support Ticket</DialogTitle>
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
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Billing">Billing</MenuItem>
                    <MenuItem value="Security">Security</MenuItem>
                    <MenuItem value="Operations">Operations</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    value={priority}
                    label="Priority"
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject / Title"
                  required
                  placeholder="e.g. Broken roll-up shutter lock"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Issue Description"
                  required
                  multiline
                  rows={4}
                  placeholder="Describe the problem in detail so our support staff can diagnose it efficiently..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <InputLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>Optional Photo/File Attachment</InputLabel>
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
                  {attachment ? attachment.name : "Select Image or PDF Document"}
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
              Submit Ticket
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

export default SupportTickets;
