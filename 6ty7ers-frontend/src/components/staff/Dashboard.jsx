import { useState, useEffect } from 'react';
import { apiGet } from '../../service/api';

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
  }, []);

  // Separate urgent and routine patients
  const urgentPatients = queueData.filter(p => p.track_type === 'Urgent') || [];
  const routinePatients = queueData.filter(p => p.track_type === 'Routine') || [];

  // Calculate metrics
  const totalWaiting = queueData.length;
  const avgWait = '28m'; // TODO: Calculate from actual data
  const totalServed = 41; // TODO: Fetch from backend

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('staff');
    window.location.href = '/staff';
  };

  const handleCallPatient = (token) => {
    console.log(`Called patient: ${token}`);
    // TODO: Call backend to mark patient as called
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
            urgentPatients.map((patient) => (
              <div key={patient.id} className="patient-card urgent">
                <div className="patient-info">
                  <div className="patient-token">{patient.public_token}</div>
                  <div className="patient-reason">Chest pain - 2 min ago</div>
                </div>
                <button
                  onClick={() => handleCallPatient(patient.public_token)}
                  className="call-btn"
                >
                  Call
                </button>
              </div>
            ))
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
              .map((patient) => (
                <div key={patient.id} className="patient-card routine">
                  <div className="patient-info">
                    <div className="patient-token">{patient.public_token}</div>
                    <div className="patient-reason">Fever, checkup - 8 min ago</div>
                  </div>
                  <div className="patient-time">8m</div>
                </div>
              ))
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
