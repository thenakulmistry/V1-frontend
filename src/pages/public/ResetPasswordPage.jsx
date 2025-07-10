import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import Label from '@/components/common/Label';
import apiClient from '@/services/apiClient';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3e3cb]">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>Invalid or missing password reset token.</p>
            <Link to="/login">
              <Button variant="primary" size="default" className="mt-2">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await apiClient.post('/public/reset-password', { token, password });
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
    <div className="min-h-screen flex items-center justify-center bg-[#f3e3cb]">
      <Card className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-center text-stone-900 font-great-vibes">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="text-center mt-4 space-y-4">
              <p className="text-green-800 bg-green-500/20 border border-green-500/30 p-3 rounded-md text-lg">{message}</p>
              <Link to="/login">
                <Button variant="primary" size="default" className="mt-2">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
              <div>
                <Label htmlFor="password">New Password</Label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none rounded-md block w-full px-3 py-2 border border-stone-300 bg-white/50 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-stone-500 focus:border-stone-500 sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none rounded-md block w-full px-3 py-2 border border-stone-300 bg-white/50 placeholder-stone-500 text-stone-900 focus:outline-none focus:ring-stone-500 focus:border-stone-500 sm:text-sm"
                />
              </div>
              {error && <p className="text-red-800 bg-red-500/20 border border-red-500/30 text-sm text-center p-3 rounded-md">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
