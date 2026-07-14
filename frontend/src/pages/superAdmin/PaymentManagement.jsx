import React, { useState } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { DollarSign, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function PaymentManagement({ user, onLogout }) {
  const [payments] = useState([
    { id: 'TXN-001', org: 'FastCargo Ltd', amount: 45000, date: '2026-06-20', status: 'paid', method: 'Razorpay' },
    { id: 'TXN-002', org: 'Apex Retail', amount: 65000, date: '2026-06-18', status: 'paid', method: 'Bank Transfer' },
    { id: 'TXN-003', org: 'Prime Distributors', amount: 35000, date: '2026-06-15', status: 'pending', method: 'Invoice' },
    { id: 'TXN-004', org: 'Nexus LogiCorp', amount: 55000, date: '2026-06-10', status: 'failed', method: 'Credit Card' },
  ]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Payment & Revenue Management</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Revenue KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Total Collected (INR)</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatPrice(165000)}</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={24} /></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Outstanding Dues</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatPrice(35000)}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={24} /></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Failed Payments</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatPrice(55000)}</h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ArrowUpRight size={24} /></div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-base font-bold text-slate-800">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Transaction ID</th>
                    <th className="p-4">Organization</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Method</th>
                    <th className="p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-mono font-semibold text-slate-700">{pay.id}</td>
                      <td className="p-4 font-semibold text-slate-800">{pay.org}</td>
                      <td className="p-4 text-slate-700">{formatPrice(pay.amount)}</td>
                      <td className="p-4 text-slate-500">{pay.date}</td>
                      <td className="p-4 text-slate-400 font-medium">{pay.method}</td>
                      <td className="p-4 pr-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          pay.status === 'paid' 
                            ? 'bg-green-50 text-green-600' 
                            : pay.status === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
