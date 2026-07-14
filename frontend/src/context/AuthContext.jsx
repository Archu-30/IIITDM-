import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          token,
          role: user.role,
          userId: user.id,
          username: user.name,
          permissions: user.permissions || []
        };
      } catch (_) {
        return null;
      }
    }
    return null;
  });

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set axios default header immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setAuth({
      token,
      role: user.role,
      userId: user.id,
      username: user.name,
      permissions: user.permissions || []
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    sessionStorage.clear();

    // Reset Axios authorization header
    delete api.defaults.headers.common['Authorization'];

    // Invalidate react query cache if any exists by reloading
    setAuth(null);
  };

  // Sync token to Axios defaults on startup/auth changes
  useEffect(() => {
    if (auth?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
export default AuthContext;
