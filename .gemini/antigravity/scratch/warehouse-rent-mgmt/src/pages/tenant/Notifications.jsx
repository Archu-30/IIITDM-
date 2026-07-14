import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import CircleIcon from '@mui/icons-material/Circle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const Notifications = () => {
  const { user, notifications, markNotificationsRead } = useAuth();

  // Filter notifications for this tenant
  const tenantNotifications = notifications.filter(
    (n) => n.role === 'tenant' && n.userId === user?.id
  );

  const handleMarkRead = () => {
    markNotificationsRead();
  };

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of active rent invoices, lease timelines, and support updates.
          </Typography>
        </Box>
        {tenantNotifications.some((n) => !n.read) && (
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkRead}
            size="small"
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recent Alerts
            </Typography>
          </Box>
          <Divider />
          
          <List sx={{ p: 0 }}>
            {tenantNotifications.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body1">
                  You have no notifications.
                </Typography>
              </Box>
            ) : (
              tenantNotifications.map((notif, index) => (
                <React.Fragment key={notif.id}>
                  <ListItem
                    sx={{
                      bgcolor: notif.read ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                      py: 2.5,
                      px: 3,
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.015)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {!notif.read ? (
                        <CircleIcon sx={{ color: 'secondary.main', fontSize: 10 }} />
                      ) : (
                        <CircleIcon sx={{ color: '#E2E8F0', fontSize: 10 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: notif.read ? 600 : 800 }}>
                            {notif.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notif.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {notif.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < tenantNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Notifications;
