import React, { useState } from 'react';
import api from '../api/axios';
import { toastError, toastSuccess } from './Toast';
import { X, ShoppingBag, MapPin, Phone, User, ChevronRight, CheckCircle, Minus, Plus, Package } from 'lucide-react';

export default function BuyNowModal({ item, onClose, onOrderSuccess }) {
  const [step, setStep] = useState(1); // 1 = details, 2 = success
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [form, setForm] = useState({
    delivery_name: '',
    delivery_phone: '',
    delivery_address: '',
    delivery_city: '',
    delivery_pincode: '',
    notes: ''
  });

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const total = (parseFloat(item.price) || 0) * quantity;
  const maxQty = item.quantity || 1;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleQty = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(maxQty, prev + delta)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { delivery_name, delivery_phone, delivery_address, delivery_city, delivery_pincode } = form;
    if (!delivery_name || !delivery_phone || !delivery_address || !delivery_city || !delivery_pincode) {
      toastError('Please fill all delivery fields.');
      return;
    }
    if (delivery_phone.length < 10) {
      toastError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', {
        item_id: item.id,
        quantity,
        ...form
      });
      setOrderNumber(res.data.order_number);
      setStep(2);
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShoppingBag size={16} className="text-primary" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {step === 1 ? 'Place Order' : 'Order Confirmed!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Step 1: Order Form ─── */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Product Summary */}
              <div className="flex items-start space-x-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200">
                    <Package size={24} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.category} · {maxQty} {item.unit} available</p>
                  <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.price)} / {item.unit}</p>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Quantity</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleQty(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition cursor-pointer"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-slate-800">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQty(1)}
                      disabled={quantity >= maxQty}
                      className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition cursor-pointer"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="flex-1 bg-primary/5 rounded-xl px-4 py-2.5 border border-primary/10">
                    <p className="text-xs text-slate-500">Order Total</p>
                    <p className="text-base font-extrabold text-primary">{formatPrice(total)}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <MapPin size={12} />
                  <span>Delivery Information</span>
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="delivery_name"
                        placeholder="Full Name"
                        value={form.delivery_name}
                        onChange={handleChange}
                        className={`${inputCls} pl-9`}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="delivery_phone"
                        placeholder="Phone Number"
                        value={form.delivery_phone}
                        onChange={handleChange}
                        className={`${inputCls} pl-9`}
                        required
                      />
                    </div>
                  </div>
                  <textarea
                    name="delivery_address"
                    placeholder="Street Address, Flat / Building No."
                    value={form.delivery_address}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="delivery_city"
                      placeholder="City"
                      value={form.delivery_city}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    />
                    <input
                      type="text"
                      name="delivery_pincode"
                      placeholder="PIN Code"
                      value={form.delivery_pincode}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="notes"
                    placeholder="Delivery Notes (optional)"
                    value={form.notes}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order…</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <ShoppingBag size={15} />
                    <span>Place Order · {formatPrice(total)}</span>
                    <ChevronRight size={15} />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 2: Success ─── */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center text-center px-8 py-10 space-y-5">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">Order Placed Successfully!</h3>
              <p className="text-sm text-slate-500 mt-1">Your order has been received and is being processed.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 w-full">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Order Number</p>
              <p className="text-2xl font-extrabold text-primary mt-1 font-mono">{orderNumber}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 w-full text-left">
              <p className="text-xs font-semibold text-amber-700">📦 Estimated Delivery: 3–5 business days</p>
              <p className="text-xs text-amber-600 mt-0.5">Track your order from "My Orders" in the navigation.</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
