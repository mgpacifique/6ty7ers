import { useState } from 'react';
import { apiPost } from '../../service/api';
import './verify.css';

export default function Verify({ onVerified, onBack, phoneNumber }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (value && nextInput) nextInput.focus();
  };

  const handleRequestOtp = async () => {
    if (!phoneNumber) {
      setError('Phone number is required to request OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiPost('/patient-auth/request-otp', {
        phone_number: phoneNumber,
      });
      setOtpRequested(true);
    } catch (err) {
      setError(err.message || 'Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otp = digits.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiPost('/patient-auth/verify-otp', {
        phone_number: phoneNumber,
        otp_code: otp,
      });

      // Store patient token
      localStorage.setItem('access_token', response.access_token);

      // Call success callback
      if (onVerified) {
        onVerified();
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
      setDigits(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <button className="back-btn" onClick={onBack} type="button">←</button>
      <div className="verify-icon">🛡️</div>
      <h1>Verify it's you</h1>
      <p className="verify-subtitle">
        Enter the code sent to your number to view your visit history
      </p>

      {!otpRequested ? (
        <button
          onClick={handleRequestOtp}
          disabled={loading}
          className="request-otp-btn"
          type="button"
        >
          {loading ? 'Requesting...' : 'Request OTP Code'}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="otp-row">
          {digits.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              className="otp-box"
              disabled={loading}
            />
          ))}
        </form>
      )}

      {error && <div className="error">{error}</div>}

      {otpRequested && (
        <button
          className="verify-submit-btn"
          onClick={handleSubmit}
          type="button"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      )}

      <p className="verify-note">
        This code only unlocks your visit history. It's not a login or account.
      </p>
    </div>
  );
}