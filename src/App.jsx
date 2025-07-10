import React, { useEffect} from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

{ /* Importing auth pages */ }
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import EmailVerificationPage from '@/pages/public/EmailVerificationPage'
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/public/ResetPasswordPage';
import OAuth2RedirectHandlerPage from '@/pages/public/OAuth2RedirectHandlerPage';

{ /* Importing layouts */ }
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import AdminLayout from '@/layouts/AdminLayout';

{ /* Importing admin pages */ }
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import ManageUsersPage from '@/pages/admin/ManageUsersPage';
import ManageItemsPage from '@/pages/admin/ManageItemsPage';
import ManageOrdersPage from '@/pages/admin/ManageOrdersPage';

{ /* Importing user pages */ }
import ProfilePage from '@/pages/user/ProfilePage';
import UserDashboardPage from '@/pages/user/UserDashboardPage';

{ /* Importing route protection components */ }
import { ProtectedRoute, AdminProtectedRoute } from './router/ProtectedRoute';

{ /* Other imports */ }
import NotFoundPage from '@/pages/NotFoundPage';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Optional: disable to prevent too many refetches
    },
  },
});

function RootRedirect() {
  const { user, token } = useAuth();
  if (token && user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

function AppContent() {
  const { logout } = useAuth();
  useEffect(() => {
    const handleLogout = () => {
      console.log("Auth error detected, logging out...");
      logout();
    };

    window.addEventListener('auth-error-logout', handleLogout);

    return () => {
      window.removeEventListener('auth-error-logout', handleLogout);
    };
  } , [logout]);

  return (
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="verify-email" element={<EmailVerificationPage />} />
            </Route>

            {/* OAuth2 Redirect Handler Route */}
            <Route path="oauth2/redirect" element={<OAuth2RedirectHandlerPage />} />
            
            {/* User Routes */}
            <Route path="user" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<UserDashboardPage />} />
              <Route path='profile' element={<ProfilePage />} />
              {/* ... other user routes */}
            </Route>

            {/* Admin Routes */}
            <Route path="admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path = "users" element = {<ManageUsersPage />} />
              <Route path = "items" element = {<ManageItemsPage />} />
              <Route path = "orders" element = {<ManageOrdersPage />} />
              {/* ... other admin routes */}
            </Route>

            {/* Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
  );
}

function App() {
  return (
    // <QueryClientProvider client={queryClient}>
    //   <ReactQueryDevtools initialIsOpen={false} />
    //   <AuthProvider>
    //     <BrowserRouter>
    //       <AppContent />
    //     </BrowserRouter>
    //   </AuthProvider>
    // </QueryClientProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;