import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
  console.log('--- DIAGNOSTIC START ---');
  
  // 1. Check if 'users' table exists and what columns it has
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from users table:', error);
  } else {
    console.log('Successfully selected from users table.');
    if (data && data.length > 0) {
      console.log('Row columns:', Object.keys(data[0]));
    } else {
      console.log('Users table is empty.');
    }
  }

  // 2. Try a manual insert to see if it works or fails with the same error
  const testId = '00000000-0000-0000-0000-000000000000';
  console.log('Testing manual insert into users table...');
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: testId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'client'
    });

  if (insertError) {
    console.error('Manual insert failed:', insertError);
  } else {
    console.log('Manual insert succeeded!');
    // Cleanup
    await supabase.from('users').delete().eq('id', testId);
  }

  console.log('--- DIAGNOSTIC END ---');
}

diagnose();
