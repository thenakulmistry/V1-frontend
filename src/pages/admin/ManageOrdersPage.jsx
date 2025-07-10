import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, ArrowLeft, Edit3, Eye } from 'lucide-react';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import EditOrderDetailsModal from '@/components/admin/EditOrderDetailsModal'; // Renamed import
import OrderDetailsModal from '@/components/admin/OrderDetailsModal'; // Import the new modal
import Notification from '@/components/common/Notification';
import apiClient from '@/services/apiClient';

// Helper to normalize MongoDB ObjectId (consistent with other pages)
const normalizeId = (id) => {
  if (id === null || id === undefined) return String(id);
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id.$oid && typeof id.$oid === 'string') return id.$oid;
  return String(id); // Fallback
};

// Helper to parse date values which might be strings, numbers, or common object/array representations
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

  console.warn('ManageOrdersPage: Failed to parse date:', dateInput);
  return null; 
};

export default function ManageOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Renamed state
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null); // Renamed state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 
  const [selectedOrderForView, setSelectedOrderForView] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/orders');
      let data = response.data;
      // Normalize IDs, parse dates, ensure status, and use username
      data = Array.isArray(data) ? data.map(order => ({ 
        ...order, 
        id: normalizeId(order.id),
        createdAt: parseClientDate(order.createdAt), 
        requiredByDateTime: parseClientDate(order.requiredByDateTime),
        status: order.status || "Pending",
        // username should now be directly available from the backend
      })) : [];

      // Sort orders by status (Completed last), then by creation date (newest first)
      const statusOrder = { 'Completed': 1, 'Cancelled': 1 }; // Lower priority
      data.sort((a, b) => {
        const statusA = statusOrder[a.status] || 0;
        const statusB = statusOrder[b.status] || 0;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });
      
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (order) => { // Renamed handler
    setSelectedOrderForEdit(order);
    setIsEditModalOpen(true);
  };

  const handleEditOrderSubmit = async (orderId, orderData) => { // Renamed and updated handler
    try {
      await apiClient.put(`/admin/order/${orderId}`, orderData);
      setNotification({ show: true, message: 'Order updated successfully.', type: 'success' });
      fetchOrders(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error updating order:', err);
      setNotification({ show: true, message: `Error updating order: ${err.response?.data?.message || err.message}`, type: 'error' });
      return { success: false, error: err.message };
    }
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-200/70 text-green-900';
      case 'pending': return 'bg-yellow-200/70 text-yellow-900';
      case 'confirmed': return 'bg-blue-200/70 text-blue-900';
      case 'preparing': return 'bg-indigo-200/70 text-indigo-900';
      case 'out for delivery': return 'bg-purple-200/70 text-purple-900';
      case 'cancelled': return 'bg-red-200/70 text-red-900';
      default: return 'bg-stone-200/70 text-stone-900';
    }
  };

  // Placeholder for viewing order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrderForView(order);
    setIsViewModalOpen(true);
  };

  const filteredOrders = orders.filter(order =>
    order.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOrders = filteredOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
  const archivedOrders = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-stone-700 hover:text-stone-900">
              <ArrowLeft size={16} /> Back to Admin Dashboard
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <InputField
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/20 backdrop-blur-sm border-white/30 w-full sm:w-64"
            />
          </div>
        </div>

        {loading && <p className="text-center text-stone-600 py-10">Loading orders...</p>}
        {error && <p className="text-center text-red-600 bg-red-100/70 p-4 rounded-md border border-red-200/70">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="space-y-8">
            {filteredOrders.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-4 text-center py-10">
                <p className="text-stone-500">{searchQuery ? 'No orders found for this user.' : 'No orders found.'}</p>
              </div>
            ) : (
              <>
                {/* Active Orders */}
                {activeOrders.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-4">
                    <h2 className="text-3xl font-great-vibes text-stone-800 mb-4 px-2">Active Orders ({activeOrders.length})</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-stone-400/30">
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider bg-yellow-200/50">Required By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Total Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">People</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeOrders.map((order) => (
                            <tr key={order.id} className="border-b border-stone-400/30 last:border-b-0 hover:bg-white/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">#{order.id.slice(-8)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">{order.username || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {order.createdAt ? order.createdAt.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700 bg-yellow-100/70 font-medium">
                                {order.requiredByDateTime ? order.requiredByDateTime.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">₹{order.totalPrice?.toFixed(2) || '0.00'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700 text-center">{order.people || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => handleViewOrderDetails(order)} className="text-stone-600 hover:text-stone-800 p-1" title="View Details">
                                    <Eye size={16}/>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(order)} className="text-stone-600 hover:text-stone-800 p-1" title="Edit Order">
                                  <Edit3 size={16}/>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Archived Orders */}
                {archivedOrders.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-4">
                    <h2 className="text-3xl font-great-vibes text-stone-800 mb-4 px-2">Archived Orders ({archivedOrders.length})</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-stone-400/30">
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Required By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Total Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {archivedOrders.map((order) => (
                            <tr key={order.id} className="border-b border-stone-400/30 last:border-b-0 hover:bg-white/10 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">#{order.id.slice(-8)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">{order.username || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {order.createdAt ? order.createdAt.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">
                                {order.requiredByDateTime ? order.requiredByDateTime.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">₹{order.totalPrice?.toFixed(2) || '0.00'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => handleViewOrderDetails(order)} className="text-stone-600 hover:text-stone-800 p-1" title="View Details">
                                    <Eye size={16}/>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(order)} className="text-stone-600 hover:text-stone-800 p-1" title="Edit Order">
                                  <Edit3 size={16}/>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && selectedOrderForEdit && ( // Updated modal invocation
        <EditOrderDetailsModal
          order={selectedOrderForEdit}
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedOrderForEdit(null); }}
          onSubmit={handleEditOrderSubmit}
        />
      )}

      {isViewModalOpen && selectedOrderForView && (
        <OrderDetailsModal
          order={selectedOrderForView}
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedOrderForView(null); }}
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
