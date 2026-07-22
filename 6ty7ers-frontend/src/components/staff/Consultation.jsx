import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost, apiGet } from '../../service/api';

export default function Consultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [notes, setNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [consultationData, setConsultationData] = useState(null);

  // Fetch consultation data from backend
  useEffect(() => {
    const fetchConsultationData = async () => {
      try {
        setPageLoading(true);
        const response = await apiGet(`/queue-sessions/${sessionId}`);
        setConsultationData({
          token: response.public_token,
          patientName: response.patient?.full_name || 'Unknown',
          room: 'Room 4', // TODO: Get actual room from backend
          trackType: response.track_type || 'Routine',
          checkInTime: response.t1_check_in,
          calledTime: response.t2_called,
        });

        // Calculate elapsed time from when patient was called
        if (response.t2_called) {
          const calledTime = new Date(response.t2_called);
          const elapsedMs = Date.now() - calledTime.getTime();
          const elapsedMins = Math.floor(elapsedMs / 60000);
          const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);
          setElapsedTime(
            `${String(elapsedMins).padStart(2, '0')}:${String(elapsedSecs).padStart(2, '0')}`
          );
        }
      } catch (err) {
        setError(err.message || 'Failed to load consultation data');
      } finally {
        setPageLoading(false);
      }
    };

    if (sessionId) {
      fetchConsultationData();
    }
  }, [sessionId]);

  // Timer for elapsed time
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const [mins, secs] = prev.split(':').map(Number);
        const totalSecs = mins * 60 + secs + 1;
        const newMins = Math.floor(totalSecs / 60);
        const newSecs = totalSecs % 60;
        return `${String(newMins).padStart(2, '0')}:${String(newSecs).padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend to mark consultation as complete
      await apiPost(`/queue/${sessionId}/complete`, {});

      // Navigate back to dashboard
      navigate('/staff/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/staff/dashboard');
  };

  const handleCallPatient = async () => {
    setLoading(true);
    setError('');

    try {
      await apiPost(`/queue/${sessionId}/call`, {});
      // Refresh consultation data after calling patient
      const response = await apiGet(`/queue-sessions/${sessionId}`);
      setConsultationData({
        token: response.public_token,
        patientName: response.patient?.full_name || 'Unknown',
        room: 'Room 4',
        trackType: response.track_type || 'Routine',
        checkInTime: response.t1_check_in,
        calledTime: response.t2_called,
      });
    } catch (err) {
      setError(err.message || 'Failed to call patient');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div>Loading consultation data...</div>;
  }

  if (!consultationData) {
    return (
      <div className="consultation-container">
        <div className="error-message">No consultation data found</div>
        <button onClick={handleBack} className="back-btn">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="consultation-container">
      {/* Header */}
      <div className="consultation-header">
        <button onClick={handleBack} className="back-btn">←</button>
        <div className="header-text">
          <h1>Consultation</h1>
          <span className="track-badge">{consultationData.trackType}</span>
        </div>
      </div>

      {/* Active Session Card */}
      <div className="active-session-card">
        <div className="session-info">
          <div className="session-token">{consultationData.token}</div>
          <div className="session-patient">{consultationData.patientName}</div>
          <div className="session-location">{consultationData.room}</div>
        </div>

        <div className="session-timer">
          <div className="timer-value">{elapsedTime}</div>
          <div className="timer-label">ELAPSED</div>
        </div>

        <div className="session-actions">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="pause-btn"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={handleCompleteConsultation}
            disabled={loading}
            className="complete-btn"
          >
            {loading ? 'Completing...' : '✓ Complete'}
          </button>
        </div>
      </div>

      {/* Session Timeline */}
      <div className="session-timeline">
        <h3 className="timeline-title">SESSION TIMELINE</h3>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div className="timeline-content">
            <div className="timeline-event">Check-in</div>
            <div className="timeline-time">T1</div>
          </div>
          <div className="timeline-timestamp">{consultationData.checkInTime}</div>
        </div>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div className="timeline-content">
            <div className="timeline-event">Called</div>
            <div className="timeline-time">T2</div>
          </div>
          <div className="timeline-timestamp">{consultationData.calledTime}</div>
        </div>

        <div className="timeline-item in-progress">
          <div className="timeline-marker">⏳</div>
          <div className="timeline-content">
            <div className="timeline-event">Completed</div>
            <div className="timeline-time">T3</div>
          </div>
          <div className="timeline-timestamp">In progress</div>
        </div>
      </div>

      {/* Consultation Notes */}
      <form onSubmit={handleCompleteConsultation}>
        <div className="form-section">
          <label className="section-title">CONSULTATION NOTES</label>
          <textarea
            placeholder="Add notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="5"
          />
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
      </form>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/staff/dashboard')}>👥 Queue</button>
        <button className="nav-item" onClick={() => navigate('/staff/triage')}>📋 Triage</button>
        <button className="nav-item" onClick={() => navigate('/staff/reports')}>📊 Reports</button>
        <button className="nav-item" onClick={() => navigate('/staff/profile')}>👤 Profile</button>
      </div>
    </div>
  );
}
