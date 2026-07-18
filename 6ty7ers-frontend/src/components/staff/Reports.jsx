import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const navigate = useNavigate();
  const [department] = useState('General Medicine');
  const [timeframe] = useState('This week');

  const handleBack = () => {
    navigate('/staff/dashboard');
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <button onClick={handleBack} className="back-btn">←</button>
        <div className="header-text">
          <h1>Reports</h1>
          <p>{department} - {timeframe}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Avg True Wait */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Avg True Wait</div>
            <div className="metric-range">T1 - T1</div>
          </div>
          <div className="metric-value">24m</div>
          <div className="metric-trend negative">-4%</div>
        </div>

        {/* Patients Served */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Patients Served</div>
            <div className="metric-range">This week</div>
          </div>
          <div className="metric-value">187</div>
          <div className="metric-trend positive">+12%</div>
        </div>

        {/* Avg Consult Time */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Avg Consult Time</div>
            <div className="metric-range">T2 - T2</div>
          </div>
          <div className="metric-value">12m</div>
          <div className="metric-trend negative">-2%</div>
        </div>

        {/* Urgent Cases */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Urgent Cases</div>
            <div className="metric-range">Priority track</div>
          </div>
          <div className="metric-value">14</div>
          <div className="metric-trend positive">+3</div>
        </div>
      </div>

      {/* Wait Time Trend Chart */}
      <div className="chart-section">
        <h3 className="chart-title">WAIT TIME TREND</h3>
        <div className="chart-placeholder">
          {/* TODO: Add actual chart component */}
          <p>Wait time trend chart - To be implemented</p>
        </div>
      </div>

      {/* Starvation Protection */}
      <div className="starvation-section">
        <div className="starvation-header">
          <span className="badge">⭕</span>
          <span>Starvation Protection</span>
        </div>
        <p className="starvation-text">
          Active - 3 routine tokens auto-promoted today
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item">👥 Queue</button>
        <button className="nav-item">📋 Triage</button>
        <button className="nav-item active">📊 Reports</button>
        <button className="nav-item">👤 Profile</button>
      </div>
    </div>
  );
}
