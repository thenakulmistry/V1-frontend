// src/pages/public/LoginPage.jsx
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered');
  const loginSuccess = searchParams.get('loginSuccess');

  return (
    <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-stone-800 font-great-vibes">Welcome Back</CardTitle>
        <CardDescription className="text-stone-600 pt-2">Log in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        {registered && (
          <div className="mb-4 p-3 bg-green-500/20 text-green-800 border border-green-500/30 rounded-md">
            Registration successful! Please log in.
          </div>
        )}
        {loginSuccess && (
          <div className="mb-4 p-3 bg-blue-500/20 text-blue-800 border border-blue-500/30 rounded-md">
            Login successful! Redirecting to dashboard...
          </div>
        )}
        <LoginForm />
        <p className="mt-6 text-center text-sm text-stone-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-stone-800 hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginPage;