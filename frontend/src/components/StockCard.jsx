import React from 'react';
import StatusBadge from './StatusBadge';
import { Eye, ShoppingCart, Image as ImageIcon } from 'lucide-react';

export default function StockCard({ item, onViewDetails, onBuyNow }) {
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const isOutOfStock = item.status === 'out_of_stock';

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 hover:border-primary/30 transition-all duration-300 p-5 flex flex-col group relative overflow-hidden">
      {/* Product Image Section */}
      <div className="w-full aspect-square mb-5 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative group-hover:border-primary/20 transition-colors">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 group-hover:text-primary/40 transition-colors">
            <ImageIcon size={48} strokeWidth={1.5} className="mb-2" />
            <span className="text-xs font-semibold tracking-wide">NO IMAGE</span>
          </div>
        )}
        
        {/* Subtle hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Top Info */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
          {item.category}
        </span>
        <StatusBadge status={item.status} />
      </div>

      {/* Item Details */}
      <div className="mb-4">
        <h4 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
          {item.name}
        </h4>
        <p className="text-xs text-slate-400 mt-1 font-mono">{item.sku}</p>
      </div>

      {/* Additional Details */}
      <div className="border-t border-b border-slate-50 py-3 mb-4 flex flex-col space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-slate-500">Quantity</span>
          <span className="font-bold text-slate-800">{item.quantity} <span className="text-sm font-medium text-slate-500">{item.unit}</span></span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-500">Price</span>
          <span className="font-bold text-primary">{formatPrice(item.price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-500">Warehouse</span>
          <span className="font-medium text-slate-800">{item.warehouseName || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-500">Location</span>
          <span className="font-medium text-slate-800">{item.warehouseLocation || '—'}</span>
        </div>
      </div>

      {/* Action Buttons — equal width split */}
      <div className="flex space-x-2 mt-auto">
        <button
          onClick={() => onViewDetails(item)}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/10 transition-all cursor-pointer"
        >
          <Eye size={14} />
          <span>View Details</span>
        </button>

        <button
          onClick={() => onBuyNow && onBuyNow(item)}
          disabled={isOutOfStock}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 border border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShoppingCart size={14} />
          <span>{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
        </button>
      </div>
    </div>
  );
}
