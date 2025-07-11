import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Edit, User as UserIcon, Ban, ChevronDown } from 'lucide-react'; // Changed Trash2 to Ban
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import EditProfileModal from '@/components/user/EditProfileModal'; // Import the modal
import ConfirmationModal from '@/components/common/ConfirmationModal'; // Import ConfirmationModal
import Notification from '@/components/common/Notification'; // Import Notification
import apiClient from '@/services/apiClient';

// Helper to normalize MongoDB ObjectId (if needed for other parts, or if order.id isn't already a string)
const normalizeId = (id) => {
  if (id === null || id === undefined) return String(id);
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id.$oid && typeof id.$oid === 'string') return id.$oid;
  return String(id);
};

// Helper to parse date values (similar to ManageOrdersPage)
const parseClientDate = (dateInput) => {
  if (!dateInput) return null;

  // If it's already a Date object
  if (dateInput instanceof Date) {
    return !isNaN(dateInput.getTime()) ? dateInput : null;
  }

  // If it's a string (e.g., ISO 8601)
  if (typeof dateInput === 'string') {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) return d;
  }

  // If it's a number (timestamp in milliseconds)
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) return d;
  }

  // If it's an object from Jackson's LocalDateTime serialization (e.g., { year, monthValue, ... })
  if (typeof dateInput === 'object' && dateInput !== null && !Array.isArray(dateInput)) {
    if (typeof dateInput.year === 'number' &&
        typeof dateInput.monthValue === 'number' && // Java month is 1-12
        typeof dateInput.dayOfMonth === 'number') {
      
      const year = dateInput.year;
      const monthIndex = dateInput.monthValue - 1; // JS month is 0-11
      const day = dateInput.dayOfMonth;
      const hour = typeof dateInput.hour === 'number' ? dateInput.hour : 0;
      const minute = typeof dateInput.minute === 'number' ? dateInput.minute : 0;
      const second = typeof dateInput.second === 'number' ? dateInput.second : 0;
      const ms = dateInput.nano ? Math.floor(dateInput.nano / 1000000) : 0;
      
      const d = new Date(year, monthIndex, day, hour, minute, second, ms);
      if (!isNaN(d.getTime())) return d;
    }
    // Handle MongoDB BSON Date format {$date: "ISO_STRING" or timestamp}
    if (dateInput.$date !== undefined) {
        const d = new Date(dateInput.$date);
        if (!isNaN(d.getTime())) return d;
    }
  }
  
  // If it's an array [YYYY, MM, DD, HH, MM, SS, NANO] (another Jackson format for LocalDateTime)
  if (Array.isArray(dateInput) && dateInput.length >= 3) { // Year, Month, Day are minimum
    const d = new Date(
        dateInput[0],       // year
        dateInput[1] - 1,   // month (Java 1-12 -> JS 0-11)
        dateInput[2],       // day
        dateInput[3] || 0,  // hour
        dateInput[4] || 0,  // minute
        dateInput[5] || 0,  // second
        dateInput[6] ? Math.floor(dateInput[6] / 1000000) : 0 // nano to ms
    );
    if (!isNaN(d.getTime())) return d;
  }

  console.warn('ProfilePage: Failed to parse date:', dateInput);
  return null; 
};


