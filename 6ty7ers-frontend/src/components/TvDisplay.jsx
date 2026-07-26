import { useState, useEffect } from 'react';
import { apiGet } from '../service/api';
import { onQueueUpdate, offQueueUpdate, disconnectSocket } from '../service/socket';

export default function TvDisplay() {
  const [currentTime, setCurrentTime] = useState('12:34');
  const [nowServing, setNowServing] = useState('FT-405');
  const [urgentToken, setUrgentToken] = useState('FT-410');
  const [upNextList, setUpNextList] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [showUrgent, setShowUrgent] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setCurrentTime(timeStr);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 30000);
    return () => clearInterval(timeInterval);
  }, []);

  const updateQueueDisplay = async () => {
    try {
      const data = await apiGet('/queue/');

      // Work with flat list
      const allPatients = data || [];
      console.log('Queue data:', allPatients.map(p => ({ token: p.public_token, status: p.status })));

      // Separate by track type
      const routine = allPatients.filter(p => p.track_type === 'Routine');
      const urgent = allPatients.filter(p => p.track_type === 'Urgent');

      // Find currently served patient (Called status)
      const called = allPatients.filter(p => p.status === 'Called');
      console.log('Called patients:', called.map(p => p.public_token));
      const nowServingPatient = called[0];
      if (nowServingPatient) {
        setNowServing(nowServingPatient.public_token);
      }

      // Find urgent patient being served
      const urgentCalled = urgent.filter(p => p.status === 'Called');
      setShowUrgent(urgentCalled.length > 0);
      if (urgentCalled.length > 0) {
        setUrgentToken(urgentCalled[0].public_token);
      }

      // Get next in line (waiting patients)
      const waiting = allPatients.filter(p =>
        p.status === 'Waiting' || p.status === 'Triaged'
      ).slice(0, 6);

      setUpNextList(
        waiting.map(p => ({
          token: p.public_token,
          dept: 'General Medicine',
        }))
      );

      setIsLive(true);
    } catch (err) {
      console.error('Failed to load queue data:', err);
      setIsLive(false);
    }
  };

  useEffect(() => {
    // Initial load
    updateQueueDisplay();

    // WebSocket listener for real-time updates
    const handleQueueUpdate = () => {
      updateQueueDisplay();
    };

    onQueueUpdate(handleQueueUpdate);

    // Fallback polling every 30 seconds
    const queueInterval = setInterval(updateQueueDisplay, 30000);

    return () => {
      clearInterval(queueInterval);
      offQueueUpdate(handleQueueUpdate);
      disconnectSocket();
    };
  }, []);

  return (
    <div className="grain-bg min-h-screen bg-ink p-6 text-primary-foreground sm:p-10" style={{ margin: 0, overflow: 'hidden' }}>
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
          </svg>
          <span className="font-display text-2xl">CareQueue</span>
          <span className="ml-2 rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
            Waiting room
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isLive ? 'bg-primary/20 text-primary-foreground' : 'bg-white/10 text-white/50'}`}>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.251a.75.75 0 00.582.25H15m-4.5 0a.75.75 0 01-.582-.25H4.5m0 0l-.621 9.026A2.25 2.25 0 006.121 21h11.758a2.25 2.25 0 002.241-1.973l.621-9.026m-16.5 0h16.5m-1.5-6.75a6 6 0 11-12 0 6 6 0 0112 0z"></path>
            </svg>
            {isLive ? 'Live' : 'Offline'}
          </span>
          <span className="font-display text-2xl tabular-nums">{currentTime}</span>
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Now Serving Section */}
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/60">
            Now serving
          </div>
          <div className="font-display mt-3 text-[10rem] leading-none tracking-tight sm:text-[12rem]">
            {nowServing}
          </div>
          <div className="mt-4 text-lg text-primary-foreground/70">
            General Medicine · Room 4
          </div>
        </section>

        {/* Right Panel: Urgent & Up Next */}
        <section className="flex flex-col gap-6">
          {/* Urgent Track */}
          {showUrgent && (
            <div className="rounded-[2rem] border border-urgent/40 bg-urgent/10 p-6">
              <div className="flex items-center gap-2 text-urgent">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 5v2m0-15a9 9 0 110 18 9 9 0 010-18z"></path>
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">
                  Urgent track
                </span>
              </div>
              <div className="font-display mt-2 text-5xl">
                <span>{urgentToken}</span> → Room 1
              </div>
            </div>
          )}

          {/* Up Next */}
          <div className="flex-1 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/60">
              Up next
            </div>
            <ul className="mt-4 space-y-3">
              {upNextList.length > 0 ? (
                upNextList.map((item) => (
                  <li key={item.token} className="flex items-baseline justify-between text-xl">
                    <span className="font-display">{item.token}</span>
                    <span className="text-primary-foreground/60">{item.dept} · Room 4</span>
                  </li>
                ))
              ) : (
                <li className="text-primary-foreground/60">Queue is empty.</li>
              )}
            </ul>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-primary-foreground/50">
        Every patient, routed with care.
      </footer>
    </div>
  );
}
