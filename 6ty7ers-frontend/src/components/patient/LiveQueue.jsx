import { useEffect, useState } from 'react';
import './liveQueue.css';

// Real-time updates via the existing WebSocket broadcasts.

export default function LiveQueue({ token, department }) {
  const [status, setStatus] = useState('Waiting');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const getWsUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      if (typeof window !== 'undefined' && window.location?.hostname) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.hostname}:8000/ws`;
      }
      return 'ws://localhost:8000/ws';
    };
    const socket = new WebSocket(getWsUrl());

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.data?.public_token === token) {
        if (payload.event === 'PATIENT_CALLED') setStatus('Called');
        if (payload.event === 'PATIENT_COMPLETED') setStatus('Completed');
      }

      if (payload.event === 'QUEUE_STATS') {
        setStats(payload.data);
      }
    };

    return () => socket.close();
  }, [token]);

  return (
    <div className="live-queue-container">
      <p className="live-queue-eyebrow">QUEUE STATUS</p>
      <h2>{department}</h2>

      <div className="live-token-card">
        <span className="live-token-label">YOUR TOKEN</span>
        <span className="live-token-value">{token}</span>
        <span className="live-token-status">Status: {status}</span>
      </div>

      {stats && (
        <div className="live-stats-row">
          <div className="live-stat">
            <span className="live-stat-label">Total Waiting</span>
            <span className="live-stat-value">{stats.total}</span>
          </div>
          <div className="live-stat">
            <span className="live-stat-label">Urgent Track</span>
            <span className="live-stat-value">{stats.urgent}</span>
          </div>
        </div>
      )}

      <p className="live-note">We'll update this page the moment you're called.</p>
    </div>
  );
}