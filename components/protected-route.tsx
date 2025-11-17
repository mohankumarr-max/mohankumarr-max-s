
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../firebase/useUser';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary dark:bg-dark-secondary">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary dark:border-dark-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
