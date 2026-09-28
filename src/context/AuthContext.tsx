import React, { createContext, useContext, useEffect, useState } from 'react';
import { IUser, UserRole } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextType {
  user: IUser | null;
  role: UserRole;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; role?: UserRole; user?: IUser }>;
  register: (data: { email: string; password: string; name: string; role: UserRole; department?: string }) => Promise<{ success: boolean; message?: string; role?: UserRole; user?: IUser }>;
  logout: () => Promise<void>;
  switchRoleToDemo: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartcampus_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const defaultUserForRole = (role: UserRole): IUser => {
    if (role === 'Student') {
      return {
        _id: '65f1a2b3c4d5e6f7a8b9c003',
        email: 'student@smartcampus.edu',
        name: 'Priya Sharma',
        role: 'Student',
        referenceId: 'STU202401',
        department: 'Computer Science & Engineering',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      };
    } else if (role === 'Faculty') {
      return {
        _id: '65f1a2b3c4d5e6f7a8b9c002',
        email: 'faculty@smartcampus.edu',
        name: 'Dr. Rajesh Kumar',
        role: 'Faculty',
        referenceId: 'FAC101',
        department: 'Computer Science & Engineering',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      };
    } else {
      return {
        _id: '65f1a2b3c4d5e6f7a8b9c001',
        email: 'admin@smartcampus.edu',
        name: 'Dr. S. K. Narayanan',
        role: 'Admin',
        department: 'Central Administration',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
    }
  };

  // Restore session from API or default to student
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smartcampus_token');
      if (savedToken) {
        try {
          const { response } = await api.get('/auth/me');
          if (response.success && response.data) {
            setUser(response.data);
            setLoading(false);
            return;
          }
        } catch {
          // Token expired or invalid
        }
      }

      // Auto-initialize demo Student user with valid token
      const defaultRole = (localStorage.getItem('smartcampus_demo_role') as UserRole) || 'Student';
      await loginDemoUser(defaultRole);
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginDemoUser = async (targetRole: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      Student: 'student@smartcampus.edu',
      Faculty: 'faculty@smartcampus.edu',
      Admin: 'admin@smartcampus.edu',
    };

    const { response } = await api.post('/auth/login', {
      email: emailMap[targetRole],
      password: 'password123',
    });

    if (response.success && response.data) {
      localStorage.setItem('smartcampus_token', response.data.token);
      localStorage.setItem('smartcampus_demo_role', targetRole);
      setToken(response.data.token);
      setUser(response.data.user);
    } else {
      // Fallback
      setUser(defaultUserForRole(targetRole));
    }
  };

  const login = async (email: string, password: string) => {
    const { response } = await api.post('/auth/login', { email, password });
    if (response.success && response.data) {
      const userRole = response.data.user.role as UserRole;
      localStorage.setItem('smartcampus_token', response.data.token);
      localStorage.setItem('smartcampus_demo_role', userRole);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true, role: userRole, user: response.data.user };
    }
    return { success: false, message: response.message || 'Login failed' };
  };

  const register = async (data: { email: string; password: string; name: string; role: UserRole; department?: string }) => {
    const { response } = await api.post('/auth/register', data);
    if (response.success && response.data) {
      const userRole = response.data.user.role as UserRole;
      localStorage.setItem('smartcampus_token', response.data.token);
      localStorage.setItem('smartcampus_demo_role', userRole);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true, role: userRole, user: response.data.user };
    }
    return { success: false, message: response.message || 'Registration failed' };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    }
    localStorage.removeItem('smartcampus_token');
    setToken(null);
    setUser(null);
  };

  const switchRoleToDemo = async (newRole: UserRole) => {
    setLoading(true);
    await loginDemoUser(newRole);
    setLoading(false);
  };

  const role: UserRole = user?.role || 'Student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        login,
        register,
        logout,
        switchRoleToDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
