import React from 'react';
import StatusBadge from './StatusBadge';
import { PremiumIcon } from './PremiumIcon';
import { Edit, RefreshCw, Trash2 } from 'lucide-react';

export default function StockTable({ 
  items, 
  selectedIds, 
  onToggleSelect, 
  onToggleSelectAll, 
  onEdit, 
  onRestock, 
  onDelete 
}) {
  
  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-left">
        <thead className="bg-slate-50/70">
          <tr>
            <th scope="col" className="w-12 px-6 py-4">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 transition cursor-pointer"
              />
            </th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Details</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <tr 
                key={item.id}
                className={`hover:bg-blue-50/30 transition-colors duration-150 ${isSelected ? 'bg-blue-50/10' : ''}`}
              >
                {/* Checkbox */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 transition cursor-pointer"
                  />
                </td>

                {/* Name + SKU */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{item.name}</span>
                    <span className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                </td>

                {/* Quantity */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {item.quantity}
                  </span>
                </td>

                {/* Unit */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-500">
                    {item.unit}
                  </span>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {formatPrice(item.price)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => onRestock(item)}
                      title="Restock Item"
                      className="transition cursor-pointer border-0 p-0 bg-transparent"
                    >
                      <PremiumIcon icon={RefreshCw} size="small" gradient={['#3b82f6', '#0ea5e9']} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      title="Edit Item"
                      className="transition cursor-pointer border-0 p-0 bg-transparent"
                    >
                      <PremiumIcon icon={Edit} size="small" gradient={['#f59e0b', '#f97316']} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Delete Item"
                      className="transition cursor-pointer border-0 p-0 bg-transparent"
                    >
                      <PremiumIcon icon={Trash2} size="small" gradient={['#ef4444', '#f43f5e']} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan="8" className="px-6 py-12 text-center text-slate-500 text-sm">
                No inventory items found matching the filter criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
