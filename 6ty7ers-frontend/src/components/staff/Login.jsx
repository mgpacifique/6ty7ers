import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      // Call backend login API with form data (OAuth2PasswordRequestForm)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const getApiBase = () => {
        if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
        if (typeof window !== 'undefined' && window.location?.hostname) {
          return `${window.location.protocol}//${window.location.hostname}:8000`;
        }
        return 'http://localhost:8000';
      };
      const API_BASE = getApiBase();
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (res.status === 401) {
        throw new Error('Invalid username or password');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Login failed');
      }

      const response = await res.json();

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
