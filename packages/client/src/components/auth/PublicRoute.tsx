import { Navigate } from 'react-router-dom';
import { useProfile } from '../../hooks/auth/useProfile';
import { Skeleton } from '../../components/ui/skeleton';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { data: user, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // User is authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, render children (login/register page)
  return <>{children}</>;
}
