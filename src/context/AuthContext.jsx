import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { LocalStorage } from '../services/localStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => LocalStorage.get('fb_currentUser', null));
  const [users, setUsers] = useState(() => LocalStorage.get('fb_users', []));
  const [loginAttempts, setLoginAttempts] = useState(() => LocalStorage.get('fb_loginAttempts', {}));
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    LocalStorage.set('fb_currentUser', user);
    if (user) setLastActivity(Date.now());
  }, [user]);

  useEffect(() => {
    LocalStorage.set('fb_users', users);
  }, [users]);

  useEffect(() => {
    LocalStorage.set('fb_loginAttempts', loginAttempts);
  }, [loginAttempts]);

  // Auth functions
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const verifyEmail = useCallback((userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
    if (user?.id === userId) setUser(prev => prev ? { ...prev, isVerified: true } : prev);
  }, [user?.id]);

  // Session Timeout Watcher (30 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = (now - lastActivity) / 1000 / 60; // in minutes

      if (diff >= 30) {
        logout();
        alert('Session expired due to inactivity.');
      } else if (diff >= 28) {
        console.warn('Session will expire in 2 minutes.');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, lastActivity, logout]);

  // Activity Tracker
  useEffect(() => {
    const tracker = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', tracker);
    window.addEventListener('keydown', tracker);
    return () => {
      window.removeEventListener('mousemove', tracker);
      window.removeEventListener('keydown', tracker);
    };
  }, []);

  // Demo user seeding
  useEffect(() => {
    if (users.length === 0) {
      const demoUsers = [
        { id: 1, name: 'Admin User', email: 'admin@test.com', password: 'password', role: 'Admin', avatar: '', isBanned: false, isVerified: true, createdAt: '2025-01-15T10:00:00Z' },
        { id: 2, name: 'Client User', email: 'client@test.com', password: 'password', role: 'Client', avatar: '', isBanned: false, isVerified: false, createdAt: '2025-02-10T14:30:00Z' },
        { id: 3, name: 'Partner User', email: 'partner@test.com', password: 'password', role: 'Partner', avatar: '', isBanned: false, isVerified: true, createdAt: '2025-03-05T09:15:00Z' }
      ];
      setUsers(demoUsers);
    }
  }, []);

  const login = (email, password) => {
    const now = Date.now();
    const attempts = loginAttempts[email] || { count: 0, lastTry: 0, lockedUntil: 0 };

    if (attempts.lockedUntil > now) {
      const remaining = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
      return { success: false, message: `Account locked. Try again in ${remaining} minutes.` };
    }

    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      if (foundUser.isBanned) return { success: false, message: 'Your account has been suspended.' };
      
      const currentSignature = navigator.userAgent;
      const knownSignatures = foundUser.knownDevices || [];
      const isNewSession = knownSignatures.length > 0 && !knownSignatures.includes(currentSignature);
      
      if (isNewSession) {
        console.warn('Suspicious login detected from new browser session.');
      }

      if (!knownSignatures.includes(currentSignature)) {
        setUsers(prev => prev.map(u => 
          u.id === foundUser.id 
            ? { ...u, knownDevices: [...knownSignatures, currentSignature] } 
            : u
        ));
      }

      setLoginAttempts(prev => ({ ...prev, [email]: { count: 0, lastTry: now, lockedUntil: 0 } }));
      setUser(foundUser);
      return { success: true, user: foundUser, suspicious: isNewSession };
    }

    const newCount = attempts.count + 1;
    let lockedUntil = 0;
    if (newCount >= 5) {
      lockedUntil = now + (15 * 60 * 1000); // 15 mins
    }

    setLoginAttempts(prev => ({
      ...prev,
      [email]: { count: newCount, lastTry: now, lockedUntil }
    }));

    return { 
      success: false, 
      message: newCount >= 5 
        ? 'Too many failed attempts. Account locked for 15 minutes.' 
        : `Invalid credentials. ${5 - newCount} attempts remaining.` 
    };
  };

  const register = (name, email, password, role) => {
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role,
      avatar: '',
      isBanned: false,
      isVerified: role === 'Admin',
      createdAt: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, updateProfile, verifyEmail, lastActivity }}>
      {children}
    </AuthContext.Provider>
  );
};
