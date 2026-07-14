import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const { sendForgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ success: false, message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });

    if (!email) {
      setStatus({ success: false, message: 'Please enter your email.' });
      return;
    }

    const res = sendForgotPassword(email);
    setStatus({ success: res.success, message: res.message });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F8FAFC',
        px: 2,
        py: 4
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', boxShadow: '0 4px 20px rgb(0 0 0 / 0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Back Button */}
          <IconButton onClick={() => navigate('/login')} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>

          {/* Logo / Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                borderRadius: '50%',
                p: 1.5,
                mb: 1.5,
                display: 'inline-flex'
              }}
            >
              <EmailIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
              Enter your email address and we'll send you an OTP to reset your password.
            </Typography>
          </Box>

          {status.message && (
            <Alert severity={status.success ? 'success' : 'error'} sx={{ mb: 3 }}>
              {status.message}
            </Alert>
          )}

          {!status.success ? (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                type="email"
                placeholder="tenant@acme.com or admin@wareflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ py: 1.2, fontWeight: 600, mt: 2 }}
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ py: 1.2, fontWeight: 600, mt: 2 }}
            >
              Back to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
