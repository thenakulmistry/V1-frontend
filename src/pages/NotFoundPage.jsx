// src/pages/NotFoundPage.jsx (Corrected for our Button)
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button'; // Assuming you have a Button component
import bgImage from '@/assets/bg9.jpg'; // Import the background image

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-fixed p-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
        <h1 className="text-9xl font-black text-stone-800 tracking-wider font-great-vibes">404</h1>
        <h2 className="text-3xl font-semibold text-stone-700 mt-4 mb-2">Page Not Found</h2>
        <p className="text-stone-600 mb-8 max-w-md italic">
          Oops! The page you are looking for doesn't exist. It might have been moved or deleted.
        </p>
        <Link to="/">
          <Button className="text-lg px-6 py-3">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}