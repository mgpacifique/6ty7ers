import { useState } from 'react';
import "./department.css";

const DEPARTMENTS = [
  {
    id: 1,
    name: 'General Medicine',
    icon: '⚕️',
    waiting: 15,
    estimatedWait: '~20 min',
    isPriority: false,
  },
  {
    id: 2,
    name: 'Emergency / Urgent',
    icon: '⚠️',
    waiting: 3,
    estimatedWait: '~5 min',
    isPriority: true,
  },
  {
    id: 3,
    name: 'Pediatrics',
    icon: '💜',
    waiting: 6,
    estimatedWait: '~15 min',
    isPriority: false,
  },
  {
    id: 4,
    name: 'Pharmacy',
    icon: '💊',
    waiting: 9,
    estimatedWait: '~10 min',
    isPriority: false,
  },
];

export default function Department({ onDepartmentSelect, onBack }) {
  const [selectedDept, setSelectedDept] = useState(null);

  const handleDepartmentClick = (dept) => {
    setSelectedDept(dept.id);
    if (onDepartmentSelect) {
      onDepartmentSelect(dept);
    }
  };

  return (
    <div className="department-container">
      {/* Header with Back Button */}
      <div className="header">
        <button className="back-btn" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
        </button>
        <div className="header-text">
          <span>Choose Department</span>
        </div>
      </div>

      <p style={{fontSize: "1.2em"}}>Where do you need to go today?</p>

      {/* Department Cards */}
      <div className="departments-grid">
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.id}
            className={`department-card ${selectedDept === dept.id ? 'selected' : ''}`}
            onClick={() => handleDepartmentClick(dept)}
          >
            <div className='department-info-container'>
              <div className="department-icon">{dept.icon}</div>
              <div className="department-details">
                <div className="department-name">
                  {dept.name}
                  {/* {dept.isPriority && <span className="priority-badge">Priority</span>} */}
                </div>
                <div className="department-stats">{dept.waiting} waiting</div>
              </div>
            </div>
            <div className="wait-time">
              <div className="wait-time-value">{dept.estimatedWait}</div>
              {/* <div className="wait-time-label">Est. wait</div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
