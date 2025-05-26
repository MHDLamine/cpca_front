import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPageLayout from '../components/layout/AuthPageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import '../auth.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms & Conditions');
      return;
    }
    setIsLoading(true);
    try {
      await register(username, email, password, 'candidate');
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create your account</h2>
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <Input
          label="Name"
          placeholder="Your name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <Input
          label="E-mail Address"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <div className="flex items-center gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={e => setAcceptTerms(e.target.checked)}
            className="accent-blue-600 h-4 w-4 rounded border-gray-300"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-700 select-none">
            I accept the <a href="#" className="text-blue-600 underline">Terms & Conditions</a>
          </label>
        </div>
        {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
        <div className="flex flex-col gap-3 mt-2">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign Up
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>
      </form>
    </AuthPageLayout>
  );
};

export default Register;