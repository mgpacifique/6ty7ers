import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Welcome from '../components/patient/Welcome';
import CheckIn from '../components/patient/CheckIn';
import Verify from '../components/patient/Verify';
import History from '../components/patient/History';
import Department from '../components/patient/Department';
import Token from '../components/patient/Token';
import LiveQueue from '../components/patient/LiveQueue';

export default function PatientApp() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [department, setDepartment] = useState('General Medicine');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCheckInComplete = (sessionData) => {
    setSession(sessionData);
    setPhoneNumber(sessionData.phone_number || '');
    navigate(`/patient/department?sessionId=${sessionData.id}`);
  };

  const handleDepartmentSelect = (dept) => {
    setDepartment(dept.name);
    navigate(`/patient/token?dept=${dept.name}`);
  };

  return (
    <Routes>
      <Route path="/" element={<Welcome onGetStarted={() => navigate('/patient/checkin')} />} />
      <Route
        path="/checkin"
        element={<CheckIn onCheckInComplete={handleCheckInComplete} onViewHistory={() => navigate('/patient/verify')} />}
      />
      <Route
        path="/verify"
        element={<Verify phoneNumber={phoneNumber} onVerified={() => navigate('/patient/history')} onBack={() => navigate('/patient/checkin')} />}
      />
      <Route path="/history" element={<History onBack={() => navigate('/patient/checkin')} />} />
      <Route
        path="/department"
        element={<Department onDepartmentSelect={handleDepartmentSelect} onBack={() => navigate('/patient/checkin')} />}
      />
      <Route
        path="/token"
        element={<Token sessionData={session} onContinue={() => navigate('/patient/live-queue')} />}
      />
      <Route
        path="/live-queue"
        element={<LiveQueue token={session?.public_token || 'FT-405'} department={department} />}
      />
    </Routes>
  );
}