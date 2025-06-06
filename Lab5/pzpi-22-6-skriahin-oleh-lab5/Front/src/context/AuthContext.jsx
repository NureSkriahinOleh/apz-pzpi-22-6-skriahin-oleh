import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : { user: null, access: null, refresh: null };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
    if (auth.access) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.access}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [auth]);

  const logout = async () => {
    try {
      await axios.post('/api/v1/user/logout/', { refresh: auth.refresh });
    } catch {}
    setAuth({ user: null, access: null, refresh: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}