import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  ButtonGroup,
  Divider
} from '@mui/material';
import BarReportChart from '../../components/charts/BarReportChart';
import PieReportChart from '../../components/charts/PieReportChart';
import LineTrendChart from '../../components/charts/LineTrendChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Reports = () => {
  // Mock detailed reporting metrics
  const monthlyRevenueData = [
    { name: 'Jan 2026', value: 12000 },
    { name: 'Feb 2026', value: 14500 },
    { name: 'Mar 2026', value: 13000 },
    { name: 'Apr 2026', value: 16000 },
    { name: 'May 2026', value: 15500 },
    { name: 'Jun 2026', value: 18500 }
  ];

  const occupancyRateData = [
    { name: 'Occupied', value: 80 },
    { name: 'Vacant', value: 15 },
    { name: 'Maintenance', value: 5 }
  ];

  const outstandingDuesData = [
    { name: 'Acme Logistics', amount: 6000 },
    { name: 'Apex Global', amount: 0 },
    { name: 'Zenith Distributing', amount: 2500 }
  ];

  const ticketPerformanceData = [
    { name: 'Maintenance', amount: 4 }, // Category counts
    { name: 'Billing', amount: 2 },
    { name: 'Security', amount: 1 },
    { name: 'Operations', amount: 3 }
  ];

  const handleExport = (format) => {
    alert(`Exporting Analytical Reports as ${format} ...`);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Analytics & Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            Deep-dive operational charts, financial statements, and support performance audits.
          </Typography>
        </Box>
        <ButtonGroup variant="contained" color="secondary" sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          <Button startIcon={<FileDownloadIcon />} onClick={() => handleExport('Excel')}>Export Excel</Button>
          <Button startIcon={<FileDownloadIcon />} onClick={() => handleExport('PDF')}>Export PDF</Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Monthly Revenue Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 700 }}>
                Monthly Rent Revenue Collected
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <BarReportChart data={monthlyRevenueData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Occupancy Rate Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 700 }}>
                Occupancy Ratio (%)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <PieReportChart data={occupancyRateData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Outstanding Dues Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 700 }}>
                Outstanding Dues by Tenant
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <LineTrendChart data={outstandingDuesData} xKey="name" dataKey="amount" strokeColor="#EF4444" />
            </CardContent>
          </Card>
        </Grid>

        {/* Ticket Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 700 }}>
                Ticket Count by Category
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <BarReportChart data={ticketPerformanceData} xKey="name" dataKey="amount" barColor="#2563EB" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
