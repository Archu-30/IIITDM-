import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  Divider,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('tenant');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const res = login(username, password);
    if (res.success) {
      // Direct to OTP validation
      navigate('/otp-verification');
    } else {
      setError(res.message);
    }
  };

  const handleQuickRole = (role) => {
    setUsername(role);
    setPassword('password123');
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
          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                borderRadius: 2,
                p: 1.5,
                mb: 1.5,
                display: 'inline-flex'
              }}
            >
              <CorporateFareIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.02em', color: 'primary.main' }}>
              WareFlow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Warehouse Rent Management Portal
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. tenant, admin, staff"
              required
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, mb: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                label={<Typography variant="body2">Remember Me</Typography>}
              />
              <Link component={RouterLink} to="/forgot-password" variant="body2" color="secondary" sx={{ fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ py: 1.2, fontWeight: 600, mb: 3 }}
            >
              Log In
            </Button>
          </form>

          {/* Quick Demo Helper */}
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'center', fontWeight: 600 }}>
            QUICK LOGIN DEMO CREDENTIALS (password: password123)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button size="small" variant="outlined" onClick={() => handleQuickRole('tenant')}>Tenant</Button>
            <Button size="small" variant="outlined" onClick={() => handleQuickRole('admin')}>Admin</Button>
            <Button size="small" variant="outlined" onClick={() => handleQuickRole('staff')}>Staff</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
