import React, { createContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthProvider, AuthContext } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminPanel from './components/AdminPanel';

import './App.css';

export const UIContext = createContext();

function PrivateRoute({ children }) {
  const { auth } = React.useContext(AuthContext);
  return auth.access ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { i18n } = useTranslation();
  const [unit, setUnit] = useState('C'); // 'C' или 'F'

  return (
    <AuthProvider>
      <UIContext.Provider value={{ unit, setUnit }}>
        <BrowserRouter>
          <header className="app-header">
            <nav className="nav-links">
              <Link to="/">Dashboard</Link>
              <Link to="/admin" className="admin-link">Admin</Link>
            </nav>
            <div className="controls">
              <select
                value={i18n.language}
                onChange={e => i18n.changeLanguage(e.target.value)}
              >
                <option value="uk">Uk</option>
                <option value="en">En</option>
              </select>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
            </div>
          </header>

          <Routes>
            <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UIContext.Provider>
    </AuthProvider>
  );
}
