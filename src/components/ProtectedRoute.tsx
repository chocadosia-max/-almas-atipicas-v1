import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Aguarda o Supabase recuperar a sessão do localStorage antes de decidir
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-t-[var(--rosa-forte)] border-[var(--rosa-claro)] animate-spin" />
        <p className="text-[var(--rosa-forte)] font-bold text-sm animate-pulse">Carregando sua jornada...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
