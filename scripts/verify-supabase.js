const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './dashboard/.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection to:', url);

if (!url || !key) {
  console.error('Supabase URL or Key missing in dashboard/.env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function checkTables() {
  const tables = ['users', 'sessions', 'domain_logs', 'daily_kpis', 'heartbeat_logs', 'webhook_logs'];
  console.log('\nChecking tables in your Supabase project:');
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${t}': NOT FOUND or Error -> ${error.message}`);
    } else {
      console.log(`✅ Table '${t}': EXISTS and accessible! (Row count sampled: ${data.length})`);
    }
  }
}

checkTables();
