import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
  console.log('--- ENUM DIAGNOSTIC START ---');
  
  const testId = '00000000-0000-0000-0000-333333333333';
  const roles = ['client', 'partner', 'admin', 'Client', 'Partner', 'Admin'];
  
  for (const role of roles) {
    console.log(`Testing role: "${role}"...`);
    const { error } = await supabase.from('users').insert({
      id: testId,
      email: `${role}@test.com`,
      name: 'Test',
      role: role
    });
    
    if (error) {
      console.log(`Role "${role}" FAILED. Error: ${error.message}`);
    } else {
      console.log(`Role "${role}" SUCCEEDED.`);
      await supabase.from('users').delete().eq('id', testId);
    }
  }

  console.log('--- ENUM DIAGNOSTIC END ---');
}

diagnose();
