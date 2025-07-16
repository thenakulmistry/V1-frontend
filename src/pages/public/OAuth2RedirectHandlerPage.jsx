import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth hook from your AuthContext
import apiClient from '@/services/apiClient'; // Import the new apiClient
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Loader } from 'lucide-react';
import Button from '@/components/common/Button';

// --- IMPORTANT ---
// Adjust this URL to your actual backend API endpoint for the Google OAuth2 callback.
// 1. If your backend API is on a different domain/port (e.g., http://localhost:8080),
//    use the full URL: const OAUTH2_CALLBACK_API_URL = 'http://localhost:8080/api/auth/google/callback';
//    AND ensure your backend has CORS configured to allow requests from your frontend origin.
// 2. If you have VITE_API_BASE_URL in your .env.local (e.g., VITE_API_BASE_URL=http://localhost:8080/api),
//    use: const OAUTH2_CALLBACK_API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/google/callback`;
// 3. If your frontend and backend are served from the same origin, or you have a proxy set up in vite.config.js,
//    a relative path like '/api/auth/google/callback' might work.

// Assuming a common setup where API calls are prefixed with /api and handled by proxy or same origin:
const OAUTH2_CALLBACK_API_URL = `/auth/google/callback`; // MODIFIED to be relative for apiClient

function OAuth2RedirectHandlerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // Assuming your AuthContext provides a login function
  const effectRan = useRef(false); // Ref to track if effect has run

  useEffect(() => {
    // Check if running in development with React.StrictMode
    // or if the effect has already run for other reasons.
    if (process.env.NODE_ENV === 'development' && effectRan.current) {
        // In StrictMode, on the second run, effectRan.current will be true.
        // We only want to proceed if it's the "true" first mount or if effectRan.current is explicitly reset.
        // For this specific one-time code exchange, we simply return on subsequent runs.
        return;
    }

    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Error during OAuth2 authentication: ${errorParam}`);
      setLoading(false);
      return;
    }

    if (!code) {
      setError('No authorization code found in URL.');
      setLoading(false);
      return;
    }

    const exchangeCodeForToken = async (authCode) => {
      try {
        setLoading(true);
        // Send the code to your backend using apiClient
        const apiUrl = `${OAUTH2_CALLBACK_API_URL}?code=${authCode}`;
        // console.log('Attempting to exchange code with backend at:', apiUrl); // For debugging

        const response = await apiClient.get(apiUrl); // Use apiClient.get

        // console.log('Backend response status:', response.status); // For debugging
        // console.log('Backend response data:', response.data); // For debugging

        const data = response.data;
        
        // Assuming your backend returns user data and tokens (accessToken, refreshToken)
        // And your login function handles storing these and updating auth state
        if (data.accessToken && data.user && data.refreshToken) {
          // Await the login function to ensure auth state is updated before navigating
          await login(data.user, data.accessToken, data.refreshToken); // MODIFIED: Pass all data to login
          // Navigation is now handled inside the login function
        } else {
          throw new Error('Invalid response from server during token exchange.');
        }

      } catch (err) {
        console.error('OAuth2 callback error:', err);
        setError(err.message || 'An unexpected error occurred during OAuth2 processing.');
      } finally {
        setLoading(false);
      }
    };

    if (code) { // Only proceed if code exists
        exchangeCodeForToken(code);
    }
    
    // Mark that the effect has run (or attempted to run its core logic)
    if (process.env.NODE_ENV === 'development') {
        effectRan.current = true;
    }

    // No cleanup needed that would re-trigger or invalidate the one-time code logic
  }, [location, navigate, login]); // Dependencies remain the same

  if (loading) {
    return (
      <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Authenticating with Google
          </CardTitle>
          <CardDescription className="text-stone-600 pt-2">
            Please wait while we securely sign you in.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader className="h-12 w-12 text-stone-700 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-stone-600 pt-2">
            Something went wrong during the sign-in process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
          <Button asChild className="w-full">
            <Link to="/login">Go back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Should ideally not reach here if navigation occurs successfully
  return null; // Return null to avoid rendering default text
}

export default OAuth2RedirectHandlerPage;
