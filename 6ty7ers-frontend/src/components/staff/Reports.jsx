import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../service/api';

export default function Reports() {
  const navigate = useNavigate();
  const [department] = useState('General Medicine');
  const [timeframe] = useState('This week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    avgWait: '0m',
    patientsServed: 0,
    avgConsultTime: '0m',
    urgentCases: 0,
    starvedCount: 0,
    waitTrend: [],
  });

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/analytics');

        // Process analytics data
        setReportData({
          avgWait: response.avg_wait_time ? `${Math.round(response.avg_wait_time)}m` : '0m',
          patientsServed: response.patients_served || 0,
          avgConsultTime: response.avg_consult_time ? `${Math.round(response.avg_consult_time)}m` : '0m',
          urgentCases: response.urgent_cases || 0,
          starvedCount: response.starvation_promoted_today || 0,
          waitTrend: response.wait_trend || [],
        });
      } catch (err) {
        setError(err.message || 'Failed to load report data');
        // Set default values on error
        setReportData({
          avgWait: '0m',
          patientsServed: 0,
          avgConsultTime: '0m',
          urgentCases: 0,
          starvedCount: 0,
          waitTrend: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleBack = () => {
    navigate('/staff/dashboard');
  };

  if (loading) {
    return <div>Loading reports...</div>;
  }

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

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Avg True Wait */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Avg True Wait</div>
            <div className="metric-range">T1 - T1</div>
          </div>
          <div className="metric-value">{reportData.avgWait}</div>
          <div className="metric-trend negative">-4%</div>
        </div>

        {/* Patients Served */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Patients Served</div>
            <div className="metric-range">This week</div>
          </div>
          <div className="metric-value">{reportData.patientsServed}</div>
          <div className="metric-trend positive">+12%</div>
        </div>

        {/* Avg Consult Time */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Avg Consult Time</div>
            <div className="metric-range">T2 - T2</div>
          </div>
          <div className="metric-value">{reportData.avgConsultTime}</div>
          <div className="metric-trend negative">-2%</div>
        </div>

        {/* Urgent Cases */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-title">Urgent Cases</div>
            <div className="metric-range">Priority track</div>
          </div>
          <div className="metric-value">{reportData.urgentCases}</div>
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
          Active - {reportData.starvedCount} routine tokens auto-promoted today
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
