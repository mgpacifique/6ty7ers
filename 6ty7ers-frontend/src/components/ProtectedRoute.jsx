import { Navigate } from 'react-router-dom';
import { isTokenExpired, clearAuthData } from '../service/auth';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('access_token');
  const staffData = localStorage.getItem('staff');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/staff" replace />;
  }

  // If token is expired, clear auth and redirect to login
  if (isTokenExpired(token)) {
    clearAuthData();
    return <Navigate to="/staff" replace />;
  }

  // If role is required, check if user has that role
  if (requiredRole) {
    try {
      const staff = JSON.parse(staffData);
      if (staff.role !== requiredRole) {
        return <Navigate to="/staff/dashboard" replace />;
      }
    } catch {
      clearAuthData();
      return <Navigate to="/staff" replace />;
    }
  }

  // If all checks pass, render the component
  return children;
}
