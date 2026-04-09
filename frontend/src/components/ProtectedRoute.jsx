import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children;
}
