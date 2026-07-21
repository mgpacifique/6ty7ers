import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../service/api';

export default function Profile() {
  const navigate = useNavigate();
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: staff.username || 'Staff',
    role: 'Staff',
    department: 'General Medicine',
    patients: 0,
    onTimeRating: 0,
    hospital: 'Hospital',
    shiftHours: '7:00 AM - 3:00 PM',
  });

  // Fetch staff profile data from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (staff.id) {
          const response = await apiGet(`/staff/${staff.id}`);
          setProfileData({
            name: response.full_name || staff.username || 'Staff',
            role: response.role || 'Staff',
            department: response.department || 'General Medicine',
            patients: response.total_patients || 0,
            onTimeRating: response.on_time_rating || 0,
            hospital: response.hospital || 'Hospital',
            shiftHours: response.shift_hours || '7:00 AM - 3:00 PM',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [staff.id]);

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

  if (loading) {
    return <div>Loading profile...</div>;
  }

  const avatarInitial = profileData.name.charAt(0).toUpperCase();

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button onClick={handleBack} className="back-btn">←</button>
        <div className="header-text">
          <h1>Profile</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Staff Info Card */}
      <div className="staff-info-card">
        <div className="avatar">{avatarInitial}</div>
        <div className="staff-details">
          <h2 className="staff-name">{profileData.name}</h2>
          <p className="staff-role">{profileData.role} - {profileData.department}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat">
          <div className="stat-value">{profileData.patients}</div>
          <div className="stat-label">Patients</div>
        </div>
        <div className="stat">
          <div className="stat-value">{profileData.onTimeRating}</div>
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
            <span>🏥 {profileData.hospital}</span>
            <span className="chevron">
              {expandedSections.hospital ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.hospital && (
            <div className="settings-content">
              <p>{profileData.hospital}</p>
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
              <p>{profileData.shiftHours}</p>
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
        <button className="nav-item" onClick={() => navigate('/staff/dashboard')}>👥 Queue</button>
        <button className="nav-item" onClick={() => navigate('/staff/triage')}>📋 Triage</button>
        <button className="nav-item" onClick={() => navigate('/staff/reports')}>📊 Reports</button>
        <button className="nav-item active" onClick={() => navigate('/staff/profile')}>👤 Profile</button>
      </div>
    </div>
  );
}
