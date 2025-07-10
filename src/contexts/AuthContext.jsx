import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient'; // Import apiClient

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('authToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    const savedUserString = localStorage.getItem('user'); // Renamed for clarity
    
    if (savedToken && savedUserString && savedRefreshToken) {
      try {
        const savedUser = JSON.parse(savedUserString); // This should now include email and number
        setToken(savedToken);
        setRefreshToken(savedRefreshToken);
        setUser(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (param1, param2, refreshTokenFromLogin) => {
    // param1 can be usernameOrEmail (string) or user object (from OAuth)
    // param2 can be password (string) or accessToken (string from OAuth)
    // refreshTokenFromLogin is the refresh token from either login type
    try {
      let authToken;
      let userData;
      let newRefreshToken;

      if (typeof param1 === 'object' && param1 !== null && typeof param2 === 'string') {
        // This is an OAuth login
        // param1 is the user object from GoogleAuthController
        // param2 is the accessToken from GoogleAuthController
        // console.log('AuthContext: Handling OAuth login');
        userData = param1;
        authToken = param2;
        newRefreshToken = refreshTokenFromLogin; // Passed from OAuth handler
        
        // No API call needed here as authentication was done by the backend's OAuth2 callback
        if (!userData || !authToken || !newRefreshToken) {
            throw new Error('OAuth login data is incomplete.');
        }

      } else if (typeof param1 === 'string' && typeof param2 === 'string') {
        // This is a traditional username/email and password login
        // console.log('AuthContext: Handling username/email and password login');
        const response = await apiClient.post('/public/login', { usernameOrEmail: param1, password: param2 });

        const data = response.data;
        authToken = data.accessToken;
        userData = data.user;
        newRefreshToken = data.refreshToken;

        if (!userData || !authToken || !newRefreshToken) {
            throw new Error('Standard login data is incomplete.');
        }
      } else {
        throw new Error('Invalid login parameters');
      }

      // Store in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(authToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      // Navigate based on role
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial auth state if login fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      const errorMessage = error.response?.data?.message || error.message;
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, username, email, password, number) => { // Add email parameter
    try {
      const response = await apiClient.post('/public/register', { name, username, email, password, number, role: 'USER' });
      const data = response.data;

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate('/login');
  };

  const updateUserContext = (updates) => {
    const updatedUser = { ...user, ...updates }; // This will merge new fields like email, number
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    register,
    logout,
    updateUserContext,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};