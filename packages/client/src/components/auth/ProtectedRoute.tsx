import { Navigate } from 'react-router-dom';
import { useProfile } from '../../hooks/auth/useProfile';
import { Skeleton } from '../../components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useProfile();
  const token = localStorage.getItem('token');

  // No token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Loading state - show loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Error or no user, clear token and redirect
  if (error || !user) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
