import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api/v1/user';
const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password2) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/register/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      const { access, refresh } = res.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      setAuth({ access, refresh });
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-heading">Register</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="auth-input" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="auth-input" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="auth-input" />
          <input type="password" name="password2" placeholder="Confirm Password" value={formData.password2} onChange={handleChange} required className="auth-input" />
          <button type="submit" disabled={loading} className="auth-button">{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <div className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')} className="auth-link">Login</span>
        </div>
      </div>
    </div>
  );
}