import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import NotificationToast from '../../components/common/NotificationToast';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EditIcon from '@mui/icons-material/Edit';

const TenantProfile = () => {
  const { user, updateProfile, uploadDocument } = useAuth();

  // Modal Profile State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Toast Alert
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProfile({
      businessName,
      name,
      phone,
      email
    });
    setOpenEditModal(false);
    setToastMessage('Profile details updated successfully!');
    setToastOpen(true);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileUploaded = e.target.files[0];
      const sizeStr = (fileUploaded.size / (1024 * 1024)).toFixed(1) + ' MB';
      uploadDocument(fileUploaded.name, sizeStr);
      setToastMessage('Corporate document uploaded successfully!');
      setToastOpen(true);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>My Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage corporate credentials, key contact details, and compliance records.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={user?.avatar || ""}
                alt={user?.name || "Tenant"}
                sx={{ width: 100, height: 100, mb: 3, border: '4px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />

              <Typography variant="h5" sx={{ fontWeight: 750, mb: 0.5 }}>
                {user?.businessName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Primary Contact: {user?.name}
              </Typography>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={() => setOpenEditModal(true)}
                sx={{ fontWeight: 600, mb: 4 }}
              >
                Edit Corporate Profile
              </Button>

              <Divider sx={{ width: '100%', mb: 3 }} />

              {/* Quick Details */}
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Email Address</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{user?.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Phone Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{user?.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Account ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{user?.id}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Corporate Documents */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Compliance & Verification Documents
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  size="small"
                  startIcon={<CloudUploadIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  Upload File
                  <input type="file" hidden onChange={handleFileUpload} />
                </Button>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              <List sx={{ p: 0 }}>
                {(!user?.documents || user.documents.length === 0) ? (
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC' }}>
                    <Typography color="text.secondary" variant="body2">No files uploaded yet.</Typography>
                  </Paper>
                ) : (
                  user.documents.map((doc, idx) => (
                    <Paper key={doc.id || idx} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                      <ListItem sx={{ py: 1.8 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <InsertDriveFileIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={`Uploaded on: ${doc.date}`}
                          primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {doc.size}
                        </Typography>
                      </ListItem>
                    </Paper>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Corporate Details</DialogTitle>
        <Divider />
        <form onSubmit={handleUpdate}>
          <DialogContent sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Corporate Entity Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              sx={{ mb: 2.5 }}
              required
            />
            <TextField
              fullWidth
              label="Contact Liaison Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2.5 }}
              required
            />
            <TextField
              fullWidth
              label="Liaison Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              required
            />
            <TextField
              fullWidth
              label="Liaison Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenEditModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
              Save Changes
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

export default TenantProfile;
