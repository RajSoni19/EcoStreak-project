import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'ngo' | 'admin';
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      if (!accessToken || !user) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role);
        
        // Check if token is expired (simple check - in production you'd verify JWT expiry)
        if (userData.role && (!requiredRole || userData.role === requiredRole)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "Please log in to access this page",
      variant: "destructive",
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    toast({
      title: "Access denied",
      description: `This page is only for ${requiredRole} users`,
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
