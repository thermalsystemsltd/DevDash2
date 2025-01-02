import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated and trying to access a protected route, 
    // replace the current history entry
    if ((!isAuthenticated || !user) && location.pathname !== '/login') {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  if ((!isAuthenticated || !user) && location.pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}