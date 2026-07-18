import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../service/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend login API
      const response = await apiPost('/auth/login', {
        username: username,
        password: password,
      });

      // Store token and staff data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('staff', JSON.stringify(response.staff));

      // Call success callback if provided
      if (window.onLoginSuccess) {
        window.onLoginSuccess(response.staff);
      }

      // Navigate to dashboard
      navigate('/staff/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>CareQueue Staff</h1>
        <p>Borcelle Hospital - Staff sign in</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Username Input */}
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="e.g. nurse.amina"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Error Message */}
        {error && <div>{error}</div>}

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
