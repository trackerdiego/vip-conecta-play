import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  requiredRole?: 'influencer' | 'driver' | 'admin';
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && role && role !== requiredRole) {
    const redirectMap: Record<string, string> = {
      driver: '/driver/map',
      influencer: '/influencer/dashboard',
      admin: '/admin',
    };
    const redirect = redirectMap[role] ?? '/';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
