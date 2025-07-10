import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Loader } from 'lucide-react';
import apiClient from '@/services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await apiClient.post('/public/forgot-password', { email });
      const data = response.data;

      if (response.status !== 200) {
        throw new Error(data.message || 'An error occurred.');
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-stone-800 font-great-vibes">Forgot Password?</CardTitle>
        <CardDescription className="text-stone-600 pt-2">
          Enter your email and we'll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
          {message && <p className="text-sm text-green-800 bg-green-500/20 border border-green-500/30 text-center p-3 rounded-md">{message}</p>}
          {error && <p className="text-sm text-red-800 bg-red-500/20 border border-red-500/30 text-center p-3 rounded-md">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-stone-600">
          <Link to="/login" className="font-medium text-stone-800 hover:underline">
            Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
