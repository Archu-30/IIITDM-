import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import CircleIcon from '@mui/icons-material/Circle';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ handleDrawerToggle, drawerWidth }) => {
  const { user, logout, notifications, markNotificationsRead } = useAuth();
  const navigate = useNavigate();

  // User Profile Menu State
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const isProfileOpen = Boolean(anchorElProfile);

  // Notifications Menu State
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const isNotifOpen = Boolean(anchorElNotif);

  const handleProfileClick = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  const handleNotifClick = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorElNotif(null);
  };

  const handleMarkAllRead = () => {
    markNotificationsRead();
  };

  const handleNavigateProfile = () => {
    handleProfileClose();
    if (user?.role === 'tenant') {
      navigate('/tenant/profile');
    }
  };

  const handleLogoutClick = () => {
    handleProfileClose();
    logout();
    navigate('/login');
  };

  // Filter notifications based on role
  const roleNotifications = notifications.filter((notif) => {
    if (user?.role === 'tenant') {
      return notif.role === 'tenant' && notif.userId === user?.id;
    }
    return notif.role === user?.role;
  });

  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 650, flexGrow: 1 }}>
          WareFlow <span style={{ fontWeight: 400, fontSize: '0.875rem', color: '#64748B' }}>| Enterprise Rent Hub</span>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications Icon with Badge */}
          <IconButton color="inherit" onClick={handleNotifClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Dropdown */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleProfileClick} size="small" sx={{ ml: 1 }}>
              <Avatar
                src={user?.avatar || ""}
                alt={user?.name || "User"}
                sx={{ width: 36, height: 36, border: '2px solid #E2E8F0' }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorElProfile}
          open={isProfileOpen}
          onClose={handleProfileClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 220,
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              borderRadius: 2,
              border: '1px solid #E2E8F0',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'capitalize' }}>
              Role: {user?.role}
            </Typography>
            {user?.businessName && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                {user.businessName}
              </Typography>
            )}
          </Box>
          <Divider />
          {user?.role === 'tenant' && (
            <MenuItem onClick={handleNavigateProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
          )}
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error.main">Logout</Typography>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={anchorElNotif}
          open={isNotifOpen}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 320,
              maxHeight: 400,
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              borderRadius: 2,
              border: '1px solid #E2E8F0',
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Mark all read
              </Button>
            )}
          </Box>
          <Divider />
          <List sx={{ p: 0, overflowY: 'auto', maxHeight: 280 }}>
            {roleNotifications.length === 0 ? (
              <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications.
                </Typography>
              </ListItem>
            ) : (
              roleNotifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notif.read ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                    borderBottom: '1px solid #F1F5F9',
                    py: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                    {!notif.read && <CircleIcon sx={{ color: 'secondary.main', fontSize: 8 }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={notif.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', my: 0.5, fontSize: '0.8rem' }}>
                          {notif.message}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {notif.time}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{ variant: 'subtitle2', sx: { fontWeight: notif.read ? 500 : 700, fontSize: '0.85rem' } }}
                  />
                </ListItem>
              ))
            )}
          </List>
          <Divider />
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button
              size="small"
              fullWidth
              onClick={() => {
                handleNotifClose();
                if (user?.role === 'tenant') navigate('/tenant/notifications');
                else if (user?.role === 'staff') navigate('/staff/notifications');
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              View all notifications
            </Button>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
