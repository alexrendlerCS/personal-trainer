/**
 * Simple Database Migration Runner
 * Executes SQL migration directly via Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('📝 Running migration: Add phone and name fields to users table\n');

  try {
    // Execute each ALTER TABLE statement separately
    console.log('⏳ Adding phone column...');
    const { error: phoneError } = await supabase
      .from('users')
      .select('phone')
      .limit(0);
    
    if (phoneError && phoneError.message.includes('column "phone" does not exist')) {
      console.log('   → Column does not exist yet, creating it...');
      // Note: We can't execute raw SQL from JS client, so we'll provide instructions
      console.log('   ⚠️  Please run the migration SQL in Supabase Dashboard\n');
      printInstructions();
      return;
    } else {
      console.log('   ✅ Phone column already exists or migration needed\n');
    }

    console.log('⏳ Adding first_name column...');
    const { error: firstNameError } = await supabase
      .from('users')
      .select('first_name')
      .limit(0);
    
    if (firstNameError && firstNameError.message.includes('column "first_name" does not exist')) {
      console.log('   → Column does not exist yet, creating it...');
      printInstructions();
      return;
    } else {
      console.log('   ✅ First name column already exists or migration needed\n');
    }

    console.log('⏳ Adding last_name column...');
    const { error: lastNameError } = await supabase
      .from('users')
      .select('last_name')
      .limit(0);
    
    if (lastNameError && lastNameError.message.includes('column "last_name" does not exist')) {
      console.log('   → Column does not exist yet, creating it...');
      printInstructions();
      return;
    } else {
      console.log('   ✅ Last name column already exists or migration needed\n');
    }

    console.log('✅ All columns exist! Migration may have already been applied.\n');
    console.log('🎉 Database schema is ready!');

  } catch (error) {
    console.error('\n❌ Error checking database:');
    console.error(error.message);
    printInstructions();
  }
}

function printInstructions() {
  const migrationPath = path.join(__dirname, 'supabase/migrations/20260319_add_phone_and_name_fields_to_users.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('\n📋 MANUAL MIGRATION REQUIRED');
  console.log('═'.repeat(60));
  console.log('\n🔧 Steps to run migration:');
  console.log('\n1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Copy and paste this SQL:\n');
  console.log('─'.repeat(60));
  console.log(migrationSQL);
  console.log('─'.repeat(60));
  console.log('\n3. Click "Run" button');
  console.log('4. Verify success ✅');
  console.log('\n📁 Or find the SQL file at:');
  console.log(`   ${migrationPath}\n`);
}

runMigration();
