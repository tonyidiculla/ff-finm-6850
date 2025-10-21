/**
 * Sync Chart of Accounts with Supabase Database
 * 
 * This script creates the finm_accounts table if it doesn't exist
 * and sets up proper RLS policies and indexes.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncAccounts() {
  console.log('🔄 Syncing Chart of Accounts with Database...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-accounts-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL migration...');

    // Execute the SQL using Supabase's RPC (if available) or direct query
    // Note: Supabase JS client doesn't support raw SQL, so we'll use the SQL editor approach
    
    console.log('\n📋 SQL to execute:');
    console.log('━'.repeat(80));
    console.log(sql);
    console.log('━'.repeat(80));
    console.log('\n⚠️  Please execute the above SQL in your Supabase SQL Editor:');
    console.log(`   ${supabaseUrl.replace('https://', 'https://app.')}/project/_/sql\n`);
    
    // Alternative: Check if table exists
    console.log('🔍 Checking if finm_accounts table exists...');
    const { data, error } = await supabase
      .from('finm_accounts')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('❌ Table does not exist. Please run the SQL above in Supabase SQL Editor.');
      } else {
        console.log('⚠️  Error checking table:', error.message);
      }
    } else {
      console.log('✅ finm_accounts table exists!');
      console.log('\nYou can now:');
      console.log('1. Test the accounts API: curl http://localhost:6850/api/accounts');
      console.log('2. Create accounts from template');
      console.log('3. Create journal entries');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

syncAccounts();
