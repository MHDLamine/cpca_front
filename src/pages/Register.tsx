import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPageLayout from '../components/layout/AuthPageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import '../auth.css';
import { toast } from 'react-toastify';

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
      setError('Les mots de passe ne correspondent pas');
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (!acceptTerms) {
      setError('Vous devez accepter les Conditions Générales');
      toast.error('Vous devez accepter les Conditions Générales');
      return;
    }
    setIsLoading(true);
    try {
      await register(username, email, password, 'candidate');
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Échec de la création du compte');
        toast.error('Échec de la création du compte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">Créer votre compte</h2>
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <Input
          label="Nom d'utilisateur"
          type="text"
          placeholder="Votre nom d'utilisateur"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
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
        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <div className="flex items-start">
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={e => setAcceptTerms(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
            required
          />
          <label htmlFor="accept-terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            J'accepte les{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline">
              Conditions Générales
            </a>{' '}
            et la{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline">
              Politique de Confidentialité
            </a>
          </label>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Créer le compte
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Se connecter
          </Button>
        </div>
      </form>
    </AuthPageLayout>
  );
};

export default Register;