import useSWR from 'swr';
import { Navigate, useLocation } from 'react-router-dom';
import { fetcher } from '../api/fetcher';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const { data: user, error, isLoading } = useSWR(
    token ? '/auth/me' : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="container py-5 text-center">Loading...</div>
    );
  }

  if (error || !user) {
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
