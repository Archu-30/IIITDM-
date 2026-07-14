import React from 'react';
import { Chip } from '@mui/material';

const getStatusColor = (status) => {
  const normalized = status?.toLowerCase() || '';
  switch (normalized) {
    // Payment / Warehouse status
    case 'paid':
    case 'available':
    case 'active':
    case 'resolved':
      return { bg: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6' };
    
    case 'pending':
    case 'booked':
    case 'in progress':
      return { bg: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' };
      
    case 'overdue':
    case 'maintenance':
    case 'closed':
    case 'expired':
    case 'high':
      return { bg: '#FCE8E6', color: '#C5221F', border: '1px solid #FAD2CF' };
      
    case 'open':
    case 'medium':
      return { bg: '#E8F0FE', color: '#1A73E8', border: '1px solid #D2E3FC' };
      
    case 'low':
    case 'inactive':
    default:
      return { bg: '#F1F3F4', color: '#5F6368', border: '1px solid #DADCE0' };
  }
};

const StatusBadge = ({ status }) => {
  const { bg, color, border } = getStatusColor(status);
  return (
    <Chip
      label={status}
      size="small"
      style={{
        backgroundColor: bg,
        color: color,
        border: border,
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  );
};

export default StatusBadge;
