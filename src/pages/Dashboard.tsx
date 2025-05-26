import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import CandidateDashboard from './CandidateDashboard';
import RecruiterDashboard from './RecruiterDashboard';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          {user?.role === 'recruiter'
            ? 'Manage candidates and review their assessments'
            : 'Record your video and answer assessment questions'}
        </p>
      </div>

      {user?.role === 'recruiter' ? <RecruiterDashboard /> : <CandidateDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;