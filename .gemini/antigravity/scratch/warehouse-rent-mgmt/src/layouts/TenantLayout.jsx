import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableViewIcon from '@mui/icons-material/TableView';
import PaymentIcon from '@mui/icons-material/Payment';
import DescriptionIcon from '@mui/icons-material/Description';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import Breadcrumb from '../components/common/Breadcrumb';

const drawerWidth = 260;

const TenantLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', path: '/tenant/dashboard', icon: <DashboardIcon /> },
    { text: 'Rent Overview', path: '/tenant/rent-overview', icon: <TableViewIcon /> },
    { text: 'Payments', path: '/tenant/payments', icon: <PaymentIcon /> },
    { text: 'Lease Details', path: '/tenant/lease', icon: <DescriptionIcon /> },
    { text: 'Support Tickets', path: '/tenant/tickets', icon: <SupportAgentIcon /> },
    { text: 'Notifications', path: '/tenant/notifications', icon: <NotificationsActiveIcon /> },
    { text: 'Profile', path: '/tenant/profile', icon: <AccountBoxIcon /> },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ bgcolor: 'primary.main', color: '#FFFFFF', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CorporateFareIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>
            WAREFLOW
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 650, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Tenant Hub
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'secondary.main' : 'transparent',
                  color: active ? '#FFFFFF' : 'text.primary',
                  '&:hover': {
                    bgcolor: active ? 'secondary.dark' : 'rgba(37, 99, 235, 0.08)',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon sx={{ color: active ? '#FFFFFF' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <CssBaseline />
      
      {/* Header component */}
      <DashboardHeader handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />

      {/* Responsive Sidebar Drawers */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #E2E8F0',
              boxShadow: '2px 0 8px 0 rgb(0 0 0 / 0.02)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Spaces content below Appbar */}
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        {/* Dynamic Nested Routes Render */}
        <Box sx={{ flexGrow: 1, mt: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default TenantLayout;
