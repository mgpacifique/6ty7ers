import { useState } from 'react';
import { apiPost } from '../../services/api';
import '../styles/checkin.css';

export default function CheckIn() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiPost('/patients/check-in', {
        full_name: fullName,
        phone_number: phoneNumber,
        department,
      });
      
      // Navigate to queue screen with token
      window.location.href = `/queue/${response.public_token}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-in-container">
      <h1>Quick Check-In</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <select 
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        >
          <option value="">Choose Department</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Emergency">Emergency</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Pharmacy">Pharmacy</option>
        </select>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Checking In...' : 'CHECK IN'}
        </button>
      </form>
    </div>
  );
}
