// src/router/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// General protected route for any authenticated user
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Optional: A loading spinner or message while auth state is being determined
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If the user is an ADMIN, redirect them from general user routes to their admin dashboard
  if (user?.role === 'ADMIN') {
     // If children are provided (meaning it's used like <ProtectedRoute><SpecificAdminPage/></ProtectedRoute>)
     // and we are trying to access a generic user route, this logic might need adjustment
     // based on whether admin should ever see user routes.
     // For now, if an admin lands on a generic protected route, send to admin dash.
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If children are passed directly (e.g. <ProtectedRoute><AppLayout/></ProtectedRoute>), render them.
  // If AppLayout then uses <Outlet/>, that will render the specific child route.
  return children ? children : <Outlet />;
};

// Admin-specific protected route
export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/user/dashboard" replace />; // Or to a "not authorized" page
  }

  return children ? children : <Outlet />;
};