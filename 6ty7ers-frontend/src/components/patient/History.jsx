import { useState, useEffect } from 'react';
import { apiGet } from '../../service/api';
import './history.css';

export default function History({ onBack }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await apiGet('/history/patient');
        const formatted = data.map((v) => {
          const checkInDate = v.t1_check_in ? new Date(v.t1_check_in) : new Date();
          const dateStr = checkInDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const doctorName = v.consulted_by_staff_username
            ? `Dr. ${v.consulted_by_staff_username}`
            : (v.triaged_by_staff_username ? `Staff (${v.triaged_by_staff_username})` : 'Attending Staff');
          const deptName = v.department_name || 'General Medicine';
          const waitStr = v.wait_time_minutes !== null && v.wait_time_minutes !== undefined
            ? `${Math.round(v.wait_time_minutes)}m`
            : '0m';

          return {
            id: v.id,
            date: dateStr,
            token: v.public_token,
            doctor: doctorName,
            dept: deptName,
            wait: waitStr,
            status: v.status,
          };
        });
        setVisits(formatted);
      } catch (err) {
        console.error('Failed to load visit history:', err);
        setError(err.message || 'Could not load visit history');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <div className="history-container">
      <div className="history-header">
        <button className="back-btn" onClick={onBack} type="button">←</button>
        <span>My Visit History</span>
      </div>
      <p className="history-subtitle">Verified via code</p>

      {loading && <div className="history-loading">Loading your visits...</div>}
      {error && visits.length === 0 && <div className="history-error">{error}</div>}

      {!loading && visits.length === 0 && !error && (
        <div className="history-empty">No past visits found.</div>
      )}

      {visits.map((v) => (
        <div key={v.id || v.token} className="history-card">
          <div className="history-row">
            <span className="history-date">{v.date}</span>
            <span className="history-token">{v.token}</span>
          </div>
          <div className="history-doctor">{v.doctor}</div>
          <div className="history-meta">{v.dept} · Wait {v.wait} · {v.status}</div>
        </div>
      ))}

      <p className="history-footer">
        {visits.length > 0 ? `Showing your ${visits.length} visit(s) to Borcelle Hospital` : 'Borcelle Hospital Queue System'}
      </p>
    </div>
  );
}