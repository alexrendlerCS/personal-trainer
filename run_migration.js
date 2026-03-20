/**
 * Database Migration Runner
 * Runs the migration to add phone, first_name, and last_name to users table
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  // Initialize Supabase client with service role key for admin access
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Read the migration file
  const migrationPath = path.join(__dirname, 'supabase/migrations/20260319_add_phone_and_name_fields_to_users.sql');
  
  try {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully');
    console.log('📝 Migration content:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log();

    // Execute the migration
    console.log('⏳ Executing migration...');
    
    // Split the SQL into individual statements (excluding comments)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        // If RPC doesn't exist, try direct query
        if (error && error.message.includes('Could not find the function')) {
          // We need to use the Postgres client directly
          // For now, let's output instructions
          console.log('⚠️  Direct SQL execution not available via JS client');
          console.log('📋 Please run this migration manually using one of these methods:\n');
          console.log('Option 1 - Supabase Dashboard:');
          console.log('  1. Go to your Supabase project dashboard');
          console.log('  2. Navigate to SQL Editor');
          console.log('  3. Copy and paste the migration SQL from:');
          console.log(`     ${migrationPath}`);
          console.log('  4. Run the query\n');
          
          console.log('Option 2 - psql command line:');
          console.log('  psql <your-database-url> < ' + migrationPath);
          console.log();
          
          console.log('Option 3 - Supabase CLI:');
          console.log('  supabase db push\n');
          
          console.log('✅ Migration file is ready at:');
          console.log(`   ${migrationPath}`);
          return;
        }
        
        if (error) {
          throw error;
        }
      }
    }

    console.log('✅ Migration completed successfully!\n');

    // Verify the columns were added
    console.log('🔍 Verifying new columns...');
    const { data, error: verifyError } = await supabase
      .from('users')
      .select('phone, first_name, last_name')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  Could not verify columns (may need to wait for schema cache):');
      console.log(verifyError.message);
    } else {
      console.log('✅ New columns verified in database schema');
      console.log('   - phone');
      console.log('   - first_name');
      console.log('   - last_name');
    }

    console.log('\n📊 Database schema updated successfully!');
    console.log('\n🎯 Next steps:');
    console.log('   1. Update sign-up form to use first_name, last_name, and phone');
    console.log('   2. Add edit client info functionality');
    console.log('   3. Update displays to show phone numbers where needed');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.log('\n📋 Manual migration instructions:');
    console.log('Please run the SQL migration manually:');
    console.log(`File: ${migrationPath}`);
    process.exit(1);
  }
}

runMigration();
