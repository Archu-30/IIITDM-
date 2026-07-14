import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { toastError, toastInfo } from '../components/Toast';
import { Download, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminTransactions({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [searchItem, setSearchItem] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTx, setTotalTx] = useState(0);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions', {
        params: {
          action: selectedAction,
          from: fromDate ? new Date(fromDate).toISOString() : '',
          to: toDate ? new Date(toDate).toISOString() : '',
          page,
          limit: 30
        }
      });
      
      let txs = res.data.transactions || [];
      
      // Perform local search filtering by item name (since database query matches exact parameters or paginates)
      if (searchItem) {
        txs = txs.filter(tx => tx.item_name.toLowerCase().includes(searchItem.toLowerCase()));
      }

      setTransactions(txs);
      setTotalPages(res.data.totalPages || 1);
      setTotalTx(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toastError('Failed to load transaction history logs');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchItem, selectedAction, fromDate, toDate, page]);

  // Export transactions to CSV
  const handleExportCSV = async () => {
    try {
      const res = await api.get('/transactions', {
        params: {
          action: selectedAction,
          from: fromDate ? new Date(fromDate).toISOString() : '',
          to: toDate ? new Date(toDate).toISOString() : '',
          limit: 10000
        }
      });
      const exportTxs = res.data.transactions || [];

      // Headers and CSV rows
      const headers = ['Date & Time', 'Item Name', 'Action', 'Old Qty', 'New Qty', 'Net Change', 'Changed By', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...exportTxs.map(tx => [
          `"${new Date(tx.created_at || tx.timestamp).toLocaleString()}"`,
          `"${tx.item_name.replace(/"/g, '""')}"`,
          `"${tx.action.toUpperCase()}"`,
          tx.old_quantity,
          tx.new_quantity,
          tx.new_quantity - tx.old_quantity,
          `"${tx.changed_by_name}"`,
          `"${(tx.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'transactions_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastInfo('Transactions CSV downloaded');
    } catch (err) {
      console.error(err);
      toastError('Failed to export transactions CSV');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 pl-60">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-slate-800">Transaction History Logs</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
              {totalTx} logs
            </span>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary bg-white hover:bg-primary/5 border border-slate-200 hover:border-primary/20 shadow-sm transition cursor-pointer"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </header>

        {/* Filter bar and Table */}
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          
          {/* Filters Block */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search item */}
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  placeholder="Search by item name..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-800"
                />
              </div>

              {/* Action Filter */}
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                  <SlidersHorizontal size={14} />
                  <span>Action:</span>
                </span>
                <select
                  value={selectedAction}
                  onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700 bg-white cursor-pointer"
                >
                  <option value="">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="restocked">Restocked</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-4 border-t border-slate-50 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center space-x-2">
                <span>From Date:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white cursor-pointer font-sans"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span>To Date:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white cursor-pointer font-sans"
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/70">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Type</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Old Qty</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">New Qty</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Shift</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Changed By</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {transactions.map((tx) => {
                  let pillClass = '';
                  let pillLabel = '';
                  
                  switch (tx.action) {
                    case 'created':
                      pillClass = 'bg-green-50 text-green-700 border-green-150';
                      pillLabel = 'Created';
                      break;
                    case 'updated':
                      pillClass = 'bg-blue-50 text-blue-700 border-blue-150';
                      pillLabel = 'Updated';
                      break;
                    case 'restocked':
                      pillClass = 'bg-cyan-50 text-cyan-700 border-cyan-150';
                      pillLabel = 'Restocked';
                      break;
                    case 'deleted':
                      pillClass = 'bg-red-50 text-red-700 border-red-150';
                      pillLabel = 'Deleted';
                      break;
                    default:
                      pillClass = 'bg-slate-50 text-slate-700 border-slate-150';
                      pillLabel = tx.action;
                  }

                  const qtyDiff = tx.new_quantity - tx.old_quantity;
                  const diffColor = qtyDiff > 0 ? 'text-green-600' : qtyDiff < 0 ? 'text-red-600' : 'text-slate-500';
                  const diffPrefix = qtyDiff > 0 ? '+' : '';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                        {new Date(tx.created_at || tx.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                        {tx.item_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${pillClass}`}>
                          {pillLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500 font-mono">
                        {tx.old_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 font-mono">
                        {tx.new_quantity}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-extrabold font-mono ${diffColor}`}>
                        {diffPrefix}{qtyDiff}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                        {tx.changed_by_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 italic max-w-xs truncate" title={tx.notes}>
                        {tx.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 text-sm">
                      No matching transaction logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold text-slate-400">
                Showing page <span className="text-slate-700">{page}</span> of <span className="text-slate-700">{totalPages}</span>
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-slate-650 bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-slate-650 bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
