import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!username || !password) {
        throw new Error('Please enter both username and password');
      }

      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const getApiBase = () => {
        if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
        if (typeof window !== 'undefined' && window.location?.hostname) {
          return `${window.location.protocol}//${window.location.hostname}:8000`;
        }
        return 'http://localhost:8000';
      };
      const API_BASE = getApiBase();
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (res.status === 401) {
        throw new Error('Invalid username or password');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Login failed');
      }

      const response = await res.json();

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('staff', JSON.stringify(response.staff));

      if (window.onLoginSuccess) {
        window.onLoginSuccess(response.staff);
      }

      navigate('/staff/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Left Sidebar (Hidden on mobile) */}
      <div className="grain-bg relative hidden flex-col justify-center border-r border-border bg-surface p-10 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
          </svg>
          <span className="font-display text-2xl text-ink">CareQueue</span>
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            SECURE
          </span>
        </div>

        {/* Branding */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Borcelle Hospital
          </p>
          <h1 className="font-display mt-3 max-w-md text-5xl leading-[1.05] text-ink">
            Every patient, routed with care.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Sign in to the CareQueue Staff Console to triage arrivals, call the next patient, and keep the
            waiting room informed in real time.
          </p>
        </div>

        {/* Footer */}
      </div>

      {/* Right Login Panel */}
      <div className="flex flex-col justify-center bg-card p-6 sm:p-12">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Button */}
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-ink">
            ← Back
          </Link>

          {/* Heading */}
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sign in to continue
          </p>
          <h2 className="font-display mt-1 text-3xl text-ink">Welcome back</h2>

          {/* Login Form */}
          <form id="login-form" className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Username Field */}
            <label className="block">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Username
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <input
                  id="username"
                  required
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. nurse_grace"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            {/* Password Field */}
            <label className="block">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Password
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <input
                  id="password"
                  required
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span>{loading ? 'Signing in…' : 'Sign In'}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
