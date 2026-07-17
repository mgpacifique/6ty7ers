import './token.css';

export default function Token({ sessionData, onContinue }) {
  const token = sessionData?.public_token || 'FT-405';
  const department = sessionData?.department || 'General Medicine';
  const trackType = sessionData?.track_type || 'Routine';
  const estimatedWait = sessionData?.estimated_wait || '~35 mins';
  const nowServing = 'FT-397';
  const aheadOfYou = 4;
  const notificationThreshold = 2;
  const roomLocation = 'Room 4, General Medicine Ward';

  return (
    <div className="token-container">
      <div className="token-header">
        <div className="token-header-info">
          <div className="info-row">
            <span className="label">Department</span>
            <span className="value">{department}</span>
          </div>
          <div className="info-row">
            <span className="label">Track</span>
            <span className="value">{trackType}</span>
          </div>
          <div className="info-row">
            <span className="label">Est. Wait</span>
            <span className="value">{estimatedWait}</span>
          </div>
        </div>
      </div>

      <div className="token-display-card">
        <div className="token-label">YOUR TOKEN</div>
        <div className="token-number">{token}</div>
        <div className="token-subtitle">Estimated wait: ~18 mins</div>
      </div>

      <div className="queue-status">
        <div className="status-row">
          <div className="status-item">
            <div className="status-label">Now Serving</div>
            <div className="status-value">{nowServing}</div>
          </div>
          <div className="status-item">
            <div className="status-label">Ahead of You</div>
            <div className="status-value">{aheadOfYou}</div>
          </div>
        </div>
      </div>

      <div className="queue-progress-section">
        <div className="progress-label">Queue Progress</div>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((4 - aheadOfYou) / 4) * 100}%` }}></div>
          </div>
          <div className="progress-text">{aheadOfYou} AHEAD</div>
        </div>
        <p className="progress-note">You'll be notified when {notificationThreshold} patients remain</p>
      </div>

      <div className="room-location">
        <div className="location-icon">📍</div>
        <div className="location-text">
          <div className="location-room">{roomLocation}</div>
        </div>
      </div>

      <div className="sms-notice">
        <div className="notice-icon">🔔</div>
        <p>We'll notify by SMS as your turn approaches.</p>
      </div>

      {onContinue && (
        <button className="token-continue-btn" onClick={onContinue} type="button">
          Track Live Queue
        </button>
      )}
    </div>
  );
}