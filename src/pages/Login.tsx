import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPageLayout from '../components/layout/AuthPageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (err) {
      setError('E-mail ou mot de passe invalide');
      toast.error('E-mail ou mot de passe invalide');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">Connexion à votre compte</h2>
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="vous@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-2">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Se connecter
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate('/register')}
          >
            Créer un compte
          </Button>
        </div>
      </form>

    </AuthPageLayout>
  );
};

export default Login;