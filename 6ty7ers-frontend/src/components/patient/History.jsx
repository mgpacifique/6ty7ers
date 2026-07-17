import './history.css';


const VISITS = [
  { date: 'May 12, 2026', token: 'FT-398', doctor: 'Dr. Meera Vasudev', dept: 'General Medicine', wait: '24m' },
  { date: 'Mar 3, 2026', token: 'FT-256', doctor: 'Dr. Rahul Sen', dept: 'Cardiology', wait: '31m' },
  { date: 'Jan 18, 2026', token: 'FT-119', doctor: 'Pharmacy Counter', dept: 'Pharmacy', wait: '9m' },
];

export default function History({ onBack }) {
  return (
    <div className="history-container">
      <div className="history-header">
        <button className="back-btn" onClick={onBack} type="button">←</button>
        <span>My Visit History</span>
      </div>
      <p className="history-subtitle">Verified via code</p>

      {VISITS.map((v) => (
        <div key={v.token} className="history-card">
          <div className="history-row">
            <span className="history-date">{v.date}</span>
            <span className="history-token">{v.token}</span>
          </div>
          <div className="history-doctor">{v.doctor}</div>
          <div className="history-meta">{v.dept} · Wait {v.wait}</div>
        </div>
      ))}

      <p className="history-footer">Showing your last 3 visits to Borcelle Hospital</p>
    </div>
  );
}