import { useState } from 'react';
import './verify.css';

export default function Verify({ onVerified, onBack }) {
  const [digits, setDigits] = useState(['', '', '', '']);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (value && nextInput) nextInput.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerified();
  };

  return (
    <div className="verify-container">
      <button className="back-btn" onClick={onBack} type="button">←</button>
      <div className="verify-icon">🛡️</div>
      <h1>Verify it's you</h1>
      <p className="verify-subtitle">
        Enter the code sent to your number to view your visit history
      </p>

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
          />
        ))}
      </form>

      <button className="verify-submit-btn" onClick={handleSubmit} type="button">
        Verify
      </button>

      <p className="verify-note">
        This code only unlocks your visit history. It's not a login or account.
      </p>
    </div>
  );
}