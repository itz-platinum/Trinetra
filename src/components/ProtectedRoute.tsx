import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrinetraLogo } from './TrinetraLogo';
import { Skeleton } from './ui/Skeleton';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5 text-center">
          <div className="flex justify-center">
            <TrinetraLogo size={32} withWordmark />
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-3 w-48 mx-auto" />
            <Skeleton className="h-2.5 w-36 mx-auto" />
          </div>
          <p className="text-xs text-[#64748B]">Verifying authenticated session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
