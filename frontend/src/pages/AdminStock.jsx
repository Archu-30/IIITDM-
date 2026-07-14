import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StockTable from '../components/StockTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';
import { toastSuccess, toastError, toastInfo } from '../components/Toast';
import { 
  Plus, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  X,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminStock({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Active form items
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToRestock, setItemToRestock] = useState(null);

  // Form states - Add/Edit
  const [itemName, setItemName] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [autoGenSku, setAutoGenSku] = useState(true);
  const [itemCategory, setItemCategory] = useState('');
  const [itemUnit, setItemUnit] = useState('pcs');
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemDescription, setItemDescription] = useState('');
  
  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Form states - Restock
  const [addQuantity, setAddQuantity] = useState(0);
  const [restockNotes, setRestockNotes] = useState('');

  const fetchStock = async () => {
    try {
      const res = await api.get('/stock', {
        params: {
          search,
          category: selectedCategory,
          status: selectedStatus,
          page,
          limit: 10
        }
      });
      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.total || 0);

      // Fetch all unique categories from full inventory list (for dropdowns / suggestions)
      const catRes = await api.get('/stock', { params: { limit: 1000 } });
      const uniqueCats = [...new Set((catRes.data.items || []).map(i => i.category))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch inventory stock');
    }
  };

  useEffect(() => {
    fetchStock();
    setSelectedIds([]); // Reset selection on filters/page change
  }, [search, selectedCategory, selectedStatus, page]);

  // Handle single selection toggling
  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle bulk select/deselect all on current page
  const handleToggleSelectAll = () => {
    const currentPageIds = items.map(i => i.id);
    const allSelected = currentPageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !currentPageIds.includes(id)));
    } else {
      const combined = [...new Set([...selectedIds, ...currentPageIds])];
      setSelectedIds(combined);
    }
  };

  // Open add modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemName('');
    setItemSku('');
    setAutoGenSku(true);
    setItemCategory('');
    setItemUnit('pcs');
    setItemQuantity(0);
    setItemPrice(0);
    setItemDescription('');
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setAddEditModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemSku(item.sku);
    setAutoGenSku(false);
    setItemCategory(item.category);
    setItemUnit(item.unit);
    setItemQuantity(item.quantity);
    setItemPrice(item.price);
    setItemDescription(item.description || '');
    
    setImageFile(null);
    setRemoveImage(false);
    if (item.image_url) {
      setImagePreview(item.image_url);
    } else {
      setImagePreview(null);
    }
    
    setAddEditModalOpen(true);
  };

  // Open restock modal
  const handleOpenRestock = (item) => {
    setItemToRestock(item);
    setAddQuantity(0);
    setRestockNotes('');
    setRestockModalOpen(true);
  };

  // Open delete single item modal
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // Submit Save Add/Edit
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemCategory || !itemUnit) {
      toastError('Please fill in required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('category', itemCategory);
    formData.append('description', itemDescription);
    formData.append('sku', autoGenSku ? '' : itemSku);
    formData.append('quantity', Number(itemQuantity));
    formData.append('unit', itemUnit);
    formData.append('price', Number(itemPrice));
    
    if (imageFile) {
      formData.append('productImage', imageFile);
    }
    if (removeImage) {
      formData.append('removeImage', true);
    }

    try {
      if (editingItem) {
        // Edit flow (PUT)
        await api.put(`/stock/${editingItem.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toastSuccess('Item updated successfully');
      } else {
        // Create flow (POST)
        await api.post('/stock', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toastSuccess('Stock item created successfully');
      }
      setAddEditModalOpen(false);
      fetchStock();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to save item';
      toastError(errMsg);
    }
  };

  // Submit Restock
  const handleRestock = async (e) => {
    e.preventDefault();
    if (addQuantity <= 0) {
      toastError('Please enter a positive restock quantity');
      return;
    }

    try {
      await api.patch(`/stock/${itemToRestock.id}/restock`, {
        quantity: Number(addQuantity),
        notes: restockNotes
      });
      toastSuccess('Restocked successfully');
      setRestockModalOpen(false);
      fetchStock();
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Restock failed');
    }
  };

  // Submit Delete Single
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/stock/${itemToDelete.id}`);
      toastSuccess('Item deleted successfully');
      setDeleteModalOpen(false);
      fetchStock();
    } catch (err) {
      console.error(err);
      toastError('Deletion failed');
    }
  };

  // Submit Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    try {
      // Execute deletions sequentially
      await Promise.all(selectedIds.map(id => api.delete(`/stock/${id}`)));
      toastSuccess(`${selectedIds.length} items deleted successfully`);
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
      fetchStock();
    } catch (err) {
      console.error(err);
      toastError('Bulk deletion encountered errors');
    }
  };

  // Live status preview logic
  const getLiveStatus = (qty) => {
    const q = Number(qty) || 0;
    if (q === 0) return 'out_of_stock';
    if (q > 0 && q <= 10) return 'low_stock';
    return 'available';
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      // Fetch all items matching filters (without pagination limit) to export everything
      const res = await api.get('/stock', {
        params: {
          search,
          category: selectedCategory,
          status: selectedStatus,
          limit: 10000
        }
      });
      const exportItems = res.data.items || [];

      // Construct CSV lines
      const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Unit', 'Price', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...exportItems.map(item => [
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.sku}"`,
          `"${item.category}"`,
          item.quantity,
          `"${item.unit}"`,
          item.price,
          `"${item.status}"`,
          `"${item.created_at || ''}"`
        ].join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'inventory_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastInfo('Inventory CSV downloaded');
    } catch (err) {
      console.error(err);
      toastError('Failed to export CSV');
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
            <h1 className="text-lg font-bold text-slate-800">Inventory Management</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
              {totalItems} total
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary bg-white hover:bg-primary/5 border border-slate-200 hover:border-primary/20 shadow-sm transition cursor-pointer"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/10 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New Item</span>
            </button>
          </div>
        </header>

        {/* Filter bar and Table Container */}
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          
          {/* Search + Filter Row */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-800"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700 bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700 bg-white cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Strip */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 flex items-center justify-between transition-all duration-300">
              <div className="flex items-center space-x-2 text-sm font-semibold text-blue-800">
                <Info size={16} />
                <span>{selectedIds.length} items selected for actions</span>
              </div>
              <button
                onClick={() => setBulkDeleteModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Delete Selected</span>
              </button>
            </div>
          )}

          {/* Stock Table */}
          <StockTable
            items={items}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={handleOpenEdit}
            onRestock={handleOpenRestock}
            onDelete={handleOpenDelete}
          />

          {/* Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold text-slate-400">
                Showing <span className="text-slate-750 font-bold">{items.length}</span> of <span className="text-slate-750 font-bold">{totalItems}</span> stock items
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

      {/* MODAL 1: ADD / EDIT ITEM */}
      <Modal
        isOpen={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        title={editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
      >
        <form onSubmit={handleSaveItem} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Item Name *</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Steel Storage Rack"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
                required
              />
            </div>

            {/* SKU & Auto Generate Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase">SKU Code</label>
                <label className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenSku}
                    onChange={(e) => setAutoGenSku(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-slate-350"
                  />
                  <span>Auto-generate SKU</span>
                </label>
              </div>
              <input
                type="text"
                value={autoGenSku ? 'AUTO-GENERATED' : itemSku}
                onChange={(e) => setItemSku(e.target.value)}
                placeholder="SKU-001"
                disabled={autoGenSku}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-450 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800 font-mono"
                required={!autoGenSku}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category *</label>
              <input
                type="text"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                placeholder="Furniture"
                list="category-suggestions"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
                required
              />
              <datalist id="category-suggestions">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Unit *</label>
              <input
                type="text"
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
                placeholder="pcs, rolls, box"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Quantity *</label>
              <input
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Price per Unit (₹) *</label>
              <input
                type="number"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
                required
              />
            </div>
          </div>

          {/* Product Image Upload Section */}
          <div className="border-t border-slate-100 pt-5 mt-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Product Image</label>
            
            {!imagePreview ? (
              <div 
                className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={() => document.getElementById('imageUploadInput').click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    setRemoveImage(false);
                  }
                }}
              >
                <input 
                  id="imageUploadInput"
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                      setRemoveImage(false);
                    }
                  }}
                />
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 mb-3 group-hover:text-primary transition-colors">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700">Drag & Drop Image Here</p>
                <p className="text-xs font-medium text-slate-400 mt-1">or <span className="text-primary hover:underline">Click to Browse</span></p>
                <p className="text-[10px] text-slate-400 mt-3 font-semibold tracking-wide">SUPPORTED: PNG • JPG • WEBP (MAX 10MB)</p>
              </div>
            ) : (
              <div className="flex items-center space-x-6 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="relative group">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-[180px] h-[180px] object-cover rounded-2xl border border-slate-100 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <ImageIcon className="text-white drop-shadow-md" size={32} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Image Selected</p>
                    {imageFile && <p className="text-xs font-medium text-slate-500 mt-0.5">{imageFile.name} • {(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('imageUploadInput').click()}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Replace Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setRemoveImage(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors inline-flex items-center"
                    >
                      <X size={14} className="mr-1" />
                      Remove
                    </button>
                  </div>
                  
                  {/* Hidden input for replace button */}
                  <input 
                    id="imageUploadInput"
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                        setRemoveImage(false);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Provide a short description of the item..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
            />
          </div>

          {/* Status Preview */}
          <div className="flex items-center space-x-2 border-t border-slate-50 pt-4">
            <span className="text-xs font-semibold text-slate-400">Live Status Preview:</span>
            <StatusBadge status={getLiveStatus(itemQuantity)} />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setAddEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RESTOCK MODAL */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title="Restock Item Inventory"
      >
        {itemToRestock && (
          <form onSubmit={handleRestock} className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <p className="text-sm text-slate-600">
                Item: <strong className="text-slate-800">{itemToRestock.name}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Current Quantity: <strong className="text-slate-800">{itemToRestock.quantity} {itemToRestock.unit}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Restock Quantity (To Add) *</label>
              <input
                type="number"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
                placeholder="10"
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Restock Notes</label>
              <input
                type="text"
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                placeholder="e.g., Supplier Batch #42"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md cursor-pointer"
              >
                Restock
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Item Deletion"
      >
        {itemToDelete && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-rose-600 bg-rose-50 border border-rose-100 p-4 rounded-xl">
              <AlertTriangle size={24} className="flex-shrink-0" />
              <p className="text-sm font-medium">
                Are you sure you want to delete <strong className="font-extrabold">{itemToDelete.name}</strong>? This action will permanently remove the item from catalog and cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: BULK DELETE CONFIRMATION */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Confirm Bulk Deletion"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-rose-600 bg-rose-50 border border-rose-100 p-4 rounded-xl">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <p className="text-sm font-medium">
              Are you sure you want to delete <strong className="font-extrabold">{selectedIds.length}</strong> selected items? This will remove all of them permanently from inventory and is irreversible.
            </p>
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDeleteConfirm}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 cursor-pointer"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
