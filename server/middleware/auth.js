import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user profile from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found or session expired' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    req.user = { 
      ...user, 
      isVerified: user.verified 
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const partnerOnly = (req, res, next) => {
  if (req.user.role !== 'partner' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Partner access required' });
  }
  next();
};

export const clientOnly = (req, res, next) => {
  if (req.user.role !== 'client' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Client access required' });
  }
  next();
};
