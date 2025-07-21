import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import Label from '@/components/common/Label';
import { Trash2, X } from 'lucide-react'; // Removed PlusCircle, MinusCircle

const ORDER_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

export default function EditOrderDetailsModal({ order, isOpen, onClose, onSubmit }) {
  const [editedItems, setEditedItems] = useState([]);
  const [editedPeople, setEditedPeople] = useState(0);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedRequiredByDateTime, setEditedRequiredByDateTime] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);

  const calculateTotal = useCallback((items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, []);

  useEffect(() => {
    if (order && isOpen) { // Ensure reset only when opening and order is present
      setEditedItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);
      setEditedPeople(order.people || 1);
      setEditedStatus(order.status || 'Pending');
      setEditedNotes(order.notes || '');
      if (order.requiredByDateTime) {
        const d = order.requiredByDateTime;
        const pad = (num) => num.toString().padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setEditedRequiredByDateTime(formatted);
      } else {
        setEditedRequiredByDateTime('');
      }
    }
  }, [order, isOpen]);

  useEffect(() => {
    setCalculatedTotalPrice(calculateTotal(editedItems));
  }, [editedItems, calculateTotal]);

  const handleItemQuantityChange = (index, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity, 10) || 1);
    const updatedItems = editedItems.map((item, i) =>
      i === index ? { ...item, quantity } : item
    );
    setEditedItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;

    const orderData = {
      items: editedItems,
      people: parseInt(editedPeople, 10) || 1,
      totalPrice: calculatedTotalPrice,
      status: editedStatus,
      requiredByDateTime: editedRequiredByDateTime || null,
      notes: editedNotes,
    };
    
    const result = await onSubmit(order.id, orderData);
    if (result && result.success) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const formattedDate = order.createdAt
    ? order.createdAt.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : 'N/A';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 animate-fadeIn transition-colors duration-200"
    >
      <div 
        className="bg-white/80 backdrop-blur-xl border border-white/40 text-stone-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-stone-300/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-stone-800">
            Edit Order Details - ID: #{order.id?.slice(-8)}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 hover:bg-white/30 rounded-full"
          >
            <X size={20} />
            <span className="sr-only">Close modal</span>
          </Button>
        </div>

        {/* Modal Body - Form wrapper removed */}
        <div className="p-4 md:p-5 space-y-6 overflow-y-auto flex-grow">
          {/* Order Info Display Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-xs font-medium text-stone-500">Order ID</Label>
              <p className="text-sm text-stone-900 font-semibold">#{order.id?.slice(-8)}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-stone-500">Username</Label>
              <p className="text-sm text-stone-900">{order.username || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-stone-500">Created At</Label>
              <p className="text-sm text-stone-900">{formattedDate}</p>
            </div>
          </div>

          {/* Items Section - Editable */}
          <div>
            <h3 className="text-md font-semibold mb-2 block text-stone-700">Order Items</h3>
            {editedItems.length === 0 ? (
              <p className="text-stone-500">No items in this order.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto pr-2">
                {editedItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 py-3 border-b border-stone-300/50 last:border-b-0">
                    <div className="flex-grow">
                      <p className="font-medium text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">Unit Price: ₹{item.price?.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center">
                      <InputField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                        className="w-16 text-center h-8 text-sm bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
                        min="1"
                      />
                    </div>
                    <p className="w-24 text-right font-medium text-stone-700 text-sm">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 w-7 h-7" title="Remove Item">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* People, Status, and Required By Section - Editable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-300/50 mt-4">
            <div>
              <Label htmlFor="people" className="font-medium text-stone-700">Number of People</Label>
              <InputField
                id="people"
                type="number"
                value={editedPeople}
                onChange={(e) => setEditedPeople(Math.max(1, parseInt(e.target.value,10) || 1))}
                min="1"
                className="mt-1 w-full bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="status" className="font-medium text-stone-700">Order Status</Label>
              <select
                id="status"
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 bg-stone-50 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500 sm:text-sm text-stone-900"
              >
                {ORDER_STATUSES.map((statusVal) => (
                  <option key={statusVal} value={statusVal}>
                    {statusVal}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4">
            <Label htmlFor="requiredByDateTime" className="font-medium text-stone-700">Required By</Label>
            <InputField
              id="requiredByDateTime"
              type="datetime-local"
              value={editedRequiredByDateTime}
              onChange={(e) => setEditedRequiredByDateTime(e.target.value)}
              className="mt-1 w-full bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>
          <div className="pt-4">
            <Label htmlFor="notes" className="font-medium text-stone-700">Special Instructions</Label>
            <textarea
              id="notes"
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              rows="3"
              className="mt-1 w-full p-2 border bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500 rounded-md shadow-sm sm:text-sm"
              placeholder="Customer notes or special requests..."
            ></textarea>
          </div>
          
          {/* Total Price Display */}
          <div className="pt-6 border-t border-stone-300/50 mt-4">
            <div className="flex justify-end items-baseline">
              <span className="text-lg font-semibold text-stone-700 mr-2">Total Order Price:</span>
              <span className="text-2xl font-bold text-stone-900">₹{calculatedTotalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 md:p-5 border-t border-stone-300/50 flex-shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="mr-2 border-stone-400 text-stone-700 hover:bg-stone-500/20">Cancel</Button>
          <Button type="button" onClick={handleSubmit} className="bg-stone-800 hover:bg-stone-900 text-white">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
