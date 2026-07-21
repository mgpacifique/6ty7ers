import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Welcome from '../components/patient/Welcome';
import PhoneEntry from '../components/patient/PhoneEntry';
import Verify from '../components/patient/Verify';
import History from '../components/patient/History';
import LiveQueue from '../components/patient/LiveQueue';

export default function PatientApp() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneSubmit = (phone) => {
    setPhoneNumber(phone);
    navigate('/patient/verify');
  };

  return (
    <Routes>
      <Route path="/" element={<Welcome onGetStarted={() => navigate('/patient/phone')} />} />
      <Route
        path="/phone"
        element={<PhoneEntry onPhoneSubmit={handlePhoneSubmit} onBack={() => navigate('/patient')} />}
      />
      <Route
        path="/verify"
        element={<Verify phoneNumber={phoneNumber} onVerified={() => navigate('/patient/queue')} onBack={() => navigate('/patient/phone')} />}
      />
      <Route
        path="/queue"
        element={
          <div>
            <History onBack={() => navigate('/patient/phone')} />
            <LiveQueue token="FT-405" department="General Medicine" />
          </div>
        }
      />
    </Routes>
  );
}