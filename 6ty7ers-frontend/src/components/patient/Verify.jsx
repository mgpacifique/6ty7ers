import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../service/api';

export default function Verify({ phoneNumber, onBack }) {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhoneStep, setShowPhoneStep] = useState(true);
  const [phone, setPhone] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      setPhone(phoneNumber);
      setShowPhoneStep(false);
      startCountdown();
      focusFirstInput();
    }
  }, [phoneNumber]);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            setCanResend(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
  };

  const focusFirstInput = () => {
    setTimeout(() => document.getElementById('otp-0')?.focus(), 50);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiPost('/patient-auth/request-otp', {
        phone_number: phone,
      });
      setShowPhoneStep(false);
      startCountdown();
      focusFirstInput();
    } catch (err) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setDigits(['', '', '', '', '', '']);

    try {
      await apiPost('/patient-auth/request-otp', {
        phone_number: phone,
      });
      startCountdown();
      focusFirstInput();
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiPost('/patient-auth/verify-otp', {
        phone_number: phone,
        otp_code: otp,
      });

      localStorage.setItem('access_token', response.access_token);

      // Fetch patient's active session using the new token
      try {
        const sessionResponse = await apiGet('/patient-auth/session');
        localStorage.setItem('patient_token', sessionResponse.patient_token);
        localStorage.setItem('patient_department', sessionResponse.department);
        localStorage.setItem('patient_phone', phone);
      } catch (err) {
        console.warn('Could not fetch active session:', err.message);
        // Session fetch is optional - user can still access queue with default values
      }

      navigate('/patient/queue');
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
      setDigits(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const maskPhone = (phoneNum) => {
    if (!phoneNum) return '+•• •••• XX';
    return phoneNum.slice(0, phoneNum.length - 5).replace(/./g, 'X') + phoneNum.slice(-5);
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = String(countdown % 60).padStart(2, '0');
    return `${String(minutes).padStart(2, '0')}:${seconds}`;
  };

  return (
    <div className="grain-bg flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <a href="/patient" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ink">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </a>

        {/* Logo */}
        <div className="mt-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
          </svg>
          <span className="font-display text-xl text-ink">CareQueue</span>
        </div>

        {showPhoneStep ? (
          <>
            <h1 className="font-display mt-6 text-3xl text-ink">Verify it's you</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your phone number. We'll text you a 6-digit code.
            </p>

            <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-3">
              <label className="block">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Phone number
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
                />
              </label>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {loading ? 'Sending code…' : 'Send code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display mt-6 text-3xl text-ink">Verify it's you</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the code sent to <span className="font-semibold">{maskPhone(phone)}</span> to view your queue status.
            </p>

            <div className="mt-6 flex justify-between gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className="font-display h-14 w-full min-w-0 rounded-2xl border border-border bg-background text-center text-2xl text-ink outline-none focus:border-primary disabled:opacity-50"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || digits.join('').length < 6}
              className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Verify
            </button>

            {error && (
              <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="mt-4 text-center text-xs text-muted-foreground">
              {canResend ? (
                <>
                  <span>Didn't get it? </span>
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="font-semibold text-primary hover:underline disabled:opacity-50"
                    type="button"
                  >
                    Resend code
                  </button>
                </>
              ) : (
                <span>Didn't get it? Resend in {formatCountdown()}</span>
              )}
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              This code only unlocks your queue status — it's not a login or account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}