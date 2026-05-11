import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingForge from './LoadingForge';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingForge message="Entering the forge..." fullPage />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
