import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import Label from '@/components/common/Label';
import { X } from 'lucide-react';
import apiClient from '@/services/apiClient'; // Import apiClient

export default function EditProfileModal({ user, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    number: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        username: user.username || '', // Username is typically not editable
        email: user.email || '',
        number: user.number ? String(user.number) : '', // Ensure number is string for input field
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setError(''); // Clear previous errors when modal opens
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let profileUpdated = false;
    let passwordChanged = false;

    try {
      // --- Profile Update Logic ---
      if (formData.name !== user.name || formData.email !== user.email || String(formData.number || '') !== String(user.number || '')) {
        if (!formData.name.trim()) {
          throw new Error('Name cannot be empty.');
        }
        if (formData.number && formData.number.length !== 10) {
          throw new Error('Phone number must be exactly 10 digits.');
        }
        const payload = { name: formData.name, email: formData.email, number: formData.number ? parseInt(formData.number, 10) : null };
        const result = await onSubmit(payload);
        if (result && result.error) throw new Error(result.error);
        profileUpdated = true;
      }

      // --- Password Change Logic ---
      if (passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
          throw new Error('New passwords do not match.');
        }
        if (!passwordData.currentPassword) {
          throw new Error('Current password is required to set a new one.');
        }
        await apiClient.put('/user/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
        passwordChanged = true;
      }

      if (profileUpdated || passwordChanged) {
        onClose(); // Close modal on success
      } else {
        setError("No changes were made.");
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-[100] animate-fadeIn transition-colors duration-200">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/40 text-stone-800 shadow-2xl rounded-3xl animate-fadeIn flex flex-col max-h-[90vh]">
        <div className="flex flex-row items-center justify-between p-4 md:p-5 border-b border-stone-300/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-stone-800">Edit Profile</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-stone-500 hover:text-stone-700 hover:bg-white/30"
          >
            <X size={20} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-grow">
            <div>
              <Label htmlFor="name" className="text-stone-600">Full Name</Label>
              <InputField
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="username" className="text-stone-600">Username</Label>
              <InputField
                id="username"
                name="username"
                value={formData.username}
                readOnly
                className="bg-stone-200/60 border-stone-300 text-stone-700 cursor-not-allowed placeholder-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-stone-600">Email Address</Label>
              <InputField
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            <div>
              <Label htmlFor="number" className="text-stone-600">Phone Number</Label>
              <InputField
                id="number"
                name="number"
                type="tel"
                value={formData.number}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>
            
            <div className="border-t border-stone-400/30 pt-4 space-y-4">
                <h3 className="text-lg font-medium text-stone-700">Change Password</h3>
                <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <InputField
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500"
                    />
                </div>
                <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <InputField
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter a new password"
                        className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500"
                    />
                </div>
                <div>
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <InputField
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm the new password"
                        className="bg-white/50 border-stone-300 text-stone-900 placeholder-stone-500"
                    />
                </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-100/70 p-3 rounded-md border border-red-200/70">{error}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 p-4 md:p-5 border-t border-stone-300/50 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-stone-400 text-stone-700 hover:bg-stone-500/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-stone-800 hover:bg-stone-900 text-white"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
