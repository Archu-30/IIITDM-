import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const StatCard = ({ title, value, icon, color = '#1E3A8A', trend, subtitle }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative accent bar */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: color }} />
      
      <CardContent sx={{ pt: 3, pb: '16px !important', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 44, height: 44 }}>
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 750, color: 'text.primary', mb: 1 }}>
          {value}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: trend.isPositive ? 'success.main' : 'error.main', fontWeight: 600, mr: 0.5 }}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {trend.label || 'since last month'}
            </Typography>
          </Box>
        )}

        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
