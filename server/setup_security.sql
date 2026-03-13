-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO SETUP SESSION TRACKING

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  device_name TEXT,
  ip_address TEXT,
  location TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Active dynamic sessions index
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions (user_id);

-- Step 13: Ensure users table has all required fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

-- Step 7: Suspicious Activity Tracking
CREATE TABLE IF NOT EXISTS public.suspicious_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT, -- 'new_ip', 'new_device', 'failed_login_burst'
  ip_address TEXT,
  device_info TEXT,
  severity TEXT DEFAULT 'Low', -- 'Low', 'Medium', 'High'
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS suspicious_user_id_idx ON public.suspicious_activity (user_id);
