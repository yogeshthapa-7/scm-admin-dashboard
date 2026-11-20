import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/auth/services/auth-session';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * ProtectedRoute guard that checks whether the user is authenticated.
 * If not authenticated, redirects the user to /login and preserves
 * the intended location in navigation state so the user can be returned
 * to their requested page after successful authentication.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
