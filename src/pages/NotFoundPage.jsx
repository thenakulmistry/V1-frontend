// src/pages/NotFoundPage.jsx (Corrected for our Button)
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button'; // Assuming you have a Button component

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 className="text-9xl font-extrabold text-indigo-600 tracking-wider">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Oops! The page you are looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Link to="/">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}