// src/features/auth/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField'; // Assuming you'll use InputField
import Label from '@/components/common/Label'; // Assuming you'll use Label
import { Eye, EyeOff, Loader } from 'lucide-react';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [number, setNumber] = useState(''); // Add state for number
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleNumberChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      setNumber(numericValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!name || !username || !email || !password || !confirmPassword || !number) { // Add email and number to check
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (username.includes('@')) {
      setError('Username cannot contain the "@" symbol.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (number.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    const result = await register(name, username, email, password, number); // Pass email and number
    
    if (result.success) {
      navigate(`/login?registered=true&message=${encodeURIComponent(result.message)}`);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <InputField // Using InputField for consistency
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <Label htmlFor="username">Username</Label>
        <InputField
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Choose a username"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <InputField
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <Label htmlFor="number">Phone Number (10 digits)</Label>
        <InputField
          type="tel"
          id="number"
          value={number}
          onChange={handleNumberChange}
          required
          placeholder="Enter your 10-digit phone number"
          maxLength="10" 
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <InputField
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a password (min. 6 characters)"
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

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <InputField
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-500 hover:text-stone-700"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}