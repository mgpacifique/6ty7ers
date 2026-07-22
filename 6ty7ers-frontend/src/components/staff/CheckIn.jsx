import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../service/api';

export default function CheckIn() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter patient name');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter patient phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await apiPost('/patients/check-in', {
        full_name: fullName,
        phone_number: phoneNumber,
      });

      setSuccess(true);
      setFullName('');
      setPhoneNumber('');
      setDepartment('');

      setTimeout(() => {
        navigate('/staff/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to check in patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <button onClick={() => navigate('/staff/dashboard')} type="button" className="back-btn">
          ←
        </button>
        <div className="header-text">
          <h1>Check In Patient</h1>
          <p>Register patient and send queue token</p>
        </div>
      </div>

      {success ? (
        <div className="success-message">
          ✅ Patient checked in successfully!<br />
          Queue token sent via SMS.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="checkin-form">
          <div className="form-group">
            <label htmlFor="fullName">PATIENT NAME</label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter patient full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">PHONE NUMBER</label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="e.g. +250781234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">DEPARTMENT</label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={true}
              title="Department endpoint coming soon"
            >
              <option value="">Select Department (coming soon...)</option>
            </select>
            <p className="note">Backend is adding department support</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Checking In...' : 'Check In Patient'}
          </button>
        </form>
      )}

      <button onClick={() => navigate('/staff/dashboard')} type="button" className="cancel-btn">
        Back to Dashboard
      </button>
    </div>
  );
}
