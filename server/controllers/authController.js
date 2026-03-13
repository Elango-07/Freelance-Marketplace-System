import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { logSecurityEvent } from '../utils/securityAlerts.js';

// Step 4: Password Security Requirements
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) return "Password must be at least 8 characters long.";
  if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
  if (!hasNumber) return "Password must contain at least one number.";
  if (!hasSpecial) return "Password must contain at least one special symbol.";
  return null;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, captchaToken } = req.body;
    const normalizedRole = role?.toLowerCase() || 'client';

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    let { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: normalizedRole },
        captchaToken: captchaToken // Step 12: CAPTCHA Protection
      }
    });

    if (authError) {
      if (authError.message.includes('rate limit') || authError.message.includes('Database error') || authError.status === 429 || authError.status === 400 || authError.status === 500) {
        const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: false, 
          user_metadata: { name, role: normalizedRole }
        });

        if (!adminAuthError && adminAuth.user) {
          authData = adminAuth;
          authError = null;
        } else {
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const existingUser = authUsers?.users?.find(u => u.email === email);
          if (existingUser) {
            authData = { user: existingUser };
            authError = null;
          }
        }
      }
    }

    if (authError) return res.status(400).json({ error: authError.message });

    const user = authData.user;
    
    await supabase.from('users').upsert({
      id: user.id,
      name,
      email,
      role: normalizedRole,
      verified: false,
      created_at: new Date().toISOString()
    });

    const isConfirmed = user.email_confirmed_at || user.confirmed_at;

    if (!isConfirmed) {
      return res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        user: { id: user.id, email: user.email, name, role: normalizedRole, verified: false, isVerified: false }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name, role: normalizedRole, verified: true, isVerified: true }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.clientIp || req.ip;
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
       if (error.message.includes('Email not confirmed')) {
         return res.status(401).json({ error: 'Please verify your email before logging in.' });
       }
       return res.status(401).json({ error: error.message });
    }

    const user = data.user;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile?.is_banned) {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    // Step 6: Device Login Tracking
    const deviceName = userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser';
    const deviceInfo = `${deviceName} (${userAgent.substring(0, 50)})`;
    
    // Step 7: Suspicious Login Detection (Check for new IP)
    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('ip_address')
      .eq('user_id', user.id)
      .eq('ip_address', clientIp)
      .limit(1);

    if (!existingSessions || existingSessions.length === 0) {
      // New IP detected!
      await logSecurityEvent(user.id, 'new_ip', { ip: clientIp, device: deviceInfo });
      console.log(`[SECURITY ALERT] New IP detected for user ${user.email}: ${clientIp}`);
    }

    await supabase.from('sessions').insert({
      user_id: user.id,
      device_name: deviceInfo,
      ip_address: clientIp,
      location: 'Determined by IP'
    });

    await supabase.from('users').update({ 
      last_login: new Date().toISOString(),
      verified: !!(user.email_confirmed_at || user.confirmed_at)
    }).eq('id', user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: profile?.role || 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata.name,
        role: profile?.role || user.user_metadata.role,
        verified: !!(user.email_confirmed_at || user.confirmed_at),
        isVerified: !!(user.email_confirmed_at || user.confirmed_at)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Step 8 & 15: Session Management
export const getSessions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ sessions: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Session revoked successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const logoutAll = async (req, res) => {
  try {
    await supabase.from('sessions').delete().eq('user_id', req.user.id);
    await supabase.auth.admin.signOut(req.user.id);
    res.status(200).json({ message: 'Logged out from all devices.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Step 9: Account Recovery
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Password reset link sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return res.status(400).json({ error: error.message });
    
    // Step 10: Security Alerts
    await logSecurityEvent(req.user.id, 'password_changed', { ip: req.ip });
    
    res.status(200).json({ message: 'Password updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Step 1: OAuth
export const getOAuthUrl = async (req, res) => {
  const { provider } = req.params;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${process.env.FRONTEND_URL}/auth/callback` },
  });
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ url: data.url });
};

// Step 5: 2FA Management
export const enroll2FA = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ factor: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error during 2FA enrollment' });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { factorId, challengeId, code } = req.body;
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });

    if (error) return res.status(400).json({ error: error.message });
    
    // Update user's MFA status in our database
    await supabase.from('users').update({ mfa_enabled: true }).eq('id', req.user.id);
    
    res.status(200).json({ message: '2FA verified and enabled successfully', data });
  } catch (error) {
    res.status(500).json({ error: 'Server error during 2FA verification' });
  }
};

export const challenge2FA = async (req, res) => {
  try {
    const { factorId } = req.body;
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ challenge: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error during 2FA challenge' });
  }
};

export const list2FAFactors = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ factors: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error listing 2FA factors' });
  }
};

export const unenroll2FA = async (req, res) => {
  try {
    const { factorId } = req.body;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return res.status(400).json({ error: error.message });
    
    // Update user's MFA status in our database
    await supabase.from('users').update({ mfa_enabled: false }).eq('id', req.user.id);
    
    res.status(200).json({ message: '2FA factor unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during 2FA unenrollment' });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};
