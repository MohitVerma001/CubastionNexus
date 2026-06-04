import { createContext, useContext, useState, useEffect } from 'react';
import api, { setMemoryToken, clearMemoryToken } from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.user);
        setMemoryToken(response.token);
        if (!response.user.password_changed_at) {
          setMustChangePassword(true);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setMemoryToken(response.token);
    setUser(response.user);
    if (!response.user.password_changed_at) {
      setMustChangePassword(true);
    }
    return response;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearMemoryToken();
      setUser(null);
      setMustChangePassword(false);
    }
  };

  const markPasswordChanged = () => {
    setMustChangePassword(false);
    setUser(prev => ({ ...prev, password_changed_at: new Date().toISOString() }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <LoadingSpinner />
      </div>
    );
  }

  const value = {
    user,
    loading,
    mustChangePassword,
    login,
    logout,
    markPasswordChanged,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
