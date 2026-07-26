import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost, apiGet } from '../../service/api';

export default function Triage() {
  const navigate = useNavigate();
  const location = useLocation();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');

  const [urgencyLevel, setUrgencyLevel] = useState('Routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [awaitingPatients, setAwaitingPatients] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchTriageData = async () => {
      try {
        setPageLoading(true);
        const response = await apiGet('/queue/');

        // Filter patients that haven't been triaged yet (status is Registered)
        const awaitingTriage = response.filter(p => p.status === 'Registered');

        setAwaitingPatients(awaitingTriage);

        if (awaitingTriage.length > 0) {
          const firstPatient = awaitingTriage[0];
          setSelectedSessionId(firstPatient.id);
          setPatientData({
            token: firstPatient.public_token,
            checkedInTime: firstPatient.t1_check_in,
            department: 'General Medicine',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load triage data');
      } finally {
        setPageLoading(false);
      }
    };

    fetchTriageData();
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedSessionId(patient.id);
    setPatientData({
      token: patient.public_token,
      checkedInTime: patient.t1_check_in,
      department: 'General Medicine',
    });
    setUrgencyLevel('Routine');
    setNotes('');
    setError('');
  };

  const handleRoute = async () => {
    if (!urgencyLevel) {
      setError('Please select an urgency level');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiPost(`/triage/${selectedSessionId}`, {
        track_type: urgencyLevel,
      });

      const updatedPatients = awaitingPatients.filter(p => p.id !== selectedSessionId);
      setAwaitingPatients(updatedPatients);

      if (updatedPatients.length > 0) {
        handleSelectPatient(updatedPatients[0]);
      } else {
        navigate('/staff/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit triage');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('staff_access_token');
      localStorage.removeItem('staff');
      navigate('/staff/login');
    }
  };

  const getWaitMins = () => {
    if (!patientData) return 0;
    const checkInTime = new Date(patientData.checkedInTime);
    return Math.floor((Date.now() - checkInTime.getTime()) / 60000);
  };

  const initials = staff.first_name && staff.last_name
    ? (staff.first_name[0] + staff.last_name[0]).toUpperCase()
    : 'GR';

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div>Loading triage data...</div>
      </div>
    );
  }

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
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Staff</div>
            </div>
          </div>

          <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
            <a href="/staff/dashboard" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive('/staff/dashboard') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-ink'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
              </svg>
              Queue
            </a>
            <a href="/staff/check-in" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive('/staff/check-in') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-ink'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Check-In
            </a>
            <a href="/staff/triage" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive('/staff/triage') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-ink'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Triage
            </a>
            <a href="/staff/reports" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive('/staff/reports') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-ink'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Reports
            </a>
            <a href="/staff/profile" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive('/staff/profile') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-ink'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </a>
          </nav>

          <div className="border-t border-border p-4">
            <button
              onClick={handleSignOut}
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
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">New triage</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">Rate urgency to route the patient</p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {initials}
              </div>
              <span className="text-xs font-semibold text-ink">{staff.username || 'nurse_grace'}</span>
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                Nurse
              </span>
            </div>
          </header>

          {/* Mobile Navigation */}
          <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-2 lg:hidden">
            <a href="/staff/dashboard" className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive('/staff/dashboard') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
              </svg>
              Queue
            </a>
            <a href="/staff/check-in" className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive('/staff/check-in') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Check-In
            </a>
            <a href="/staff/triage" className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive('/staff/triage') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Triage
            </a>
            <a href="/staff/reports" className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive('/staff/reports') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Reports
            </a>
            <a href="/staff/profile" className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive('/staff/profile') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </a>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              {/* Left Sidebar: Patient List */}
              <aside className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg text-ink">Awaiting triage</h3>
                  <span className="text-xs text-muted-foreground">{awaitingPatients.length}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {awaitingPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`patient-btn flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                        selectedSessionId === patient.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <div>
                        <div className="font-display text-base">{patient.public_token}</div>
                        <div className={`text-[11px] ${selectedSessionId === patient.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          Checked in {Math.floor((Date.now() - new Date(patient.t1_check_in).getTime()) / 60000)}m ago
                        </div>
                      </div>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Right: Triage Panel */}
              {patientData && (
                <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground">
                      Step 2 of 3 · Urgency
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Checked in {getWaitMins()} mins ago
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-2xl text-primary">
                      {patientData.token.split('-')[1]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-2xl leading-tight text-ink">Token {patientData.token}</div>
                      <div className="text-sm text-muted-foreground">{patientData.name} · {patientData.department}</div>
                    </div>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reason</div>
                      <div className="mt-1 text-sm font-semibold text-ink">{patientData.reason}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Department</div>
                      <div className="mt-1 text-sm font-semibold text-ink">{patientData.department}</div>
                    </div>
                    {/* <div className="rounded-xl border border-border bg-background p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Est. wait</div>
                      <div className="mt-1 text-sm font-semibold text-ink">~28m</div>
                    </div> */}
                  </dl>

                  <div className="mt-6">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Urgency level
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setUrgencyLevel('Routine')}
                        className={`urgency-btn flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                          urgencyLevel === 'Routine'
                            ? 'bg-primary/5 border-primary'
                            : 'border-border bg-background hover:bg-secondary'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-ink">Non-Urgent</div>
                          <div className="text-xs text-muted-foreground">Routine track, normal FIFO</div>
                        </div>
                        {/* <div className={`text-sm font-semibold ${urgencyLevel === 'Routine' ? 'text-primary' : 'text-urgent'}`}>
                          ~28m
                        </div> */}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrgencyLevel('Urgent')}
                        className={`urgency-btn flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                          urgencyLevel === 'Urgent'
                            ? 'bg-primary/5 border-primary'
                            : 'border-border bg-background hover:bg-secondary'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-ink">Emergency / High urgency</div>
                          <div className="text-xs text-muted-foreground">Immediate insertion, priority</div>
                        </div>
                        {/* <div className={`text-sm font-semibold ${urgencyLevel === 'Urgent' ? 'text-primary' : 'text-urgent'}`}>
                          Now
                        </div> */}
                      </button>
                    </div>
                  </div>

                  {/* <label className="mt-6 block">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Nurse notes
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      placeholder="Optional notes…"
                      className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                    ></textarea>
                  </label> */}

                  {error && (
                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    {/* <p className="text-xs text-muted-foreground">
                      Smart Logic Engine · urgent cases inserted ahead of the routine queue automatically.
                    </p> */}
                    <button
                      onClick={handleRoute}
                      disabled={loading}
                      className={`inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition ${
                        urgencyLevel === 'Urgent' ? 'bg-urgent hover:opacity-90' : 'bg-primary hover:opacity-90'
                      } disabled:opacity-50`}
                    >
                      Route to {urgencyLevel}
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
