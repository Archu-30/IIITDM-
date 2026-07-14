import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { toastSuccess, toastError } from '../components/Toast';
import { ShoppingBag, Check, X, Truck, Package, Eye, MapPin } from 'lucide-react';

export default function AdminOrders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status, description) => {
    try {
      await api.patch(`/orders/${id}/status`, { status, description });
      toastSuccess(`Order status updated to ${status}`);
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to update order status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <ShoppingBag size={18} className="text-primary" />
              <span>Customer Orders</span>
            </h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Order List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-mono text-xs font-bold text-primary">{order.order_number}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{order.customer_name}</div>
                        <div className="text-xs text-slate-400">{order.customer_email}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{formatPrice(order.total_amount)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          order.status === 'delivered' 
                            ? 'bg-green-50 text-green-600 border border-green-200' 
                            : order.status === 'cancelled'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : order.status === 'dispatched'
                            ? 'bg-purple-50 text-purple-600 border border-purple-200'
                            : order.status === 'packing'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'approved', 'Order has been approved.')}
                              className="px-2 py-1 text-xs font-bold text-green-600 border border-green-200 hover:bg-green-50 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'cancelled', 'Order was rejected/cancelled.')}
                              className="px-2 py-1 text-xs font-bold text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'packing', 'Items are being packed in the warehouse.')}
                            className="px-2 py-1 text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Package size={12} />
                            <span>Pack</span>
                          </button>
                        )}
                        {order.status === 'packing' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'dispatched', 'Order has been dispatched from the warehouse.')}
                            className="px-2 py-1 text-xs font-bold text-purple-600 border border-purple-200 hover:bg-purple-50 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Truck size={12} />
                            <span>Dispatch</span>
                          </button>
                        )}
                        {order.status === 'dispatched' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered', 'Order successfully delivered to customer.')}
                            className="px-2 py-1 text-xs font-bold text-green-600 border border-green-200 hover:bg-green-50 rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Deliver</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No orders registered in the system.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Details Side Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md bg-white flex flex-col h-full shadow-2xl border-l border-slate-100">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</h4>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-700 space-y-1">
                    <p className="font-semibold">{selectedOrder.delivery_name}</p>
                    <p className="text-slate-500">{selectedOrder.delivery_phone}</p>
                    <p className="text-slate-600">{selectedOrder.delivery_address}</p>
                    <p className="text-slate-600">{selectedOrder.delivery_city} — {selectedOrder.delivery_pincode}</p>
                    {selectedOrder.notes && <p className="text-xs text-slate-400 italic mt-2">Note: {selectedOrder.notes}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Line Items</h4>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map(it => (
                      <div key={it.id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{it.item_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{it.item_sku} · {it.quantity} {it.unit || 'pcs'}</p>
                        </div>
                        <p className="text-sm font-bold text-primary">{formatPrice(it.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
