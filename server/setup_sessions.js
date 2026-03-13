import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupSessionsTable() {
  console.log('--- Setting up Sessions Table ---');
  
  // Create a sessions table to track login metadata
  const { error } = await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS public.sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        device_name TEXT,
        ip_address TEXT,
        location TEXT,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
      
      -- Add index for user_id
      CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions (user_id);
    `
  });

  if (error) {
    // If execute_sql RPC doesn't exist, we might need a different approach or inform the user.
    // Supabase usually requires SQL to be run in the dashboard or via a migration tool.
    console.error('Error creating table:', error.message);
    console.log('NOTE: You might need to run this SQL in your Supabase Dashboard SQL Editor.');
  } else {
    console.log('Sessions table created successfully.');
  }
}

setupSessionsTable();
