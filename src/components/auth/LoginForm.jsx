import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Label from '@/components/common/Label';

// Ensure VITE_GOOGLE_CLIENT_ID is set in your .env file (e.g., .env.local)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Corrected this line
// The redirect URI must match exactly what you've configured in your Google Cloud Console
const REDIRECT_URI = `${window.location.origin}/oauth2/redirect`;

export default function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(usernameOrEmail, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Client ID is not configured. Please contact support.");
      console.error("VITE_GOOGLE_CLIENT_ID is not set in environment variables.");
      return;
    }
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="usernameOrEmail">Username or Email</Label>
          <InputField
            id="usernameOrEmail"
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder="Enter your username or email"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <InputField
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-500 hover:text-stone-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
        </div>

        <div className="text-sm text-right">
          <Link to="/forgot-password" className="font-medium text-stone-800 hover:underline">
            Forgot your password?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center p-2 rounded-md">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-stone-400/60"></div>
        <span className="flex-shrink mx-4 text-stone-600 text-xs uppercase">
          OR
        </span>
        <div className="flex-grow border-t border-stone-400/60"></div>
      </div>

      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full"
        type="button"
      >
        {/* You can add a Google icon here */}
        Sign in with Google
      </Button>
    </div>
  );
}
