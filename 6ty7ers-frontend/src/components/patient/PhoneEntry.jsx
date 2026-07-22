import { useState } from 'react';
import { apiPost } from '../../service/api';
// import './phoneEntry.css';

export default function PhoneEntry({ onPhoneSubmit, onBack }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiPost('/patient-auth/request-otp', {
        phone_number: phoneNumber,
      });

      if (onPhoneSubmit) {
        onPhoneSubmit(phoneNumber);
      }
    } catch (err) {
      setError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-entry-container">
      <div className="header">
        {onBack && (
          <button className="back-btn" onClick={onBack} type="button">
            ←
          </button>
        )}
        <span>Sign In</span>
      </div>

      <div className="form-card">
        <span>Enter Your Phone</span>
        <p className="form-subtitle">We'll send you a confirmation code</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="phoneNumber">PHONE NUMBER</label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="e.g. +250781234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              className="input"
            />
          </div>

          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <p className="privacy-notice">
        Your phone number is used to send you verification codes
      </p>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading}
        className="continue-btn"
      >
        {loading ? 'Sending...' : 'Send Code'}
      </button>
    </div>
  );
}
