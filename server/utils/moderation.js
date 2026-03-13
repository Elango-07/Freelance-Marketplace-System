export const moderationCheck = (text) => {
  const BLOCKED_PATTERNS = [
    { type: 'phone',  label: 'phone number',    regex: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/ },
    { type: 'email',  label: 'email address',   regex: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/ },
    { type: 'link',   label: 'external link',   regex: /\b(https?:\/\/|www\.)[^\s]+\b/ },
    { type: 'social', label: 'social media link', regex: /\b(instagram|twitter|facebook|linkedin|telegram|whatsapp|t\.me|wa\.me|fb\.com|tiktok)\.?[\s\S]{0,30}\b/i },
  ];

  const violations = [];
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.regex.test(text)) {
      violations.push(pattern.label);
    }
  }
  return violations;
};

export const logViolation = async (supabase, userId, messageId, reason) => {
  await supabase.from('violations').insert({
    user_id: userId,
    message_id: messageId,
    reason: `System detected: ${reason}`
  });
};
