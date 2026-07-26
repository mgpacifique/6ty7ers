import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGet, apiPost } from '../../service/api';
import { onQueueUpdate, offQueueUpdate, disconnectSocket } from '../../service/socket';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/queue/');
        setQueueData(response || []);
      } catch (err) {
        setError(err.message || 'Failed to load queue');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();

    const handleQueueUpdate = () => {
      const refetch = async () => {
        try {
          const response = await apiGet('/queue/');
          setQueueData(response || []);
        } catch (err) {
          setError(err.message || 'Failed to update queue');
        }
      };
      refetch();
    };

    onQueueUpdate(handleQueueUpdate);

    return () => {
      offQueueUpdate(handleQueueUpdate);
      disconnectSocket();
    };
  }, []);

  const urgentPatients = queueData.filter(p => p.track_type === 'Urgent') || [];
  const routinePatients = queueData.filter(p => p.track_type === 'Routine') || [];
  const totalWaiting = queueData.length;

  const avgWait = queueData.length > 0
    ? Math.round(
        queueData.reduce((sum, p) => {
          const checkInTime = new Date(p.t1_check_in);
          const waitMs = Date.now() - checkInTime.getTime();
          const waitMins = Math.floor(waitMs / 60000);
          return sum + waitMins;
        }, 0) / queueData.length
      ) + 'm'
    : '0m';

  const searchResults = searchQuery.trim() === ''
    ? []
    : queueData.filter(p =>
        p.public_token.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('staff_access_token');
      localStorage.removeItem('staff');
      navigate('/staff');
    }
  };

  const handleCallPatient = async (sessionId, token) => {
    try {
      await apiPost(`/queue/${sessionId}/call`, {});
      const response = await apiGet('/queue/');
      setQueueData(response || []);
    } catch (err) {
      setError(`Failed to call patient ${token}`);
    }
  };

  const handleCompletePatient = async (sessionId, token) => {
    try {
      await apiPost(`/queue/${sessionId}/complete`, {});
      const response = await apiGet('/queue/');
      setQueueData(response || []);
    } catch (err) {
      setError(`Failed to complete patient ${token}`);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/queue/');
      setQueueData(response || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to refresh queue');
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">Live Queue</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">All active sessions</p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 lg:flex">
              <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token, patient, doctor..."
                className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <button onClick={handleRefresh} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border border-border bg-card text-ink hover:bg-secondary transition" disabled={loading}>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>

            {staff.role === 'Admin' && (
              <button
                onClick={() => navigate('/staff/register')}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Register Staff
              </button>
            )}

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {staff.username?.substring(0, 2).toUpperCase() || 'DR'}
              </div>
              <span className="text-xs font-semibold text-ink">{staff.username}</span>
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                {staff.role || 'Staff'}
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
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <svg className="h-3.5 w-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Waiting
                </div>
                <div className="font-display mt-2 text-3xl text-ink">{totalWaiting}</div>
                <div className="text-[11px] text-muted-foreground">Active sessions</div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Routine
                </div>
                <div className="font-display mt-2 text-3xl text-ink">{routinePatients.length}</div>
                <div className="text-[11px] text-muted-foreground">Standard</div>
              </div>

              <div className="rounded-2xl border border-urgent/40 bg-urgent/5 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-urgent">
                  <svg className="h-3.5 w-3.5 text-urgent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Urgent now
                </div>
                <div className="font-display mt-2 text-3xl text-urgent">{urgentPatients.length}</div>
                <div className="text-[11px] text-muted-foreground">Emergency</div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Queue Table & Urgent Sidebar / Search Results */}
            {searchQuery.trim() === '' ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Routine Track Table */}
                <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h2 className="font-display text-xl text-ink">Routine track</h2>

                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{routinePatients.length} in line</span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="pb-2 font-semibold">Token</th>
                        <th className="pb-2 font-semibold">Track</th>
                        <th className="pb-2 font-semibold">Status</th>
                        <th className="pb-2 font-semibold">Waiting</th>
                        <th className="pb-2 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {routinePatients.map((patient) => {
                        const checkInTime = new Date(patient.t1_check_in);
                        const waitMins = Math.floor((Date.now() - checkInTime.getTime()) / 60000);
                        return (
                          <tr key={patient.id}>
                            <td className="py-3">
                              <div className="font-display text-lg text-ink">{patient.public_token}</div>
                              <div className="text-[11px] text-muted-foreground">Priority {Math.floor(patient.dynamic_priority)}</div>
                            </td>
                            <td className="py-3">
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Routine</span>
                            </td>
                            <td className="py-3">
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">Waiting</span>
                            </td>
                            <td className="py-3">
                              <div className="inline-flex items-center gap-1 text-sm text-ink">
                                <svg className="h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                {waitMins}m
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex justify-end">
                                {patient.status === 'Called' ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCompletePatient(patient.id, patient.public_token); }}
                                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground hover:opacity-90"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Complete
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCallPatient(patient.id, patient.public_token); }}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
                                  >
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
                                    </svg>
                                    Call
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {routinePatients.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">No routine patients in queue</div>
                  )}
                </div>
              </section>

              {/* Urgent Track Sidebar */}
              <aside className="rounded-3xl border border-urgent/30 bg-urgent/5 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-urgent opacity-60"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-urgent"></span>
                  </span>
                  <h2 className="font-display text-xl text-ink">Urgent track</h2>
                </div>


                <div className="mt-4 space-y-3">
                  {urgentPatients.length > 0 ? (
                    urgentPatients.map((patient) => {
                      const checkInTime = new Date(patient.t1_check_in);
                      const waitMins = Math.floor((Date.now() - checkInTime.getTime()) / 60000);
                      return (
                        <div key={patient.id} className="rounded-2xl border border-urgent/30 bg-card p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-display text-2xl text-ink">{patient.public_token}</div>
                            <span className="rounded-full bg-urgent/10 px-2 py-0.5 text-[10px] font-semibold text-urgent">URGENT</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <svg className="h-3 w-3 text-urgent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 0v2m0-12v-2m0 0v-2"></path>
                            </svg>
                            Waiting {waitMins}m · priority {Math.floor(patient.dynamic_priority)}
                          </div>
                          {patient.status === 'Called' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCompletePatient(patient.id, patient.public_token); }}
                              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Complete
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCallPatient(patient.id, patient.public_token); }}
                              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-urgent py-2 text-xs font-semibold text-urgent-foreground hover:opacity-90"
                            >
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
                              </svg>
                              Call now
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">No urgent patients</div>
                  )}
                </div>
              </aside>
              </div>
            ) : (
              // Search Results View
              <section className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl text-ink">Search Results</h2>
                    <p className="text-xs text-muted-foreground">Found {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="pb-2 font-semibold">Token</th>
                        <th className="pb-2 font-semibold">Track</th>
                        <th className="pb-2 font-semibold">Status</th>
                        <th className="pb-2 font-semibold">Waiting</th>
                        <th className="pb-2 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {searchResults.map((patient) => {
                        const checkInTime = new Date(patient.t1_check_in);
                        const waitMins = Math.floor((Date.now() - checkInTime.getTime()) / 60000);
                        return (
                          <tr key={patient.id}>
                            <td className="py-3">
                              <div className="font-display text-lg text-ink">{patient.public_token}</div>
                              <div className="text-[11px] text-muted-foreground">Priority {Math.floor(patient.dynamic_priority)}</div>
                            </td>
                            <td className="py-3">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                patient.track_type === 'Urgent'
                                  ? 'bg-urgent/10 text-urgent'
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {patient.track_type || 'Unassigned'}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">{patient.status}</span>
                            </td>
                            <td className="py-3">
                              <div className="inline-flex items-center gap-1 text-sm text-ink">
                                <svg className="h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                {waitMins}m
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex justify-end">
                                {patient.status === 'Called' ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCompletePatient(patient.id, patient.public_token); }}
                                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground hover:opacity-90"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Complete
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCallPatient(patient.id, patient.public_token); }}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
                                  >
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
                                    </svg>
                                    Call
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {searchResults.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">No patients found matching "{searchQuery}"</div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
