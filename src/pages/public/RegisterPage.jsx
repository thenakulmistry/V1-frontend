// src/pages/public/RegisterPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';

const RegisterPage = () => {
  return (
    <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-stone-800 font-great-vibes">Create an Account</CardTitle>
        <CardDescription className="text-stone-600 pt-2">
          Join us today!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-stone-800 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default RegisterPage;