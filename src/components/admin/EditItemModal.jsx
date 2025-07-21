import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import Label from '@/components/common/Label';
import { X } from 'lucide-react';

export default function EditItemModal({ item, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    available: true,
    itemType: 'OTHER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price !== null && item.price !== undefined ? String(item.price) : '',
        imageUrl: item.imageUrl || '',
        available: item.available !== null && item.available !== undefined ? item.available : true,
        itemType: item.itemType || 'OTHER',
      });
      setError('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.price.trim()) {
      setError('Name and Price are required.');
      setLoading(false);
      return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
        setError('Price must be a valid non-negative number.');
        setLoading(false);
        return;
    }
    setLoading(true);
    // Explicitly construct the dataToSubmit object to match ItemDTO
    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price), // Ensure price is a number
      imageUrl: formData.imageUrl,
      available: formData.available,
      itemType: formData.itemType,
    };
    // The item ID is passed separately to onSubmit
    const result = await onSubmit(item.id, dataToSubmit); // item.id should be the string ID
    setLoading(false);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-[100] animate-fadeIn transition-colors duration-200">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/40 text-stone-800 shadow-2xl rounded-3xl animate-fadeIn flex flex-col max-h-[90vh]">
        <div className="flex flex-row items-center justify-between p-4 md:p-5 border-b border-stone-300/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-stone-800">Edit Item: {item?.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-stone-500 hover:text-stone-700 hover:bg-white/30">
            <X size={20} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-grow">
            <div>
              <Label htmlFor="edit-item-name" className="text-stone-600">Item Name</Label>
              <InputField id="edit-item-name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter item name" className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500" />
            </div>
            <div>
              <Label htmlFor="edit-item-description" className="text-stone-600">Description</Label>
              <textarea
                id="edit-item-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description"
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-stone-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500 sm:text-sm text-stone-900 placeholder-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-item-price" className="text-stone-600">Price (₹)</Label>
              <InputField id="edit-item-price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="e.g., 10.99" className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500" />
            </div>
            <div>
              <Label htmlFor="edit-item-type" className="text-stone-600">Item Type</Label>
              <select
                id="edit-item-type"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500 sm:text-sm text-stone-900 placeholder-stone-500"
              >
                <option value="SOUP">Soup</option>
                <option value="STARTER">Starter</option>
                <option value="CURRY">Curry</option>
                <option value="RICE">Rice</option>
                <option value="SIDES">Sides</option>
                <option value="SWEET">Sweet</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-item-imageUrl" className="text-stone-600">Image URL (Optional)</Label>
              <InputField id="edit-item-imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500" />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-item-available"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="h-4 w-4 text-stone-600 border-stone-300 rounded focus:ring-stone-500"
              />
              <Label htmlFor="edit-item-available" className="text-stone-600 mb-0">Available for purchase</Label>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-100/70 p-3 rounded-md border border-red-200/70">{error}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 p-4 md:p-5 border-t border-stone-300/50 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="border-stone-400 text-stone-700 hover:bg-stone-500/20">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-stone-800 hover:bg-stone-900 text-white">
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