export default function ProfilePage() {
  const { user, token, updateUserContext } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true); // Renamed for clarity
  const [errorOrders, setErrorOrders] = useState(null); // Renamed for clarity
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders(null); // Reset error state on new fetch
    try {
      const response = await apiClient.get('/user/orders');

      let data = response.data;
      // Normalize IDs, parse dates, and ensure 'people' field is handled
      data = Array.isArray(data) ? data.map(order => ({ 
        ...order, 
        id: normalizeId(order.id), // Use normalizeId for consistency
        createdAt: parseClientDate(order.createdAt), // Use the date parser
        requiredByDateTime: parseClientDate(order.requiredByDateTime),
        // 'people' field should be directly available from backend data
      })) : [];

      // Sort orders to show the most recent ones first
      data.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });

      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response && error.response.status === 404) {
        // Handle 404 Not Found as "no orders" instead of an error
        setOrders([]);
      } else {
        setErrorOrders(error.response?.data?.message || error.message);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleCancelOrderClick = (order) => {
    setOrderToCancel(order);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;

    // Ensure we use 'totalPrice' as expected by OrderDTO
    const payload = {
      items: orderToCancel.items,
      people: orderToCancel.people,
      totalPrice: orderToCancel.totalAmount || orderToCancel.totalPrice, // Use existing total
      status: 'Cancelled',
      requiredByDateTime: orderToCancel.requiredByDateTime ? orderToCancel.requiredByDateTime.toISOString() : null,
      notes: orderToCancel.notes // Preserve existing notes
    };

    try {
      await apiClient.put(`/user/orders/update/${orderToCancel.id}`, payload);

      setNotification({ show: true, message: 'Order cancelled successfully!', type: 'success' });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error cancelling order:', error);
      setNotification({ show: true, message: `Failed to cancel order: ${error.response?.data?.message || error.message}`, type: 'error' });
    } finally {
      setIsConfirmModalOpen(false);
      setOrderToCancel(null);
    }
  };

  // Renamed from handleUpdateUser to be more specific for modal submission
  const handleProfileUpdateSubmit = async (updatedData) => {
    try {
      // Use apiClient for consistency and to leverage interceptors
      await apiClient.put('/user', updatedData);
      
      // Optimistically update context, or fetch user profile again for fresh data
      // For simplicity, optimistic update:
      const newUserData = { ...user, ...updatedData };
      updateUserContext(newUserData); 

      setNotification({ show: true, message: 'Profile updated successfully!', type: 'success' });
      setIsEditModalOpen(false); // Close modal on success
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      setNotification({ show: true, message: `Error updating profile: ${error.response?.data?.message || error.message}`, type: 'error' });
      return { success: false, error: error.message };
    }
  };

  const getOrderStatus = (order) => {
    if (order.status) {
      return order.status;
    }
    return 'Pending'; // Default status if not present
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-200/70 text-green-900';
      case 'pending':
        return 'bg-yellow-200/70 text-yellow-900';
      case 'cancelled':
        return 'bg-red-200/70 text-red-900';
      default:
        return 'bg-blue-200/70 text-blue-900';
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link to="/user/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 mb-4 text-stone-700">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <h2 className="text-3xl font-bold text-stone-800 font-great-vibes mb-4">
              Personal Information
            </h2>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon size={32} className="text-stone-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900">{user?.name}</h3>
                  <p className="text-sm text-stone-500">@{user?.username}</p>
                </div>
                
                <div className="border-t border-stone-300/50 pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-500">Full Name</label>
                    <p className="text-sm text-stone-900 mt-1">{user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500">Username</label>
                    <p className="text-sm text-stone-900 mt-1">{user?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500">Email</label>
                    <p className="text-sm text-stone-900 mt-1">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500">Phone Number</label>
                    <p className="text-sm text-stone-900 mt-1">{user?.number || 'Not provided'}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsEditModalOpen(true)} // This now opens the modal
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Edit size={16} />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-3xl font-bold text-stone-800 font-great-vibes">
                Order History
              </h2>
              {orders.length > 0 && (
                <span className="bg-stone-200 text-stone-800 text-xs px-2 py-1 rounded-full">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              )}
            </div>
            
            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse bg-stone-200/50 h-32 rounded-lg"></div>
                ))}
              </div>
            ) : errorOrders ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg">
                <div className="text-red-600 mb-2">⚠️</div>
                <p className="text-red-600 font-medium">Error loading orders</p>
                <p className="text-stone-500 text-sm mt-1">{errorOrders}</p>
                <Button 
                  onClick={fetchOrders} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg">
                <Package size={48} className="mx-auto text-stone-400 mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">No orders yet</h3>
                <p className="text-stone-500 mb-4">You haven't placed any orders yet. Start shopping to see your orders here.</p>
                <Link to="/user/dashboard">
                  <Button>
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const orderKey = order.id; // Already normalized in fetchOrders
                  const orderStatus = getOrderStatus(order);
                  const isCancellable = orderStatus?.toLowerCase() !== 'completed' && orderStatus?.toLowerCase() !== 'cancelled' && orderStatus?.toLowerCase() !== 'confirmed';
                  const isExpanded = expandedOrders.has(orderKey);
                  
                  return (
                    <div key={orderKey} className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-6 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-stone-900">Order #{orderKey ? orderKey.slice(-8) : 'N/A'}</h4>
                          <p className="text-sm text-stone-500 mt-1">
                            {order.createdAt instanceof Date && !isNaN(order.createdAt) ? order.createdAt.toLocaleString('en-US', {
                              year: 'numeric', month: 'numeric', day: 'numeric',
                              hour: 'numeric', minute: '2-digit', hour12: true
                            }) : 'Date not available'}
                          </p>
                          <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(orderStatus)}`}>
                            {orderStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelOrderClick(order)}
                            disabled={!isCancellable}
                            className={`flex items-center gap-1 ${
                              isCancellable 
                                ? 'text-orange-600 hover:text-orange-700 hover:border-orange-400/80' 
                                : 'text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            <Ban size={14} />
                            Cancel
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleOrderExpansion(orderKey)} className="rounded-full">
                            <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-stone-400/30 animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4 mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-stone-700">Number of People:</h5>
                              <p className="text-sm text-stone-900">{order.people || 'N/A'}</p>
                            </div>
                            {order.requiredByDateTime && (
                              <div>
                                <h5 className="text-sm font-medium text-stone-700">Required By:</h5>
                                <p className="text-sm text-stone-900">
                                  {order.requiredByDateTime.toLocaleString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: 'numeric', minute: '2-digit', hour12: true
                                  })}
                                </p>
                              </div>
                            )}
                            {order.notes && (
                              <div>
                                <h5 className="text-sm font-medium text-stone-700">Special Instructions:</h5>
                                <p className="text-sm text-stone-900 whitespace-pre-wrap">{order.notes}</p>
                              </div>
                            )}
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div className="space-y-3 mb-4 border-t border-stone-400/30 pt-4">
                              <h5 className="text-sm font-medium text-stone-700">Items:</h5>
                                {order.items.map((item, index) => (
                                  <div key={`${orderKey}-item-${index}`} className="flex justify-between items-center py-2 border-b border-stone-400/30 last:border-b-0">
                                    <div>
                                      <span className="text-sm font-medium text-stone-900">{item.name}</span>
                                      <span className="text-xs text-stone-500 ml-2">×{item.quantity}</span>
                                    </div>
                                    <span className="text-sm font-medium text-stone-900">
                                      ₹{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                          
                          {(order.totalAmount || order.totalPrice) && (
                            <div className="flex justify-between items-center pt-4 border-t border-stone-300/50">
                              <span className="text-sm font-medium text-stone-700">Total Amount</span>
                              <span className="text-lg font-bold text-stone-900">
                                ₹{(order.totalAmount || order.totalPrice).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleProfileUpdateSubmit}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
      />
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
}
