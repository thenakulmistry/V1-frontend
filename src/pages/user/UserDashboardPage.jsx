import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; // Added useOutletContext
import { Package, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import apiClient from '@/services/apiClient';

export default function UserDashboardPage() {
  const { user, token, logout } = useAuth();
  const { addToCart: contextAddToCart } = useOutletContext(); // Get addToCart from context
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token]);

  // Simplified Helper to normalize MongoDB ObjectId
  const normalizeId = (id) => {
    if (id === null || id === undefined) {
      // console.error('normalizeId received null or undefined id in DashboardPage');
      return String(id); // Or handle as an error/default string
    }
    if (typeof id === 'string') {
      return id; // Already a string (expected case now)
    }
    if (typeof id === 'object' && id.$oid && typeof id.$oid === 'string') {
      return id.$oid; // Handles {$oid: "..."} structure
    }
    // Fallback for any other type, though less expected for IDs now
    // console.warn('DashboardPage: normalizeId encountered an unexpected ID type. Converting to string:', id);
    return String(id);
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

  // Normalize all fetched items' ids to string immediately after fetch
  const fetchItems = async () => {
    try {
      const response = await apiClient.get('/user/items');

      if (response.status !== 200) {
        throw new Error('Failed to fetch items');
      }

      let data = response.data;
      // Normalize all ids to string
      data = Array.isArray(data) ? data.map(item => ({ ...item, id: normalizeId(item.id) })) : [];
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(error.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items Section */}
          <div className="lg:col-span-3"> {/* Changed to full width */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse bg-stone-200/50 h-40 rounded-lg"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-stone-400 mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">No items available</h3>
                <p className="text-stone-500">Check back later for new items.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {itemTypeOrder.map(type => (
                  groupedItems[type] && groupedItems[type].length > 0 && (
                    <div key={type}>
                      <h3 className="text-4xl font-bold text-stone-800 mb-4 font-great-vibes">{itemTypeDisplayNames[type]}</h3>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-4">
                        {groupedItems[type].map((item) => (
                          <div key={item.id} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-400/30 last:border-b-0">
                            {/* 
                            {item.imageUrl ? (
                              <img
                                src={`/${item.imageUrl}`}
                                alt={item.name}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  console.error(`Error loading image: ${e.target.src}. Hiding element.`);
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 bg-stone-200/50 flex items-center justify-center text-stone-400">
                                No Image
                              </div>
                            )}
                            */}
                            <div className="flex-grow mb-4 sm:mb-0">
                              <h4 className="font-semibold text-lg text-stone-800">{item.name}</h4>
                              <p className="text-sm text-stone-600 mt-1 italic">{item.description}</p>
                            </div>
                            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end">
                              <span className="text-xl font-bold text-stone-900 sm:mr-6">₹{item.price?.toFixed(2)}</span>
                              <Button
                                size="sm"
                                onClick={() => contextAddToCart(item)}
                                className="flex items-center gap-1"
                              >
                                <Plus size={14} />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
