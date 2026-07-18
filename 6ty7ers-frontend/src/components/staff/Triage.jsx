import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost } from '../../service/api';

export default function Triage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock patient data - TODO: Fetch from backend
  const patientData = {
    token: 'FT-405',
    name: 'Om Prakash',
    checkedInTime: '12 mins ago',
    reason: 'Fever, general checkup',
  };

  const handleSubmitTriage = async (e) => {
    e.preventDefault();

    if (!urgencyLevel) {
      setError('Please select an urgency level');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call backend triage API
      await apiPost(`/triage/${sessionId}`, {
        track_type: urgencyLevel,
        priority_score: null, // Backend calculates this
        staff_id: null, // TODO: Use logged-in staff ID
        notes: notes || null,
      });

      // Navigate to next step or back to dashboard
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
            <span className="value">{patientData.checkedInTime}</span>
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
