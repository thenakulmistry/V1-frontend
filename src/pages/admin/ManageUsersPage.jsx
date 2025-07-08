import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Trash2, Edit3, UserPlus } from 'lucide-react';
import Button from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import EditUserModal from '@/components/admin/EditUserModal';
import AddAdminModal from '@/components/admin/AddAdminModal'; // Import AddAdminModal
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Notification from '@/components/common/Notification';

export default function ManageUsersPage() {
  const { token, user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false); // State for AddAdminModal
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    if (adminUser?.username === user.username) {
      setNotification({ show: true, message: "You cannot delete your own account.", type: 'error' });
      return;
    }
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/user/${userToDelete.username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete user: ${errorData || response.statusText}`);
      }
      setNotification({ show: true, message: 'User deleted successfully.', type: 'success' });
      fetchUsers(); // Refresh the list
    } catch (err) {
      setNotification({ show: true, message: `Error deleting user: ${err.message}`, type: 'error' });
      console.error(err);
    } finally {
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };
  
  const handleOpenEditModal = (userToEdit) => {
    if (adminUser?.username === userToEdit.username && userToEdit.role === 'ADMIN') {
        setNotification({ show: true, message: "You cannot change your own role. Other details can be edited.", type: 'info' });
    }
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUserSubmit = async (usernameToUpdate, updatedData) => {
    // Prevent admin from changing their own role to USER
    if (adminUser?.username === usernameToUpdate && updatedData.role === 'USER' && adminUser?.role === 'ADMIN') {
        return { success: false, error: "You cannot change your own role from ADMIN to USER." };
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/user/${usernameToUpdate}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ message: 'Update failed' }));
        throw new Error(errorResult.message || `Failed to update user: ${response.statusText}`);
      }
      setNotification({ show: true, message: 'User updated successfully.', type: 'success' });
      fetchUsers(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, error: err.message };
    }
  };

  const handleOpenAddAdminModal = () => {
    setIsAddAdminModalOpen(true);
  };

  const handleCloseAddAdminModal = () => {
    setIsAddAdminModalOpen(false);
  };

  const handleAddAdminSubmit = async (adminData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/add_admin`, { // Endpoint for adding admin
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData), // UserDTO for new admin
      });
      if (!response.ok) {
        // Try to parse error message from backend if available
        let errorMsg = `Failed to add admin: ${response.statusText}`;
        try {
            const errorResult = await response.json();
            errorMsg = errorResult.message || errorMsg;
        } catch (e) {
            // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
      }
      setNotification({ show: true, message: 'Admin added successfully.', type: 'success' });
      fetchUsers(); // Refresh the user list
      return { success: true };
    } catch (err) {
      console.error('Error adding admin:', err);
      return { success: false, error: err.message };
    }
  };


  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-stone-700 hover:text-stone-900 mb-2 sm:mb-0">
              <ArrowLeft size={16} />
              Back to Admin Dashboard
            </Button>
          </Link>
          <Button 
            onClick={handleOpenAddAdminModal} // Changed to open AddAdminModal
            className="mt-4 sm:mt-0 bg-stone-800 hover:bg-stone-900 text-white flex items-center gap-2" // Changed color for distinction
          >
            <UserPlus size={18} />
            Add New Admin 
          </Button>
        </div>

        {loading && <p className="text-center text-stone-600 py-10">Loading users...</p>}
        {error && <p className="text-center text-red-600 bg-red-100/70 p-4 rounded-md border border-red-200/70">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-4">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-semibold text-stone-800">All Users ({users.length})</h2>
            </div>
            <div>
              {users.length === 0 ? (
                <p className="text-stone-500 py-10 text-center">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-stone-400/30">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Username</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id?.$oid || user.id || user.username} className="border-b border-stone-400/30 last:border-b-0 hover:bg-white/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">{user.email || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700">{user.number || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-200/70 text-red-900' : 'bg-green-200/70 text-green-900'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(user)} className="text-stone-600 hover:text-stone-800 p-1">
                              <Edit3 size={16}/>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteUser(user)} 
                              className="text-orange-600 hover:text-orange-800 p-1"
                              disabled={adminUser?.username === user.username} // Disable delete for self
                            >
                               <Trash2 size={16}/>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isEditModalOpen && editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateUserSubmit}
        />
      )}
      {isAddAdminModalOpen && (
        <AddAdminModal
          isOpen={isAddAdminModalOpen}
          onClose={handleCloseAddAdminModal}
          onSubmit={handleAddAdminSubmit}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmDeleteUser}
          title="Confirm Deletion"
          message={`Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`}
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
