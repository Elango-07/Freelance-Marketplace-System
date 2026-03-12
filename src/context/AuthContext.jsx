import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

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
    // Check initial session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
        if (profile?.role === 'admin') {
          fetchAllUsers();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
        if (profile?.role === 'admin') {
          fetchAllUsers();
        }
        setLastActivity(Date.now());
      } else {
        setUser(null);
        setUsers([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, fetchAllUsers]);

  // Auth functions
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    
    const profile = await fetchUserProfile(data.user.id);
    if (profile?.is_banned) {
      await supabase.auth.signOut();
      return { success: false, message: 'Your account has been suspended.' };
    }
    
    setUser(profile);
    return { success: true, user: profile };
  };

  const register = async (name, email, password, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role.toLowerCase()
        }
      }
    });

    if (error) return { success: false, message: error.message };
    
    // The trigger will handle user creation in DB
    // We can't immediately fetch the profile because the trigger might take a ms
    // but the session is already active.
    return { success: true, user: data.user };
  };

  const logout = useCallback(async () => {
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
    setUser(data);
    return { success: true, user: data };
  };

  const verifyEmail = useCallback(async (userId) => {
    const { error } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('id', userId);

    if (error) console.error('Error verifying email:', error);
    if (user?.id === userId) setUser(prev => prev ? { ...prev, verified: true } : prev);
  }, [user?.id]);

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
      lastActivity,
      isLoading: loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
