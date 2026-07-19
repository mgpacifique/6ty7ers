import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../service/api';
import { onQueueUpdate, offQueueUpdate, disconnectSocket } from '../../service/socket';

export default function Dashboard() {
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllRoutine, setShowAllRoutine] = useState(false);

  // Fetch queue data on mount
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

    // Set up real-time queue updates
    const handleQueueUpdate = async () => {
      try {
        const response = await apiGet('/queue/');
        setQueueData(response || []);
      } catch (err) {
        setError(err.message || 'Failed to update queue');
      }
    };

    onQueueUpdate(handleQueueUpdate);

    return () => {
      offQueueUpdate(handleQueueUpdate);
      disconnectSocket();
    };
  }, []);

  // Separate urgent and routine patients
  const urgentPatients = queueData.filter(p => p.track_type === 'Urgent') || [];
  const routinePatients = queueData.filter(p => p.track_type === 'Routine') || [];

  // Calculate metrics
  const totalWaiting = queueData.length;

  // Calculate average wait time from t1_check_in to now
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

  const totalServed = 41; // TODO: Fetch from backend (separate endpoint)

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('staff');
    window.location.href = '/staff';
  };

  const handleCallPatient = async (sessionId, token) => {
    try {
      await apiPost(`/queue/${sessionId}/call`, {});
      // Refresh queue data after calling patient
      const response = await apiGet('/queue/');
      setQueueData(response || []);
    } catch (err) {
      setError(`Failed to call patient ${token}`);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Hello, {staff.username}</h1>
          <p>General Medicine - Today</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Metrics */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-value">{totalWaiting}</div>
          <div className="metric-label">Waiting</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{avgWait}</div>
          <div className="metric-label">Avg Wait</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalServed}</div>
          <div className="metric-label">Served</div>
        </div>
      </div>

      {/* Urgent Track Section */}
      <div className="track-section">
        <div className="track-header urgent">
          <span className="badge">⚠️ URGENT TRACK</span>
        </div>
        <div className="patient-list">
          {urgentPatients.length > 0 ? (
            urgentPatients.map((patient) => {
              const checkInTime = new Date(patient.t1_check_in);
              const waitMins = Math.floor((Date.now() - checkInTime.getTime()) / 60000);
              return (
                <div key={patient.id} className="patient-card urgent">
                  <div className="patient-info">
                    <div className="patient-token">{patient.public_token}</div>
                    <div className="patient-reason">{waitMins} min ago</div>
                  </div>
                  <button
                    onClick={() => handleCallPatient(patient.id, patient.public_token)}
                    className="call-btn"
                  >
                    Call
                  </button>
                </div>
              );
            })
          ) : (
            <p className="empty-state">No urgent patients</p>
          )}
        </div>
      </div>

      {/* Routine Track Section */}
      <div className="track-section">
        <div className="track-header routine">
          <span className="title">Routine Track</span>
          {routinePatients.length > 3 && !showAllRoutine && (
            <button
              onClick={() => setShowAllRoutine(true)}
              className="view-all-btn"
            >
              View all →
            </button>
          )}
        </div>
        <div className="patient-list">
          {routinePatients.length > 0 ? (
            routinePatients
              .slice(0, showAllRoutine ? undefined : 3)
              .map((patient) => {
                const checkInTime = new Date(patient.t1_check_in);
                const waitMins = Math.floor((Date.now() - checkInTime.getTime()) / 60000);
                return (
                  <div key={patient.id} className="patient-card routine">
                    <div className="patient-info">
                      <div className="patient-token">{patient.public_token}</div>
                      <div className="patient-reason">{waitMins} min ago</div>
                    </div>
                    <div className="patient-time">{waitMins}m</div>
                  </div>
                );
              })
          ) : (
            <p className="empty-state">No routine patients</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item active">👥 Queue</button>
        <button className="nav-item">📋 Triage</button>
        <button className="nav-item">📊 Reports</button>
        <button className="nav-item">👤 Profile</button>
      </div>
    </div>
  );
}
