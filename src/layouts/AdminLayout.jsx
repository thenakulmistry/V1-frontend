// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import bgImage from '@/assets/bg9.jpg';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Floating Navbar */}
      <nav
        className="fixed top-6 left-1/2 z-50 -translate-x-1/2
        flex items-center
        px-4 py-2
        rounded-full
        bg-white/30
        backdrop-blur-xl
        shadow-2xl
        border border-white/40
        max-w-md w-[340px] justify-between"
        style={{ minHeight: '56px' }}
      >
        <div className="flex items-center gap-2">
          <Link to="/admin/dashboard">
            <img src="/logo3.png" alt="Gauri Cooks Logo" className="h-10" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-red-200/50 text-red-800 text-xs rounded-full font-medium">
            {user?.role}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-stone-600 hover:text-stone-800 hover:bg-stone-500/20"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind navbar */}
      <div className="h-[80px]"></div>

      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}