import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CheckIn from '../components/patient/CheckIn';
import Department from '../components/patient/Department';
import Token from '../components/patient/Token';

export default function PatientApp() {
  const navigate = useNavigate();

  const handleCheckInComplete = (sessionData) => {
    navigate(`/patient/department?sessionId=${sessionData.id}`);
  };

  const handleDepartmentSelect = (dept) => {
    navigate(`/patient/token?dept=${dept.name}`);
  };

  const handleBackToCheckIn = () => {
    navigate('/patient');
  };

  return (
    <Routes>
      <Route path="/" element={<CheckIn onCheckInComplete={handleCheckInComplete} />} />
      <Route
        path="/department"
        element={
          <Department onDepartmentSelect={handleDepartmentSelect} onBack={handleBackToCheckIn} />
        }
      />
      <Route path="/token" element={<Token />} />
    </Routes>
  );
}
