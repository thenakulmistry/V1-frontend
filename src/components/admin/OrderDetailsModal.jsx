import React from 'react';
import { X } from 'lucide-react';
import Button from '@/components/common/Button';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-200/70 text-green-900';
      case 'pending': return 'bg-yellow-200/70 text-yellow-900';
      case 'confirmed': return 'bg-blue-200/70 text-blue-900';
      case 'cancelled': return 'bg-red-200/70 text-red-900';
      default: return 'bg-stone-200/70 text-stone-900';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 transition-colors duration-200">
      <div className="bg-white/30 backdrop-blur-xl border border-white/40 text-stone-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-stone-300/50">
          <h2 className="text-xl font-semibold text-stone-800">
            Order Details: #{order.id ? order.id.slice(-8) : 'N/A'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-stone-500 hover:text-stone-700 hover:bg-white/30 rounded-full">
            <X size={20} />
          </Button>
        </div>

        <div className="flex-grow p-4 md:p-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-1">Username</h3>
              <p className="text-stone-800 font-medium">{order.username || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-1">Created At</h3>
              <p className="text-stone-800">
                {order.createdAt
                  ? order.createdAt.toLocaleString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-1">Total Price</h3>
              <p className="text-stone-800 font-semibold">₹{order.totalPrice?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-1">Number of People</h3>
              <p className="text-stone-800">{order.people || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-1">Required By</h3>
              <p className="text-stone-800">
                {order.requiredByDateTime
                  ? order.requiredByDateTime.toLocaleString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-1">Status</h3>
              <p>
                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status || 'N/A'}
                </span>
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Special Instructions</h3>
              <p className="text-stone-800 whitespace-pre-wrap bg-stone-100/50 p-3 rounded-md border border-stone-300/50">{order.notes}</p>
            </div>
          )}

          <h3 className="text-lg font-semibold text-stone-700 mb-3 pt-4 border-t border-stone-300/50">Items Ordered</h3>
          {order.items && order.items.length > 0 ? (
            <div className="max-h-60 overflow-y-auto pr-2">
              {order.items.map((item, index) => (
                <div key={item.itemId || index} className="py-3 border-b border-stone-300/50 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-stone-800">{item.name || 'Unknown Item'}</p>
                    <p className="text-sm text-stone-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-stone-500">
                    Quantity: {item.quantity} × ₹{item.price?.toFixed(2)}/item
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500">No items found in this order.</p>
          )}
        </div>

        <div className="p-4 md:p-5 border-t border-stone-300/50 flex justify-end">
          <Button variant="outline" onClick={onClose} className="border-stone-400 text-stone-700 hover:bg-stone-500/20">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
