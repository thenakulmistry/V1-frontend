// src/pages/public/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import Notification from '@/components/common/Notification';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      const message = searchParams.get('message') || 'Registration successful! Please check your email to verify your account.';
      setNotification({ show: true, message: message, type: 'success' });
    }
  }, [searchParams]);

  return (
    <>
      <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-stone-800 font-great-vibes">Welcome Back</CardTitle>
          <CardDescription className="text-stone-600 pt-2">
            Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-stone-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-stone-800 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}
    </>
  );
};

export default LoginPage;