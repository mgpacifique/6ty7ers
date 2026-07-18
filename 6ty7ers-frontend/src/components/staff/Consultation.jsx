import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost } from '../../service/api';

export default function Consultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [notes, setNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Mock consultation data - TODO: Fetch from backend
  const consultationData = {
    token: 'FT-405',
    patientName: 'Om Prakash',
    room: 'Room 4',
    trackType: 'Routine',
    checkInTime: '09:12 AM',
    calledTime: '09:40 AM',
  };

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
      await apiPost(`/queue/${sessionId}/complete`, {
        notes: notes || null,
      });

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

        {/* AI Assist Button (placeholder) */}
        <div className="ai-assist-section">
          <button type="button" className="ai-assist-btn">
            🤖 AI assist
          </button>
        </div>
      </form>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item">👥 Queue</button>
        <button className="nav-item">📋 Triage</button>
        <button className="nav-item">📊 Reports</button>
        <button className="nav-item">👤 Profile</button>
      </div>
    </div>
  );
}
