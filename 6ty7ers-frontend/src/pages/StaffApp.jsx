import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from '../components/staff/Login';
import Dashboard from '../components/staff/Dashboard';
import Triage from '../components/staff/Triage';
import Consultation from '../components/staff/Consultation';
import Reports from '../components/staff/Reports';
import Profile from '../components/staff/Profile';
import ProtectedRoute from '../components/ProtectedRoute';

export default function StaffApp() {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);

  const handleLoginSuccess = (data) => {
    setStaffData(data);
    navigate('/staff/dashboard');
  };

  const handleLogout = () => {
    setStaffData(null);
    navigate('/staff');
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/triage"
        element={
          <ProtectedRoute>
            <Triage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultation"
        element={
          <ProtectedRoute>
            <Consultation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
