import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debug() {
  console.log('--- DEEP DEBUG START ---');
  
  const email2 = `admin_test_${Date.now()}@example.com`;
  console.log(`Attempting admin.createUser for ${email2}...`);
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email: email2,
    password: 'Password123!',
    user_metadata: {
      name: 'Admin Test User',
      full_name: 'Admin Test User',
      role: 'client'
    },
    email_confirm: true
  });

  if (adminError) {
    console.error('Admin Create Error:', adminError.message, adminError.status);
  } else {
    console.log('Admin Create SUCCEEDED:', adminData.user.id);
    // Cleanup
    await supabase.auth.admin.deleteUser(adminData.user.id);
  }

  console.log('--- DEEP DEBUG END ---');
}

debug();
