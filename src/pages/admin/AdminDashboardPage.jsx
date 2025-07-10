// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useAuth } from '@/contexts/AuthContext';
import { Users, Package, ShoppingBag } from 'lucide-react';
import Button from '@/components/common/Button';
import apiClient from '@/services/apiClient';

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      // Fetch users, items, and orders counts in parallel
      const [usersResponse, itemsResponse, ordersResponse] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/items'),
        apiClient.get('/admin/orders')
      ]);

      const users = usersResponse.data;
      const items = itemsResponse.data;
      const orders = ordersResponse.data;
      
      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalItems: Array.isArray(items) ? items.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-6 flex items-center justify-center min-h-[100px]">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-stone-700" />
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Total Users</p>
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '...' : stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Total Items Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-6 flex items-center justify-center min-h-[100px]">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-stone-700" />
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Total Items</p>
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '...' : stats.totalItems}
              </p>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-6 flex items-center justify-center min-h-[100px]">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-stone-700" />
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Total Orders</p>
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '...' : stats.totalOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/users">
          <Button className="w-full bg-stone-800 hover:bg-stone-900 text-white p-4 h-auto flex flex-col items-center gap-2">
            <Users size={24} />
            Manage Users
          </Button>
        </Link>
        <Link to="/admin/items">
          <Button className="w-full bg-stone-800 hover:bg-stone-900 text-white p-4 h-auto flex flex-col items-center gap-2">
            <Package size={24} />
            Manage Items
          </Button>
        </Link>
        <Link to="/admin/orders">
          <Button className="w-full bg-stone-800 hover:bg-stone-900 text-white p-4 h-auto flex flex-col items-center gap-2">
            <ShoppingBag size={24} />
            Manage Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}