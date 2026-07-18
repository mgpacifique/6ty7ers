import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const [expandedSections, setExpandedSections] = useState({});

  const handleBack = () => {
    navigate('/staff/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('staff');
    window.location.href = '/staff';
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button onClick={handleBack} className="back-btn">←</button>
        <div className="header-text">
          <h1>Profile</h1>
        </div>
      </div>

      {/* Staff Info Card */}
      <div className="staff-info-card">
        <div className="avatar">A</div>
        <div className="staff-details">
          <h2 className="staff-name">Nurse Amina Uwase</h2>
          <p className="staff-role">Nurse - General Medicine</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat">
          <div className="stat-value">412</div>
          <div className="stat-label">Patients</div>
        </div>
        <div className="stat">
          <div className="stat-value">49</div>
          <div className="stat-label">On-Time Rating</div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="settings-sections">
        {/* Hospital */}
        <div className="settings-item">
          <button
            onClick={() => toggleSection('hospital')}
            className="settings-header"
          >
            <span>🏥 Borcelle Hospital</span>
            <span className="chevron">
              {expandedSections.hospital ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.hospital && (
            <div className="settings-content">
              <p>Main Branch</p>
            </div>
          )}
        </div>

        {/* Shift Hours */}
        <div className="settings-item">
          <button
            onClick={() => toggleSection('shift')}
            className="settings-header"
          >
            <span>🕐 Shift Hours</span>
            <span className="chevron">
              {expandedSections.shift ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.shift && (
            <div className="settings-content">
              <p>7:00 AM - 3:00 PM</p>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="settings-item">
          <button
            onClick={() => toggleSection('notifications')}
            className="settings-header"
          >
            <span>🔔 Notifications</span>
            <span className="chevron">
              {expandedSections.notifications ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.notifications && (
            <div className="settings-content">
              <p>On</p>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="settings-item">
          <button
            onClick={() => toggleSection('account')}
            className="settings-header"
          >
            <span>⚙️ Account Settings</span>
            <span className="chevron">
              {expandedSections.account ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.account && (
            <div className="settings-content">
              <p>Password, preferences</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-btn">
        Sign Out
      </button>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item">👥 Queue</button>
        <button className="nav-item">📋 Triage</button>
        <button className="nav-item">📊 Reports</button>
        <button className="nav-item active">👤 Profile</button>
      </div>
    </div>
  );
}
