import React from 'react';

export default function StatusBadge({ status }) {
  let bgClass = '';
  let textClass = '';
  let label = '';

  switch (status) {
    case 'available':
      bgClass = 'bg-green-100 text-green-800 border-green-200';
      textClass = 'text-green-600';
      label = 'Available';
      break;
    case 'low_stock':
      bgClass = 'bg-amber-100 text-amber-800 border-amber-200';
      textClass = 'text-amber-600';
      label = 'Low Stock';
      break;
    case 'out_of_stock':
      bgClass = 'bg-red-100 text-red-800 border-red-200';
      textClass = 'text-red-600';
      label = 'Out of Stock';
      break;
    default:
      bgClass = 'bg-gray-100 text-gray-800 border-gray-200';
      textClass = 'text-gray-600';
      label = status || 'Unknown';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgClass}`}>
      {label}
    </span>
  );
}
