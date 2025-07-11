import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Package, ArrowLeft, PlusCircle, Edit3, Trash2, ImageOff, ChevronDown } from 'lucide-react';
import Button from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import AddItemModal from '@/components/admin/AddItemModal';
import EditItemModal from '@/components/admin/EditItemModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Notification from '@/components/common/Notification';
import apiClient from '@/services/apiClient';

// Simplified Helper to normalize MongoDB ObjectId
const normalizeId = (id) => {
  if (id === null || id === undefined) {
    // console.error('normalizeId received null or undefined id in ManageItemsPage');
    return String(id); // Or handle as an error/default string
  }
  if (typeof id === 'string') {
    return id; // Already a string (expected case now)
  }
  if (typeof id === 'object' && id.$oid && typeof id.$oid === 'string') {
    return id.$oid; // Handles {$oid: "..."} structure
  }
  // Fallback for any other type, though less expected for IDs now
  // console.warn('ManageItemsPage: normalizeId encountered an unexpected ID type. Converting to string:', id);
  return String(id);
};

export default function ManageItemsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedTypes, setExpandedTypes] = useState(new Set());
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/items');
      let data = response.data;
      data = Array.isArray(data) ? data.map(item => ({ ...item, id: normalizeId(item.id) })) : [];
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const type = item.itemType || 'OTHER';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  const itemTypeOrder = ['SOUP', 'STARTER', 'CURRY', 'RICE', 'SIDES', 'SWEET', 'OTHER'];
  const itemTypeDisplayNames = {
    SOUP: 'Soups',
    STARTER: 'Starters',
    CURRY: 'Curries',
    RICE: 'Rice & Breads',
    SIDES: 'Sides',
    SWEET: 'Sweets',
    OTHER: 'Other Items',
  };

  const toggleTypeExpansion = (type) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleAddItemSubmit = async (itemData) => {
    try {
      await apiClient.post('/admin/item', itemData);
      setNotification({ show: true, message: 'Item added successfully.', type: 'success' });
      fetchItems();
      return { success: true };
    } catch (err) {
      console.error('Error adding item:', err);
      setNotification({ show: true, message: `Error adding item: ${err.response?.data?.message || err.message}`, type: 'error' });
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsEditItemModalOpen(true);
  };

  const handleEditItemSubmit = async (itemId, itemData) => {
    try {
      await apiClient.put(`/admin/item/${itemId}`, itemData);
      setNotification({ show: true, message: 'Item updated successfully.', type: 'success' });
      fetchItems();
      return { success: true };
    } catch (err) {
      console.error('Error updating item:', err);
      setNotification({ show: true, message: `Error updating item: ${err.response?.data?.message || err.message}`, type: 'error' });
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const handleDeleteItemClick = (item) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/admin/item/${itemToDelete.id}`);
      setNotification({ show: true, message: 'Item deleted successfully.', type: 'success' });
      fetchItems();
    } catch (err) {
      setNotification({ show: true, message: `Error deleting item: ${err.response?.data?.message || err.message}`, type: 'error' });
      console.error(err);
    } finally {
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-stone-700 hover:text-stone-900 mb-2 sm:mb-0">
              <ArrowLeft size={16} /> Back to Admin Dashboard
            </Button>
          </Link>
          <Button 
            onClick={() => setIsAddItemModalOpen(true)} 
            className="mt-4 sm:mt-0 bg-stone-800 hover:bg-stone-900 text-white flex items-center gap-2"
          >
            <PlusCircle size={18} /> Add New Item
          </Button>
        </div>

        {loading && <p className="text-center text-stone-600 py-10">Loading items...</p>}
        {error && <p className="text-center text-red-600 bg-red-100/70 p-4 rounded-md border border-red-200/70">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-4 text-center py-10">
                <p className="text-stone-500">No items found. Add some to get started!</p>
              </div>
            ) : (
              itemTypeOrder.map(type => {
                const typeItems = groupedItems[type];
                if (!typeItems || typeItems.length === 0) return null;

                const isExpanded = expandedTypes.has(type);

                return (
                  <div key={type} className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg transition-all duration-300">
                    <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleTypeExpansion(type)}>
                      <h3 className="text-xl font-semibold text-stone-800">
                        {itemTypeDisplayNames[type]} ({typeItems.length})
                      </h3>
                      <ChevronDown size={24} className={`text-stone-700 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 animate-fadeIn">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-stone-400/30">
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Image</th> */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Available</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {typeItems.map((item) => (
                                <tr key={item.id} className="border-b border-stone-400/30 last:border-b-0 hover:bg-white/10 transition-colors">
                                  {/*
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {item.imageUrl ? (
                                      <img src={`/${item.imageUrl}`} alt={item.name} className="h-12 w-12 rounded-md object-cover" onError={(e) => e.target.style.display='none'}/>
                                    ) : (
                                      <div className="h-12 w-12 rounded-md bg-stone-200/50 flex items-center justify-center text-stone-400">
                                        <ImageOff size={24} />
                                      </div>
                                    )}
                                  </td>
                                  */}
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{item.name}</td>
                                  <td className="px-6 py-4 text-sm text-stone-700 max-w-xs truncate" title={item.description}>{item.description || 'N/A'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">₹{item.price?.toFixed(2)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item.available ? 'bg-green-200/70 text-green-900' : 'bg-red-200/70 text-red-900'}`}>
                                      {item.available ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(item)} className="text-stone-600 hover:text-stone-800 p-1">
                                      <Edit3 size={16}/>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItemClick(item)} className="text-orange-600 hover:text-orange-800 p-1">
                                       <Trash2 size={16}/>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {isAddItemModalOpen && (
        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onSubmit={handleAddItemSubmit}
        />
      )}
      {isEditItemModalOpen && editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={isEditItemModalOpen}
          onClose={() => { setIsEditItemModalOpen(false); setEditingItem(null); }}
          onSubmit={handleEditItemSubmit}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmDeleteItem}
          title="Confirm Deletion"
          message={`Are you sure you want to delete item "${itemToDelete?.name}"? This action cannot be undone.`}
        />
      )}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}
    </>
  );
}