import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost, apiGet } from '../../service/api';

export default function Triage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');

  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState(null);

  // Fetch patient data from backend
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setPageLoading(true);
        // Fetch the specific queue session
        const response = await apiGet(`/queue-sessions/${sessionId}`);
        setPatientData({
          token: response.public_token,
          name: response.patient?.full_name || 'Unknown',
          checkedInTime: response.t1_check_in,
          reason: response.reason_for_visit || 'No reason provided',
        });
      } catch (err) {
        setError(err.message || 'Failed to load patient data');
      } finally {
        setPageLoading(false);
      }
    };

    if (sessionId) {
      fetchPatientData();
    }
  }, [sessionId]);

  const handleSubmitTriage = async (e) => {
    e.preventDefault();

    if (!urgencyLevel) {
      setError('Please select an urgency level');
      return;
    }

    if (!staff.id) {
      setError('Staff ID not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call backend triage API
      await apiPost(`/triage/${sessionId}`, {
        track_type: urgencyLevel,
        priority_score: null, // Backend calculates this
      });

      // Navigate back to dashboard after successful triage
      navigate('/staff/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit triage');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/staff/dashboard');
  };

  if (pageLoading) {
    return <div>Loading patient data...</div>;
  }

  if (!patientData) {
    return (
      <div className="triage-container">
        <div className="error-message">No patient data found</div>
        <button onClick={handleBack} className="back-btn">Back to Dashboard</button>
      </div>
    );
  }

  const checkInTime = new Date(patientData.checkedInTime);
  const waitMins = Math.floor((Date.now() - checkInTime.getTime()) / 60000);

  return (
    <div className="triage-container">
      {/* Header */}
      <div className="triage-header">
        <button onClick={handleBack} className="back-btn">←</button>
        <div className="header-text">
          <h1>New Triage</h1>
          <p>Step 2 of 3</p>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="patient-info-card">
        <div className="patient-header">
          <div className="token-badge">{patientData.token}</div>
          <div className="patient-name">{patientData.name}</div>
        </div>
        <div className="patient-details">
          <div className="detail-row">
            <span className="label">Checked in:</span>
            <span className="value">{waitMins} mins ago</span>
          </div>
          <div className="detail-row">
            <span className="label">Reason:</span>
            <span className="value">{patientData.reason}</span>
          </div>
        </div>
      </div>

      {/* Triage Form */}
      <form onSubmit={handleSubmitTriage}>
        {/* Urgency Level Selection */}
        <div className="form-section">
          <label className="section-title">URGENCY LEVEL</label>

          <div className="urgency-options">
            {/* Non-Urgent Option */}
            <label className="urgency-option">
              <input
                type="radio"
                name="urgency"
                value="Routine"
                checked={urgencyLevel === 'Routine'}
                onChange={(e) => setUrgencyLevel(e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">Non-Urgent</div>
                <div className="option-description">
                  Routine track, normal FIFO
                </div>
                <div className="option-time">~28m</div>
              </div>
            </label>

            {/* Emergency Option */}
            <label className="urgency-option emergency">
              <input
                type="radio"
                name="urgency"
                value="Urgent"
                checked={urgencyLevel === 'Urgent'}
                onChange={(e) => setUrgencyLevel(e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">Emergency / High Urgency</div>
                <div className="option-description">
                  Immediate insertion, priority
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Nurse Notes */}
        <div className="form-section">
          <label htmlFor="notes" className="section-title">NURSE NOTES</label>
          <textarea
            id="notes"
            placeholder="Optional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
          />
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Submitting...' : 'Route to Urgent'}
        </button>
      </form>
    </div>
  );
}
