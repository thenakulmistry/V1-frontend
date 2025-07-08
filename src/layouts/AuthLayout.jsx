// src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import bgImage from '@/assets/bg9.jpg';

const AuthLayout = () => {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <main className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center md:space-x-12">
        
        {/* Left side: Logo and Title */}
        <div className="flex-shrink-0 w-full md:w-1/2 flex flex-col items-center justify-center text-center p-8">
          <img src="/logo2.png" alt="Gauri Cooks Logo" className="w-48 md:w-80 mb-4" />
          <p className="text-stone-600 mt-2 text-2xl hidden md:block font-great-vibes">
            Deliciously homemade, just for you
          </p>
        </div>

        {/* Right side: The form card */}
        <div className="w-full max-w-md md:max-w-sm">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default AuthLayout;