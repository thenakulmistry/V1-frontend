import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import Label from '@/components/common/Label';
import { X } from 'lucide-react';

export default function EditUserModal({ user, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    number: '',
    role: 'USER', // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        number: user.number ? String(user.number) : '',
        role: user.role || 'USER',
      });
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.number && formData.number.length > 0 && formData.number.length !== 10) {
      setError('Phone number must be exactly 10 digits if provided.');
      setLoading(false);
      return;
    }

    const dataToSubmit = {
      name: formData.name,
      email: formData.email,
      number: formData.number ? parseInt(formData.number, 10) : null,
      role: formData.role,
    };
    
    const payload = Object.fromEntries(Object.entries(dataToSubmit).filter(([_, v]) => v !== null));

    const result = await onSubmit(user.username, payload); // Pass username and payload
    setLoading(false);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-[100] animate-fadeIn transition-colors duration-200">
      <div className="w-full max-w-lg bg-white/30 backdrop-blur-xl border border-white/40 text-stone-800 shadow-2xl rounded-3xl animate-fadeIn flex flex-col max-h-[90vh]">
        <div className="flex flex-row items-center justify-between p-4 md:p-5 border-b border-stone-300/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-stone-800">Edit User: {user?.username}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-stone-500 hover:text-stone-700 hover:bg-white/30">
            <X size={20} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-grow">
            <div>
              <Label htmlFor="edit-name" className="text-stone-600">Full Name</Label>
              <InputField
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-username" className="text-stone-600">Username</Label>
              <InputField
                id="edit-username"
                name="username"
                value={formData.username}
                readOnly
                className="bg-stone-200/60 border-stone-300 text-stone-700 cursor-not-allowed placeholder-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-email" className="text-stone-600">Email Address</Label>
              <InputField
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-number" className="text-stone-600">Phone Number</Label>
              <InputField
                id="edit-number"
                name="number"
                type="tel"
                value={formData.number}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-role" className="text-stone-600">Role</Label>
              <select
                id="edit-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500 sm:text-sm text-stone-900"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
