import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api/v1/user';
const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/token/`, {
        username: credentials.username,
        password: credentials.password
      });
      const { access, refresh } = res.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      setAuth({ access, refresh });
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Invalid username or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-heading">Login</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input name="username" placeholder="Username" value={credentials.username} onChange={handleChange} required className="auth-input" />
          <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} required className="auth-input" />
          <button type="submit" disabled={loading} className="auth-button">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <span onClick={() => navigate('/register')} className="auth-link">Register</span>
        </div>
      </div>
    </div>
  );
}
