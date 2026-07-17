import { useState } from 'react';
import { apiPost } from '../../services/api';
import "./checkIn.css"

export default function CheckIn({ onCheckInComplete }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiPost('/patients/check-in', {
        full_name: fullName,
        phone_number: phoneNumber,
        reason_for_visit: reasonForVisit || null,
      });

      // Call parent callback to proceed to department selection
      if (onCheckInComplete) {
        onCheckInComplete(response);
      } else {
        window.location.href = `/patient/department?sessionId=${response.id}`;
      }
    } catch (err) {
      setError(err.message || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-in-container">
      <div className="header">
        <span>Welcome</span>
        <p className="subtitle">King Faisal Hospital, Get your queue token</p>
      </div>

      <div className="form-card">
        <span>Quick Check-In</span>
        <p className="form-subtitle" style={{marginTop: '2px '}}>No account needed — just for this visit.</p>

        <form onSubmit={handleSubmit} className="form" id="checkInForm">
          
          <div className="form-group">
            <label htmlFor="fullName">FULL NAME</label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">PHONE NUMBER</label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="For queue updates"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reasonForVisit">REASON FOR VISIT</label>
            <input
              id="reasonForVisit"
              type="text"
              placeholder="e.g. Fever, Checkup"
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              className="input"
            />
          </div>

          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <p className="privacy-notice">
        Your details are only used for this visit
      </p>

      <button
        type="submit"
        form="checkInForm"
        disabled={loading}
        className="continue-btn"
      >
        {loading ? 'Processing...' : 'Continue'}
      </button>
    </div>
  );
}
