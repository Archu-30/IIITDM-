import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { toastError, toastSuccess } from '../components/Toast';
import { X, Calendar, MapPin, Phone, Mail, User, Building, Clock, FileText } from 'lucide-react';

export default function CustomerContactLeasing({ user, onLogout }) {
  const [inquiryForm, setInquiryForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    mobile: '',
    warehouseRequirement: '',
    leaseDuration: '',
    message: ''
  });

  const [callbackForm, setCallbackForm] = useState({
    full_name: '',
    company_name: '',
    email: '',
    mobile: '',
    preferred_time: '',
    message: ''
  });
  const [callbackLoading, setCallbackLoading] = useState(false);

  // Contact for Lease Modal State
  const [leasePlan, setLeasePlan] = useState(null); // Selected plan object or null
  const [leaseForm, setLeaseForm] = useState({
    warehouse: 'Warehouse A',
    leaseDuration: '1 Year',
    company: '',
    contactPerson: '',
    phone: '',
    email: '',
    message: ''
  });
  const [leaseLoading, setLeaseLoading] = useState(false);

  const rentalPlans = [
    {
      title: 'Basic Plan',
      features: ['Small Warehouse Space', 'Shared Storage', 'Monthly Lease', 'Email Support'],
    },
    {
      title: 'Standard Plan',
      features: ['Medium Warehouse Space', 'Dedicated Storage Area', 'Inventory Support', 'Monthly Lease'],
    },
    {
      title: 'Enterprise Plan',
      features: ['Large Warehouse Space', 'Custom Capacity', 'Priority Support', 'Custom Lease Terms'],
    },
  ];

  const warehouses = [
    {
      name: 'Warehouse A',
      location: 'Chennai, Tamil Nadu',
      capacity: '5000 sq ft',
      leaseType: 'Monthly',
      price: '₹50,000 / month',
    },
    {
      name: 'Warehouse B',
      location: 'Coimbatore, Tamil Nadu',
      capacity: '8000 sq ft',
      leaseType: 'Quarterly',
      price: '₹140,000 / quarter',
    },
    {
      name: 'Warehouse C',
      location: 'Madurai, Tamil Nadu',
      capacity: '12000 sq ft',
      leaseType: 'Yearly',
      price: '₹500,000 / year',
    },
  ];

  // Submit Inquiry (Inquiry Form)
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    const { fullName, companyName, email, mobile, warehouseRequirement, leaseDuration, message } = inquiryForm;
    if (!fullName || !email || !mobile || !warehouseRequirement || !leaseDuration) {
      toastError('Please fill all required fields');
      return;
    }
    try {
      const res = await api.post('/inquiries', {
        fullName,
        companyName,
        email,
        mobile,
        warehouseRequirement,
        leaseDuration,
        message
      });
      toastSuccess(`Lease inquiry submitted successfully! ID: ${res.data.inquiryId}. Awaiting review.`);
      setInquiryForm({
        fullName: '',
        companyName: '',
        email: '',
        mobile: '',
        warehouseRequirement: '',
        leaseDuration: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      toastError('Failed to submit lease inquiry');
    }
  };

  // Submit Callback
  const handleCallbackSubmit = async () => {
    const { full_name, email, mobile } = callbackForm;
    if (!full_name || !email || !mobile) {
      toastError('Please fill your name, email, and mobile for the callback request.');
      return;
    }
    setCallbackLoading(true);
    try {
      const res = await api.post('/callbacks', callbackForm);
      toastSuccess(`Callback request submitted successfully! ID: ${res.data.callbackId}.`);
      setCallbackForm({ full_name: '', company_name: '', email: '', mobile: '', preferred_time: '', message: '' });
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to submit callback request.');
    } finally {
      setCallbackLoading(false);
    }
  };

  // Submit Contact for Lease Modal Form
  const handleLeaseSubmit = async (e) => {
    e.preventDefault();
    const { warehouse, leaseDuration, company, contactPerson, phone, email, message } = leaseForm;
    if (!warehouse || !leaseDuration || !contactPerson || !phone || !email) {
      toastError('Please fill in all required fields.');
      return;
    }
    setLeaseLoading(true);
    try {
      const res = await api.post('/leases/inquire', {
        warehouseName: warehouse,
        leaseDuration,
        companyName: company,
        contactPerson,
        phone,
        email,
        message
      });
      toastSuccess(`Lease Request created successfully! ID: ${res.data.leaseId}.`);
      setLeasePlan(null);
      setLeaseForm({
        warehouse: 'Warehouse A',
        leaseDuration: '1 Year',
        company: '',
        contactPerson: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      toastError('Failed to submit lease request.');
    } finally {
      setLeaseLoading(false);
    }
  };

  const handleOpenLeaseModal = (plan) => {
    setLeasePlan(plan);
    setLeaseForm(prev => ({
      ...prev,
      leaseDuration: plan.title === 'Basic Plan' ? 'Monthly' : plan.title === 'Standard Plan' ? 'Quarterly' : 'Yearly',
      contactPerson: user?.name || '',
      email: user?.email || ''
    }));
  };

  const modalInputCls = "w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Lease Plans */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Lease Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rentalPlans.map((plan) => (
            <div key={plan.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-base font-semibold text-slate-800 mb-3">{plan.title}</h3>
              <ul className="flex-1 mb-5 space-y-1.5">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="text-sm text-slate-600">• {feat}</li>
                ))}
              </ul>
              <button 
                onClick={() => handleOpenLeaseModal(plan)}
                className="w-full bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition cursor-pointer"
              >
                Contact for Lease
              </button>
            </div>
          ))}
        </div>

        {/* Available Warehouses */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Available Warehouses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {warehouses.map((wh) => (
            <div key={wh.name} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h4 className="text-base font-semibold text-slate-800 mb-3">{wh.name}</h4>
              <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Location:</span> {wh.location}</p>
              <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Capacity:</span> {wh.capacity}</p>
              <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Lease Type:</span> {wh.leaseType}</p>
              <p className="text-sm text-slate-600"><span className="font-medium">Rental Price:</span> {wh.price}</p>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Contact Information</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
          <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Company Name:</span> Rentalyze Warehousing</p>
          <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Contact Person:</span> Warehouse Leasing Team</p>
          <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Phone:</span> +91 XXXXX XXXXX</p>
          <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Email:</span> <a href="mailto:leasing@rentalyze.com" className="text-primary underline">leasing@rentalyze.com</a></p>
          <p className="text-sm text-slate-600"><span className="font-medium">Address:</span> Chennai, Tamil Nadu</p>
        </div>

        {/* Lease Inquiry Form */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Lease Inquiry Form</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleInquirySubmit}>
            <input
              type="text"
              placeholder="Full Name"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={inquiryForm.fullName}
              onChange={e => setInquiryForm({ ...inquiryForm, fullName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Company Name"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={inquiryForm.companyName}
              onChange={e => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={inquiryForm.email}
              onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={inquiryForm.mobile}
              onChange={e => setInquiryForm({ ...inquiryForm, mobile: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Warehouse Requirement"
              className="border border-slate-200 rounded-xl p-2.5 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={inquiryForm.warehouseRequirement}
              onChange={e => setInquiryForm({ ...inquiryForm, warehouseRequirement: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Lease Duration"
              className="border border-slate-200 rounded-xl p-2.5 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={inquiryForm.leaseDuration}
              onChange={e => setInquiryForm({ ...inquiryForm, leaseDuration: e.target.value })}
              required
            />
            <textarea
              placeholder="Message"
              className="border border-slate-200 rounded-xl p-2.5 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={4}
              value={inquiryForm.message}
              onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
            />
            <div className="md:col-span-2 flex space-x-4 mt-2">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition cursor-pointer"
              >
                Submit Inquiry
              </button>
            </div>
          </form>
        </div>

        {/* Callback Request Form */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Request Callback Form</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={callbackForm.full_name}
              onChange={e => setCallbackForm({ ...callbackForm, full_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Company Name"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={callbackForm.company_name}
              onChange={e => setCallbackForm({ ...callbackForm, company_name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={callbackForm.email}
              onChange={e => setCallbackForm({ ...callbackForm, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={callbackForm.mobile}
              onChange={e => setCallbackForm({ ...callbackForm, mobile: e.target.value })}
            />
            <input
              type="text"
              placeholder="Preferred Time (e.g. 10:00 AM - 12:00 PM)"
              className="border border-slate-200 rounded-xl p-2.5 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={callbackForm.preferred_time}
              onChange={e => setCallbackForm({ ...callbackForm, preferred_time: e.target.value })}
            />
            <textarea
              placeholder="Message (optional)"
              className="border border-slate-200 rounded-xl p-2.5 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={3}
              value={callbackForm.message}
              onChange={e => setCallbackForm({ ...callbackForm, message: e.target.value })}
            />
            <div className="md:col-span-2 mt-2">
              <button
                type="button"
                onClick={handleCallbackSubmit}
                disabled={callbackLoading}
                className="bg-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 transition cursor-pointer disabled:opacity-60"
              >
                {callbackLoading ? 'Sending…' : 'Request Callback'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Lease Request Modal */}
      {leasePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setLeasePlan(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col z-10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Contact for Lease - {leasePlan.title}</h3>
              <button onClick={() => setLeasePlan(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleLeaseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Warehouse</label>
                <select 
                  className={modalInputCls}
                  value={leaseForm.warehouse}
                  onChange={e => setLeaseForm({ ...leaseForm, warehouse: e.target.value })}
                >
                  {warehouses.map(wh => (
                    <option key={wh.name} value={wh.name}>{wh.name} ({wh.location} - {wh.capacity})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Lease Duration</label>
                  <input 
                    type="text" 
                    className={modalInputCls}
                    value={leaseForm.leaseDuration}
                    onChange={e => setLeaseForm({ ...leaseForm, leaseDuration: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acma Corp"
                    className={modalInputCls}
                    value={leaseForm.company}
                    onChange={e => setLeaseForm({ ...leaseForm, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    className={modalInputCls}
                    value={leaseForm.contactPerson}
                    onChange={e => setLeaseForm({ ...leaseForm, contactPerson: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +91 XXXXX XXXXX"
                    className={modalInputCls}
                    value={leaseForm.phone}
                    onChange={e => setLeaseForm({ ...leaseForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  className={modalInputCls}
                  value={leaseForm.email}
                  onChange={e => setLeaseForm({ ...leaseForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Message</label>
                <textarea 
                  className={`${modalInputCls} resize-none`}
                  rows={3}
                  value={leaseForm.message}
                  onChange={e => setLeaseForm({ ...leaseForm, message: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={leaseLoading}
                className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition cursor-pointer disabled:opacity-60"
              >
                {leaseLoading ? 'Submitting…' : 'Submit Lease Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
