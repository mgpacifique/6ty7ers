import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole = null }) {
  // Check if token exists in localStorage
  const token = localStorage.getItem('access_token');
  const staffData = localStorage.getItem('staff');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/staff" replace />;
  }

  // If role is required, check if user has that role
  if (requiredRole) {
    const staff = JSON.parse(staffData);
    if (staff.role !== requiredRole) {
      return <Navigate to="/staff/dashboard" replace />;
    }
  }

  // If all checks pass, render the component
  return children;
}
