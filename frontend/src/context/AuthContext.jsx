import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock users for UI demonstration
const MOCK_USERS = {
  customer: {
    id: 'u-001',
    name: 'Tanaka Hiroshi',
    email: 'tanaka@fujikura.co.jp',
    role: 'customer',
    organisation: { id: 'org-001', name: 'Fujikura Ltd.' },
    avatar: null,
  },
  agent: {
    id: 'u-002',
    name: 'Yamamoto Kenji',
    email: 'yamamoto@cubastion.com',
    role: 'agent',
    organisation: null,
    avatar: null,
  },
  admin: {
    id: 'u-003',
    name: 'Suzuki Akiko',
    email: 'suzuki@cubastion.com',
    role: 'admin',
    organisation: null,
    avatar: null,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    if (email.includes('fujikura') || email.includes('customer')) {
      setUser(MOCK_USERS.customer);
      return { role: 'customer' };
    }
    if (email.includes('admin')) {
      setUser(MOCK_USERS.admin);
      return { role: 'admin' };
    }
    setUser(MOCK_USERS.agent);
    return { role: 'agent' };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
