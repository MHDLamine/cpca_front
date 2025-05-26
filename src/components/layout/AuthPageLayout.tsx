import React from 'react';

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section */}
      <div className="md:w-1/2 flex flex-col justify-between bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 text-white p-8 relative">
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
            <span className="text-3xl font-bold tracking-tight">Welcome to Spacer</span>
          </div>
          <p className="mt-8 text-lg max-w-md opacity-90">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur.
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-12 mb-2">
          <a href="#" className="text-sm underline opacity-80 hover:opacity-100">CREATOR HERE</a>
          <a href="#" className="text-sm underline opacity-80 hover:opacity-100">DESIGNER HERE</a>
        </div>
      </div>
      {/* Right section (form) */}
      <div className="md:w-1/2 flex items-center justify-center bg-white py-12 px-6 min-h-screen">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
