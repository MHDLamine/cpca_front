import React from 'react';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Debug info */}
      <div className="fixed top-2 left-2 z-50 bg-black text-white px-2 py-1 rounded text-xs">
        Theme: {theme}
      </div>
      
      {/* Left section */}
      <div className="md:w-1/2 flex flex-col justify-between bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 text-white p-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div>
          <div className="flex items-center gap-4 mt-8 md:mt-0">
            {/* SVG rocket icon, larger size */}
            <span className="bg-white/10 rounded-full shadow-lg flex items-center justify-center" style={{ width: 88, height: 88 }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M32 4c8 0 16 8 16 16 0 8-8 24-16 24S16 28 16 20c0-8 8-16 16-16z" fill="#fff" fillOpacity="0.9"/>
                  <path d="M32 4c8 0 16 8 16 16 0 8-8 24-16 24S16 28 16 20c0-8 8-16 16-16z" fill="#2563eb" fillOpacity="0.7"/>
                  <circle cx="32" cy="20" r="6" fill="#fff"/>
                  <circle cx="32" cy="20" r="3" fill="#2563eb"/>
                  <path d="M32 44v8" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M28 52l4 8 4-8" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                </g>
              </svg>
            </span>
            <span className="text-3xl font-bold tracking-tight">Bienvenue sur ProScreen</span>
          </div>
          <p className="mt-8 text-lg max-w-md opacity-90">
            Plateforme d'évaluation vidéo et questions pour candidats et recruteurs.
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-12 mb-2">

        </div>
      </div>

      {/* Right section */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
