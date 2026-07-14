import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map of URL chunks to readable titles
  const breadcrumbNameMap = {
    admin: 'Admin Portal',
    tenant: 'Tenant Portal',
    staff: 'Staff Portal',
    dashboard: 'Dashboard',
    warehouses: 'Warehouse Management',
    tenants: 'Tenant Management',
    payments: 'Payments & Billings',
    leases: 'Lease Agreements',
    tickets: 'Support Tickets',
    reports: 'Analytics & Reports',
    settings: 'System Settings',
    profile: 'My Profile',
    'rent-overview': 'Rent Overview',
    'assigned-tickets': 'Assigned Tickets',
    'customer-records': 'Customer Records',
  };

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        component={RouterLink}
        underline="hover"
        color="inherit"
        to="/"
        sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return last ? (
          <Typography color="text.primary" key={to} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {name}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={to}
            key={to}
            sx={{ fontSize: '0.875rem' }}
          >
            {name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
