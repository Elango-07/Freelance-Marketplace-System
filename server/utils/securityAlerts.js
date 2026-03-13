import { supabase } from '../config/supabase.js';

/**
 * Logs security events and potentially triggers email notifications
 * Step 10: Security Alerts
 */
export const logSecurityEvent = async (userId, type, details = {}) => {
  try {
    const { ip, device } = details;
    
    // 1. Log to suspicious_activity table
    await supabase.from('suspicious_activity').insert({
      user_id: userId,
      activity_type: type,
      ip_address: ip,
      device_info: device,
      severity: getSeverity(type)
    });

    // 2. LOGIC: Here you would integrate with a mail service (Nodemailer, Resend, etc.)
    // to send an actual email to the user.
    console.log(`[SECURITY ALERT: ${type}] recorded for user ${userId}`);
    
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

const getSeverity = (type) => {
  switch (type) {
    case 'password_changed': return 'Medium';
    case 'email_changed': return 'High';
    case 'new_ip': return 'Low';
    case 'failed_login_burst': return 'High';
    default: return 'Medium';
  }
};
