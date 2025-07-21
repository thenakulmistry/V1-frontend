import React, { useState } from 'react';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import Label from '@/components/common/Label';
import { X } from 'lucide-react';

export default function AddAdminModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    number: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!formData.name.trim() || !formData.username.trim() || !formData.password) {
      setError('Name, Username, and Password are required.');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }
    if (formData.number && formData.number.length !== 10) {
      setError('Phone number must be exactly 10 digits if provided.');
      setLoading(false);
      return;
    }

    const dataToSubmit = {
      name: formData.name,
      username: formData.username,
      password: formData.password,
      email: formData.email || null, // Send null if empty
      number: formData.number ? parseInt(formData.number, 10) : null, // Send null if empty
    };
    
    const payload = Object.fromEntries(Object.entries(dataToSubmit).filter(([_, v]) => v !== null));

    const result = await onSubmit(payload);
    setLoading(false);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.success) {
      onClose(); // Close modal on success
      setFormData({ name: '', username: '', password: '', confirmPassword: '', email: '', number: '' }); // Reset form
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-[100] animate-fadeIn transition-colors duration-200">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/40 text-stone-800 shadow-2xl rounded-3xl animate-fadeIn flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-stone-300/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-stone-800">Add New Admin</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-stone-500 hover:text-stone-700 hover:bg-white/30">
            <X size={20} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-grow">
            <div>
              <Label htmlFor="add-admin-name" className="text-stone-600">Full Name</Label>
              <InputField
                id="add-admin-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="add-admin-username" className="text-stone-600">Username</Label>
              <InputField
                id="add-admin-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="add-admin-password" className="text-stone-600">Password</Label>
              <InputField
                id="add-admin-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="add-admin-confirmPassword" className="text-stone-600">Confirm Password</Label>
              <InputField
                id="add-admin-confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="add-admin-email" className="text-stone-600">Email Address (Optional)</Label>
              <InputField
                id="add-admin-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="add-admin-number" className="text-stone-600">Phone Number (Optional, 10 digits)</Label>
              <InputField
                id="add-admin-number"
                name="number"
                type="tel"
                value={formData.number}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
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
              {loading ? 'Adding Admin...' : 'Add Admin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
