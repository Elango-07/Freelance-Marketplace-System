import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authApi } from '../services/api';
import { useToast } from '@chakra-ui/react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const toast = useToast();

  const fetchUserProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  }, []);

  const fetchAllUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    setUsers(data);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fb_token');
      if (token) {
        try {
          const { data } = await authApi.getMe();
          setUser(data.user);
          if (data.user?.role === 'admin') {
            fetchAllUsers();
          }
        } catch (error) {
          console.error('Session initialization failed:', error);
          localStorage.removeItem('fb_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchAllUsers]);

  // --- Demo User Configuration ---
  const DEMO_USERS = {
    'admin@fms.com':   { id: '00000000-0000-0000-0000-000000000001', name: 'Demo Admin',   role: 'admin',    password: 'admin123' },
    'client@fms.com':  { id: '00000000-0000-0000-0000-000000000002', name: 'Demo Client',  role: 'client',   password: 'client123' },
    'partner@fms.com': { id: '00000000-0000-0000-0000-000000000003', name: 'Demo Partner', role: 'partner',  password: 'partner123' },
  };

  // Auth functions
  const login = async (email, password) => {
    // Check for demo users first
    if (DEMO_USERS[email] && DEMO_USERS[email].password === password) {
      const demoUser = {
        ...DEMO_USERS[email],
        email,
        verified: true,
        isVerified: true,
        created_at: new Date().toISOString()
      };
      
      setUser(demoUser);
      localStorage.setItem('fb_token', 'demo-token');
      setLastActivity(Date.now());
      return { success: true, user: demoUser };
    }

    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('fb_token', data.token);
      setUser(data.user);
      setLastActivity(Date.now());
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await authApi.register({ name, email, password, role });
      localStorage.setItem('fb_token', data.token);
      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || error.message || 'Registration failed. Backend server might be offline.';
      return { success: false, message: `Error: ${message}` };
    }
  };

  const logout = useCallback(async () => {
    localStorage.removeItem('fb_token');
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
    setUser(data ? { ...data, isVerified: data.verified } : data);
    return { success: true, user: data };
  };

  // Old local-only verifyEmail kept for backward compat
  const verifyEmail = useCallback(async (userId) => {
    const { error } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('id', userId);
    if (error) console.error('Error verifying email:', error);
    if (user?.id === userId) setUser(prev => prev ? { ...prev, verified: true, isVerified: true } : prev);
  }, [user?.id]);

  // Real resend: triggers a Supabase verification email
  const resendVerificationEmail = useCallback(async () => {
    if (!user?.email) return;
    try {
      // Use getUser() to fetch the latest state from the server
      const { data: userData } = await supabase.auth.getUser();
      const serverUser = userData?.user;
      const isConfirmed = !!(serverUser?.email_confirmed_at || serverUser?.confirmed_at);

      if (isConfirmed) {
        // User is already confirmed — just sync to DB and update UI
        await supabase.from('users').update({ verified: true }).eq('id', user.id);
        setUser(prev => prev ? { ...prev, isVerified: true, verified: true } : prev);
        toast({ title: 'Email verified! ✅', description: 'Your account is now fully verified.', status: 'success', duration: 4000, isClosable: true });
        return;
      }

      // Otherwise, try to resend
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        // If resend fails (e.g. already confirmed), just let them know
        toast({ title: 'Check your email', description: `A verification email was already sent to ${user.email}. Please check your inbox and spam folder.`, status: 'info', duration: 6000, isClosable: true });
      } else {
        toast({ title: 'Verification email sent! 📧', description: `Please check your inbox at ${user.email} and click the link.`, status: 'success', duration: 6000, isClosable: true });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Could not send verification email.', status: 'error', duration: 4000, isClosable: true });
    }
  }, [user?.email, user?.id, toast]);

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

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      login, 
      register, 
      logout, 
      updateProfile, 
      verifyEmail, 
      resendVerificationEmail,
      lastActivity,
      isLoading: loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
