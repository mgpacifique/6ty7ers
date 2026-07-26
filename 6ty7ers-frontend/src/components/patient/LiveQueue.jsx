import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../service/api';
import { onQueueUpdate, offQueueUpdate, onPatientCalled, offPatientCalled, disconnectSocket } from '../../service/socket';

export default function LiveQueue() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Waiting');
  const [fullName, setFullName] = useState('');
  const [trackType, setTrackType] = useState('');
  const [totalWaiting, setTotalWaiting] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('just now');

  useEffect(() => {
    const updateQueueStatus = async () => {
      try {
        const data = await apiGet('/queue/patient');

        // Update patient info from response
        setToken(data.public_token);
        setStatus(data.status);
        setFullName(data.full_name);
        setTrackType(data.track_type);
        setTotalWaiting(Math.max(0, data.position_in_queue - 1));
        setEstimatedWait(data.estimated_wait_minutes);

        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Failed to update queue status:', err);
      }
    };

    // Initial load
    updateQueueStatus();

    // Set up WebSocket listeners for real-time updates
    const handleQueueUpdate = () => {
      updateQueueStatus();
    };

    const handlePatientCalled = () => {
      setStatus('Called');
      updateQueueStatus();
    };

    onQueueUpdate(handleQueueUpdate);
    onPatientCalled(handlePatientCalled);

    return () => {
      offQueueUpdate(handleQueueUpdate);
      offPatientCalled(handlePatientCalled);
      disconnectSocket();
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('patient_access_token');
    navigate('/patient');
  };

  const handleViewHistory = () => {
    navigate('/patient/history');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 p-4">
          <button onClick={handleViewHistory} className="text-muted-foreground hover:text-ink">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
            </svg>
            <span className="font-display text-lg text-ink">CareQueue</span>
          </div>
          <div className="ml-auto text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Live Queue Status
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        {/* Your Token Card */}
        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Your Token
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <div>
              <div className="font-display text-6xl leading-none text-ink sm:text-7xl">{token}</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{fullName}</span>
                {trackType && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {trackType}
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-card px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</div>
              <div className="mt-1 text-sm font-semibold text-ink">{status}</div>
            </div>
          </div>
        </section>

        {/* Live Statistics */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Queue Statistics
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6">
            {/* Total Waiting */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Total Waiting
              </div>
              <div className="font-display mt-2 text-4xl text-ink">{totalWaiting}</div>
              <div className="mt-1 text-xs text-muted-foreground">Patients ahead</div>
            </div>

            {/* Estimated Wait */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Est. Wait
              </div>
              <div className="font-display mt-2 text-4xl text-ink">{estimatedWait}</div>
              <div className="mt-1 text-xs text-muted-foreground">Minutes</div>
            </div>
          </div>
        </section>

        {/* Status Update Message */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-ink">Real-time Updates</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll notify you immediately when you're called. Keep this page open or check back regularly for updates.
              </p>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Last updated: <span>{lastUpdated}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-2">
          <button
            onClick={handleViewHistory}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-ink hover:bg-secondary transition"
          >
            View History
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-semibold text-ink hover:bg-secondary transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}