import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { toastError } from '../components/Toast';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, MapPin, XCircle, Loader2 } from 'lucide-react';

// Order status steps in lifecycle order
const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Loader2 },
  shipped:    { label: 'Shipped',    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200',    icon: XCircle },
};

function StatusTimeline({ currentStatus }) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center space-x-2 mt-3">
        <XCircle size={14} className="text-red-500" />
        <span className="text-xs font-semibold text-red-500">Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {STATUS_STEPS.map((step, idx) => {
          const cfg = STATUS_CONFIG[step];
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const Icon = cfg.icon;

          return (
            <React.Fragment key={step}>
              {/* Step dot */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? `${cfg.bg} ${cfg.border}`
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <Icon size={13} className={done ? cfg.color : 'text-slate-300'} />
                </div>
                <span className={`text-[10px] font-semibold mt-1 ${done ? cfg.color : 'text-slate-400'}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                  idx < currentIdx ? 'bg-primary' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono font-bold text-primary">{order.order_number}</span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                <Icon size={10} />
                <span>{cfg.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
          </div>
          <div className="text-right">
            <p className="text-base font-extrabold text-slate-800">{formatPrice(order.total_amount)}</p>
            <p className="text-xs text-slate-400">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <StatusTimeline currentStatus={order.status} />
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-5 py-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
      >
        <span>{expanded ? 'Hide Details' : 'Show Details'}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-50">
          {/* Order Items */}
          <div>
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-2">Items Ordered</h5>
            <div className="space-y-2">
              {(order.items || []).map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.item_name}</p>
                    <p className="text-xs text-slate-400 font-mono">{item.item_sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{item.quantity} × {formatPrice(item.unit_price)}</p>
                    <p className="text-sm font-bold text-primary">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <MapPin size={11} />
              <span>Delivery Address</span>
            </h5>
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 text-sm text-slate-700 space-y-0.5">
              <p className="font-semibold">{order.delivery_name}</p>
              <p className="text-slate-500">{order.delivery_phone}</p>
              <p className="text-slate-600">{order.delivery_address}</p>
              <p className="text-slate-600">{order.delivery_city} — {order.delivery_pincode}</p>
              {order.notes && <p className="text-slate-400 italic text-xs mt-1">Note: {order.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-primary" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">My Orders</h1>
          </div>
          <p className="text-sm text-slate-400 ml-12">Track the status of your placed orders</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl py-16 px-6 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Package size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No orders yet</h3>
            <p className="text-sm text-slate-400 mt-1">Browse the inventory and place your first order!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
