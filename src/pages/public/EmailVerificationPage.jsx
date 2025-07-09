import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import bgImage from '@/assets/bg9.jpg';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found. The link may be invalid.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/verify-email?token=${token}`, {
          method: 'POST',
        });
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed.');
        }

        setStatus('success');
        setMessage(data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification.');
      }
    };

    verifyToken();
  }, [searchParams]);

  const renderStatus = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Loader className="animate-spin text-stone-500 mb-4" size={48} />
            <p className="text-stone-600">{message}</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="text-green-500 mb-4" size={48} />
            <p className="text-stone-700 font-medium">{message}</p>
            <Link to="/login" className="mt-6">
              <Button>Proceed to Login</Button>
            </Link>
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="text-red-500 mb-4" size={48} />
            <p className="text-red-700 font-medium">{message}</p>
            <Link to="/register" className="mt-6">
              <Button variant="outline">Try Registering Again</Button>
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-fixed p-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-stone-800 font-great-vibes">Account Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-8">
          {renderStatus()}
        </CardContent>
      </Card>
    </div>
  );
}
