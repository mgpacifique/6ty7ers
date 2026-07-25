import { useState } from 'react';
import { apiPost } from '../../service/api';

export default function PhoneEntry({ onPhoneSubmit }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
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
    <div className="grain-bg flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
          </svg>
          <span className="font-display text-xl text-ink">CareQueue</span>
        </div>

        {/* Heading */}
        <h1 className="font-display mt-6 text-3xl text-ink">View your queue status</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your phone number to view your queue status. We'll text you a 6-digit code.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Phone number
            </div>
            <input
              id="phone-input"
              required
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
            />
          </label>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Sending code…' : 'Send code'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Not checked in yet? Please see the front desk.
        </p>
      </div>
    </div>
  );
}
