import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../service/api';

export default function History() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await apiGet('/history/patient');
        const formatted = data.map((v) => {
          const checkInDate = v.t1_check_in ? new Date(v.t1_check_in) : new Date();
          const dateStr = checkInDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const checkInTime = checkInDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          const doctorName = v.consulted_by_staff_username
            ? `Dr. ${v.consulted_by_staff_username}`
            : (v.triaged_by_staff_username ? `Staff (${v.triaged_by_staff_username})` : 'Attending Staff');
          const deptName = v.department_name || 'General Medicine';
          const waitStr = v.wait_time_minutes !== null && v.wait_time_minutes !== undefined
            ? `${Math.round(v.wait_time_minutes)}m`
            : '0m';
          const consultStr = v.consultation_time_minutes !== null && v.consultation_time_minutes !== undefined
            ? `${Math.round(v.consultation_time_minutes)}m`
            : '0m';

          return {
            id: v.id,
            date: dateStr,
            token: v.public_token,
            doctor: doctorName,
            dept: deptName,
            checkInTime,
            wait: waitStr,
            consultTime: consultStr,
            status: v.status,
          };
        });
        setVisits(formatted);
      } catch (err) {
        console.error('Failed to load visit history:', err);
        setError(err.message || 'Could not load visit history');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    navigate('/patient');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 p-4">
          <a href="/patient" className="text-muted-foreground hover:text-ink">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </a>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <span className="font-display text-lg text-ink">CareQueue</span>
          </div>
          <div className="ml-auto text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Verified via OTP · XXXXX-6789
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        {/* Current Status Section */}
        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Current status
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground">No active queue session</div>
              <div className="font-display mt-1 text-2xl text-ink">You're not in the queue</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Please visit the front desk to get checked in and receive your token.
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground sm:flex">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-xs font-semibold">Live updates</span>
            </div>
          </div>
        </section>

        {/* History Section */}
        <h1 className="font-display mt-8 text-3xl text-ink">My visit history</h1>
        <p className="text-sm text-muted-foreground">Showing your last 3 visits to Borcelle Hospital.</p>

        {loading && (
          <div className="mt-5 text-center text-sm text-muted-foreground">Loading your visits...</div>
        )}

        {error && !loading && (
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {!loading && visits.length === 0 && !error && (
          <div className="mt-5 text-center text-sm text-muted-foreground">No past visits found.</div>
        )}

        <div className="mt-5 space-y-3">
          {visits.map((v) => (
            <article key={v.id || v.token} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {v.date}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Completed
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <div>
                  <div className="font-display text-2xl text-ink">{v.token}</div>
                  <div className="text-sm text-muted-foreground">
                    {v.doctor} · {v.dept}
                  </div>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Check-in</div>
                  <div className="text-sm font-semibold text-ink">{v.checkInTime}</div>
                </div>
                <div className="rounded-xl bg-surface p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Wait</div>
                  <div className="text-sm font-semibold text-ink">{v.wait}</div>
                </div>
                <div className="rounded-xl bg-surface p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">With doctor</div>
                  <div className="text-sm font-semibold text-ink">{v.consultTime}</div>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-ink hover:bg-secondary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sign out
        </button>
      </main>
    </div>
  );
}