import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPageLayout from '../components/layout/AuthPageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Sign in to your account</h2>
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
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
        {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
        <div className="flex flex-col gap-3 mt-2">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate('/register')}
          >
            Sign Up
          </Button>
        </div>
      </form>
      <div className="mt-8 border-t border-gray-200 pt-4 w-full">
        <h3 className="text-sm font-medium text-gray-500">Demo Accounts</h3>
        <div className="mt-2 grid grid-cols-1 gap-3">
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">Recruiter:</p>
            <p className="text-xs text-gray-500">Email: recruiter@example.com</p>
            <p className="text-xs text-gray-500">Password: password123</p>
          </div>
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">Candidate:</p>
            <p className="text-xs text-gray-500">Email: candidate@example.com</p>
            <p className="text-xs text-gray-500">Password: password123</p>
          </div>
        </div>
      </div>
    </AuthPageLayout>
  );
};

export default Login;