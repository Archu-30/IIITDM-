import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

const LeaseDetails = () => {
  const { user, leases } = useAuth();

  // Filter leases for current user
  const tenantLeases = leases.filter((l) => l.tenantId === user?.id);

  const handleDownloadAgreement = (leaseNum) => {
    alert(`Downloading Lease Agreement PDF for ${leaseNum}.pdf ...`);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Lease Details</Typography>
        <Typography variant="body2" color="text.secondary">
          Review active property agreements, warehouse spatial configurations, and renewal schedules.
        </Typography>
      </Box>

      {tenantLeases.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          <HomeWorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No Active Leases</Typography>
          <Typography variant="body2" color="text.secondary">You currently do not have any registered leases.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {tenantLeases.map((lease) => (
            <Grid item xs={12} md={6} key={lease.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <HomeWorkIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Warehouse {lease.warehouseNum}
                      </Typography>
                    </Box>
                    <StatusBadge status={lease.status} />
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Details Grid */}
                  <Grid container spacing={2} sx={{ mb: 3.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 650 }}>
                        Block / Section
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {lease.block}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 650 }}>
                        Floor Location
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {lease.floor}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 650 }}>
                        Total Unit Size
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {lease.size}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 650 }}>
                        Monthly Cost (Rent)
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ${lease.rent.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 650 }}>
                        Lease Commenced
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {lease.startDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 650 }}>
                        Lease Terminus
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {lease.endDate}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ mb: 3 }} />

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DescriptionIcon />}
                      fullWidth
                      sx={{ fontWeight: 600 }}
                      onClick={() => handleDownloadAgreement(lease.warehouseNum)}
                    >
                      View Agreement
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleDownloadAgreement(lease.warehouseNum)}
                    >
                      PDF
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default LeaseDetails;
