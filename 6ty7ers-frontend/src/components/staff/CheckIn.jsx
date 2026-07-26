import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../../service/api';

export default function CheckIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenResult, setTokenResult] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('staff');
      navigate('/staff');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientName.trim() || !patientPhone.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await apiPost('/patients/check-in', {
        full_name: patientName,
        phone_number: patientPhone,
      });

      setTokenResult({
        token: response.public_token || `FT-${Math.floor(Math.random() * 999)}`,
        status: 'Registered',
      });

      setPatientName('');
      setPatientPhone('');
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPatientName('');
    setPatientPhone('');
    setDepartment('');
    setError('');
    setTokenResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col">
          <div className="flex items-center gap-2 p-5">
            <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <div>
              <div className="font-display text-xl leading-none text-ink">CareQueue</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Staff
              </div>
            </div>
          </div>

          <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
            <button
              onClick={() => navigate('/staff/dashboard')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/dashboard')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
              </svg>
              Queue
            </button>
            <button
              onClick={() => navigate('/staff/check-in')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/check-in')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Check-In
            </button>
            <button
              onClick={() => navigate('/staff/triage')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/triage')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Triage
            </button>
            <button
              onClick={() => navigate('/staff/reports')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/reports')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Reports
            </button>
            <button
              onClick={() => navigate('/staff/profile')}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive('/staff/profile')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-ink'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </button>
          </nav>

          <div className="border-t border-border p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-ink hover:bg-secondary"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">Check-In Patient</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">Register a walk-in and issue a queue token</p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {staff.username?.substring(0, 2).toUpperCase() || 'GR'}
              </div>
              <span className="text-xs font-semibold text-ink">{staff.username}</span>
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                {staff.role || 'Nurse'}
              </span>
            </div>
          </header>

          {/* Mobile Navigation */}
          <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-2 lg:hidden">
            <button
              onClick={() => navigate('/staff/dashboard')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/dashboard')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
              </svg>
              Queue
            </button>
            <button
              onClick={() => navigate('/staff/check-in')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/check-in')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Check-In
            </button>
            <button
              onClick={() => navigate('/staff/triage')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/triage')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Triage
            </button>
            <button
              onClick={() => navigate('/staff/reports')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/reports')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Reports
            </button>
            <button
              onClick={() => navigate('/staff/profile')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive('/staff/profile')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </button>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Check-In Form Section */}
              <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-display text-2xl text-ink">New patient</div>
                    <div className="text-xs text-muted-foreground">
                      Add a New Patient.
                    </div>
                  </div>
                </div>

                <form id="checkin-form" className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  {/* Full Name Field */}
                  <label className="block">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Full name
                    </div>
                    <div className="rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
                      <input
                        id="patient-name"
                        required
                        type="text"
                        placeholder="Patient name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        disabled={loading}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </label>

                  {/* Department Field
                  <label className="block">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Department
                    </div>
                    <div className="rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        disabled={loading}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-ink"
                      >
                        <option value="" disabled>Select department</option>
                        <option value="general-medicine">General Medicine</option>
                      </select>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground italic">
                      to be continued...
                    </div>
                  </label> */}

                  {/* Phone Number Field */}
                  <label className="block">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Phone number
                    </div>
                    <div className="rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
                      <input
                        id="patient-phone"
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        disabled={loading}
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

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      {loading ? 'Checking in…' : 'Issue token'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-ink hover:bg-secondary"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </section>

              {/* Token Display Section */}
              <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Latest token issued
                </div>

                {tokenResult ? (
                  <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                      Give this to the patient
                    </div>
                    <div className="font-display mt-1 text-6xl text-ink">{tokenResult.token}</div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Status: {tokenResult.status}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Patient will get SMS updates as their turn approaches.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                    Fill in the form and issue a token — it'll show here so you can read it out to
                    the patient.
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
