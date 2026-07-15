import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StockCard from '../components/StockCard';
import BuyNowModal from '../components/BuyNowModal';
import api from '../api/axios';
import { toastError } from '../components/Toast';
import { IllustrationWrapper } from '../components/illustrations/IllustrationWrapper';
import { FloatingPackage, CrystalFolders, AmberWarningContainer } from '../components/illustrations/KpiIllustrations';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CustomerDashboard({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Stats
  const [availableCount, setAvailableCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  // Detail panel state
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemTransactions, setItemTransactions] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Buy Now modal state
  const [buyNowItem, setBuyNowItem] = useState(null);

  // Fetch stats and categories from full list
  useEffect(() => {
    const fetchStatsAndCategories = async () => {
      try {
        const res = await api.get('/stock', { params: { limit: 1000 } });
        const allItems = res.data.items || [];

        const available = allItems.filter(i => i.status === 'available').length;
        setAvailableCount(available);

        const lowStock = allItems.filter(i => i.status === 'low_stock').length;
        setLowStockCount(lowStock);

        const uniqueCategories = [...new Set(allItems.map(i => i.category))];
        setCategories(uniqueCategories);
        setTotalCategories(uniqueCategories.length);
      } catch (err) {
        console.error('Failed to load summary stats:', err);
      }
    };

    fetchStatsAndCategories();
  }, [items]);

  // Fetch paginated catalog
  const fetchCatalog = async () => {
    try {
      const res = await api.get('/stock', {
        params: {
          search,
          category: selectedCategory,
          status: selectedStatus,
          page,
          limit: 9
        }
      });
      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch stock catalog');
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search, selectedCategory, selectedStatus, page]);

  // Fetch detail item transactions
  const handleViewDetails = async (item) => {
    setSelectedItem(item);
    setPanelOpen(true);
    try {
      const res = await api.get(`/stock/${item.id}`);
      setItemTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to load item transaction history');
    }
  };

  // Indian Rupees Formatter
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition duration-300">
            <IllustrationWrapper gradient={['#10b981', '#06b6d4']}>
              <FloatingPackage />
            </IllustrationWrapper>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items Available</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{availableCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition duration-300">
            <IllustrationWrapper gradient={['#8b5cf6', '#3b82f6']}>
              <CrystalFolders />
            </IllustrationWrapper>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Categories</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{totalCategories}</h3>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center space-x-5 hover:shadow-md transition duration-300">
            <IllustrationWrapper gradient={['#f59e0b', '#f97316']}>
              <AmberWarningContainer />
            </IllustrationWrapper>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{lowStockCount}</h3>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search items by name, SKU, or category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-800"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                <SlidersHorizontal size={14} />
                <span>Filters:</span>
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700 bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-50 pt-4">
            <span className="text-xs font-semibold text-slate-400 mr-2">Status:</span>
            {[
              { label: 'All', value: '' },
              { label: 'Available', value: 'available' },
              { label: 'Low Stock', value: 'low_stock' },
              { label: 'Out of Stock', value: 'out_of_stock' }
            ].map(pill => (
              <button
                key={pill.label}
                onClick={() => { setSelectedStatus(pill.value); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  selectedStatus === pill.value
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Catalog Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {items.map(item => (
              <StockCard
                key={item.id}
                item={item}
                onViewDetails={handleViewDetails}
                onBuyNow={(it) => setBuyNowItem(it)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl py-16 px-6 text-center border border-slate-100 shadow-sm max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              We couldn't find any stock items matching your search filters. Try modifying your keywords.
            </p>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold text-slate-400">
              Showing page <span className="text-slate-700">{page}</span> of <span className="text-slate-700">{totalPages}</span> ({totalItems} total items)
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Slide-over Detail Panel */}
      {panelOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setPanelOpen(false)}
          />

          <div className="pointer-events-none absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-white shadow-2xl border-l border-slate-100 flex flex-col h-full z-10 transition-transform duration-300 ease-in-out">

              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Product Details</h3>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Panel Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Details Table */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800">{selectedItem.name}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">{selectedItem.sku}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Category</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedItem.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Unit Type</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedItem.unit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Stock Level</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedItem.quantity} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Unit Price</p>
                      <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(selectedItem.price)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Description</p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-white border border-slate-100 p-3.5 rounded-xl">
                      {selectedItem.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Last 5 Transactions */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Recent Activity History</h4>
                  <div className="space-y-3">
                    {itemTransactions.slice(0, 5).map((tx) => {
                      let actionColor = '';
                      let actionText = '';

                      switch (tx.action) {
                        case 'created':
                          actionColor = 'bg-green-50 text-green-700 border-green-150';
                          actionText = 'Created';
                          break;
                        case 'restocked':
                          actionColor = 'bg-cyan-50 text-cyan-700 border-cyan-150';
                          actionText = 'Restocked';
                          break;
                        case 'deleted':
                          actionColor = 'bg-red-50 text-red-700 border-red-150';
                          actionText = 'Deleted';
                          break;
                        default:
                          actionColor = 'bg-blue-50 text-blue-700 border-blue-150';
                          actionText = 'Updated';
                      }

                      return (
                        <div key={tx.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs flex flex-col space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${actionColor}`}>
                              {actionText}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {new Date(tx.created_at || tx.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>Quantity Shift:</span>
                            <span className="font-bold">
                              {tx.old_quantity} &rarr; {tx.new_quantity}
                            </span>
                          </div>
                          <div className="text-slate-400 italic">
                            By: {tx.changed_by_name} {tx.notes && `(${tx.notes})`}
                          </div>
                        </div>
                      );
                    })}
                    {itemTransactions.length === 0 && (
                      <p className="text-xs text-slate-400 italic py-4 text-center">No transaction logs for this item.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Now Modal */}
      {buyNowItem && (
        <BuyNowModal
          item={buyNowItem}
          onClose={() => setBuyNowItem(null)}
          onOrderSuccess={() => { fetchCatalog(); setBuyNowItem(null); }}
        />
      )}
    </div>
  );
}
