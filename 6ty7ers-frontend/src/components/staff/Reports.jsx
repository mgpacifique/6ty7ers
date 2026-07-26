import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGet } from '../../service/api';

export default function Reports() {
  const navigate = useNavigate();
  const location = useLocation();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    avgWait: '24m',
    patientsServed: 187,
    avgConsultTime: '12m',
    urgentCases: 8,
    starvedCount: 3,
    waitTrend: [60, 54, 71, 100, 79, 43, 34],
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/analytics/dashboard');

        // Find urgent case count from volume_by_status
        const urgentCount = response.volume_by_status
          .filter(v => v.status === 'Urgent' || v.status === 'URGENT')
          .reduce((sum, v) => sum + v.count, 0);

        // Normalize peak_hours to percentages for the chart
        const maxPeakCount = Math.max(...response.peak_hours.map(h => h.count), 1);
        const normalizedTrend = response.peak_hours.map(h =>
          Math.round((h.count / maxPeakCount) * 100)
        );

        // Find peak hour (hour with most patients)
        const peakHourData = response.peak_hours.reduce((max, h) =>
          h.count > max.count ? h : max,
          response.peak_hours[0] || { hour: 0, count: 0 }
        );
        const peakHourFormatted = new Date(2024, 0, 1, peakHourData.hour, 0).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        setReportData({
          avgWait: `${Math.round(response.wait_times.average_wait_time_minutes)}m`,
          patientsServed: response.wait_times.total_completed_patients,
          avgConsultTime: `${Math.round(response.wait_times.average_consult_time_minutes)}m`,
          urgentCases: urgentCount,
          starvedCount: 0, // Backend does not yet track starvation promotions
          waitTrend: normalizedTrend,
          peakHour: peakHourFormatted,
          peakCount: peakHourData.count,
        });
      } catch (err) {
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('staff_access_token');
      localStorage.removeItem('staff');
      navigate('/staff');
    }
  };

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
                Staff Console
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
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Shift</div>
            <div className="mt-1 text-sm font-semibold text-ink">7:00 AM – 3:00 PM</div>
            <div className="text-xs text-muted-foreground">General Medicine</div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-ink hover:bg-secondary"
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
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">Reports</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">General Medicine · This week</p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 lg:flex">
              <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                placeholder="Search token, patient, doctor..."
                className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-primary/10 text-primary">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.251a.75.75 0 00.582.25H15m-4.5 0a.75.75 0 01-.582-.25H4.5m0 0l-.621 9.026A2.25 2.25 0 006.121 21h11.758a2.25 2.25 0 002.241-1.973l.621-9.026m-16.5 0h16.5m-1.5-6.75a6 6 0 11-12 0 6 6 0 0112 0z"></path>
              </svg>
              Live
            </div>

            <button className="rounded-full border border-border bg-card p-2 text-muted-foreground hover:text-ink">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {staff.username?.substring(0, 2).toUpperCase() || 'GR'}
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
            {error && (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Avg true wait</div>
                <div className="mt-1">
                  <div className="font-display text-3xl text-ink">{reportData.avgWait}</div>
                </div>
                <div className="text-[11px] text-muted-foreground">T2 − T1</div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Patients served</div>
                <div className="mt-1">
                  <div className="font-display text-3xl text-ink">{reportData.patientsServed}</div>
                </div>
                <div className="text-[11px] text-muted-foreground">This week</div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Avg consult time</div>
                <div className="mt-1">
                  <div className="font-display text-3xl text-ink">{reportData.avgConsultTime}</div>
                </div>
                <div className="text-[11px] text-muted-foreground">T3 − T2</div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Urgent cases</div>
                <div className="mt-1">
                  <div className="font-display text-3xl text-ink">{reportData.urgentCases}</div>
                </div>
                <div className="text-[11px] text-muted-foreground">Priority track</div>
              </div>
            </div>

            {/* Wait Time Trend Chart */}
            <section className="mt-6 rounded-3xl border border-border bg-card p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="font-display text-xl text-ink">Wait time trend</h2>
                  <p className="text-xs text-muted-foreground">Minutes · last 7 days</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Peak {reportData.peakHour} · {reportData.peakCount} patients</span>
              </div>

              <div className="mt-6 flex h-40 items-end gap-3">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div key={day + idx} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-xl ${idx === 3 ? 'bg-urgent' : 'bg-primary/70'}`}
                      style={{ height: `${reportData.waitTrend[idx]}%` }}
                    ></div>
                    <div className="text-[10px] font-semibold text-muted-foreground">{day}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Insights Grid */}
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <span className="text-[11px] font-semibold uppercase tracking-widest">Starvation protection</span>
                </div>
                <p className="font-display mt-2 text-2xl text-ink">Active</p>
                <p className="text-sm text-muted-foreground">
                  {reportData.starvedCount} routine tokens auto-promoted today thanks to dynamic aging (+2 pts/min).
                </p>
              </div>

              <div className="rounded-3xl border border-urgent/30 bg-urgent/5 p-5">
                <div className="flex items-center gap-2 text-urgent">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4"></path>
                  </svg>
                  <span className="text-[11px] font-semibold uppercase tracking-widest">Peak load</span>
                </div>
                <p className="font-display mt-2 text-2xl text-ink">{reportData.peakHour}</p>
                <p className="text-sm text-muted-foreground">{reportData.peakCount} patients — consider staffing +1.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
