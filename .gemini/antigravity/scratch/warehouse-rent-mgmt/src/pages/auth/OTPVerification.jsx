import React, { useState, useEffect, useRef } from 'react';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OTPVerification = () => {
  const { verifyOtp, tempUser } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Redirect if no tempUser in bridge state
    if (!tempUser) {
      navigate('/login');
    }
  }, [tempUser, navigate]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    // Focus last filled or next input
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter a 6-digit code.');
      return;
    }

    const res = verifyOtp(otpCode);
    if (res.success) {
      if (res.role === 'admin') navigate('/admin/dashboard');
      else if (res.role === 'tenant') navigate('/tenant/dashboard');
      else if (res.role === 'staff') navigate('/staff/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setCanResend(false);
    setError('');
    // Alert user code sent
    alert("New OTP code is '123456'.");
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
                bgcolor: 'secondary.main',
                color: '#FFFFFF',
                borderRadius: '50%',
                p: 1.5,
                mb: 1.5,
                display: 'inline-flex'
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Verify OTP
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
              Enter the 6-digit confirmation code we sent to your registered email address.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 4 }} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  inputProps={{
                    style: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', padding: '12px 0' },
                    maxLength: 1,
                  }}
                  sx={{ width: 50 }}
                  variant="outlined"
                />
              ))}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ py: 1.2, fontWeight: 600, mb: 3 }}
            >
              Verify Code
            </Button>
          </form>

          {/* Resend Helper */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?{' '}
              {canResend ? (
                <Button onClick={handleResend} color="secondary" sx={{ fontWeight: 600, p: 0, minWidth: 'auto', textTransform: 'none' }}>
                  Resend Code
                </Button>
              ) : (
                <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Resend in {timer}s
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, bgcolor: '#F1F5F9', p: 1, borderRadius: 1 }}>
              Demo Hint: Use code <strong>123456</strong> to successfully verify.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OTPVerification;
