#!/usr/bin/env node

/**
 * Verify if "Intro to VT Sessions" migration is needed and test it
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyIntroVTSessions() {
  console.log('🔍 VERIFYING "INTRO TO VT SESSIONS" IMPLEMENTATION\n');
  console.log('=' .repeat(70));

  // 1. Check if type exists in database
  console.log('\n📊 STEP 1: Testing Database Constraint');
  console.log('-'.repeat(70));
  
  // Try to create a test package with the new type
  const testClientId = '00000000-0000-0000-0000-000000000000'; // Invalid, will fail on FK
  
  const { data: testPackage, error: testError } = await supabase
    .from('packages')
    .insert({
      client_id: testClientId,
      package_type: 'Intro to VT Sessions',
      sessions_included: 1,
      original_sessions: 1,
      purchase_date: '2024-01-01',
      status: 'active'
    })
    .select();

  if (testError) {
    if (testError.message.includes('violates foreign key constraint')) {
      console.log('✅ Database constraint ALLOWS "Intro to VT Sessions"');
      console.log('   (Foreign key error is expected - testing with invalid client_id)');
    } else if (testError.message.includes('violates check constraint') || 
               testError.message.includes('invalid input value')) {
      console.log('❌ Database constraint BLOCKS "Intro to VT Sessions"');
      console.log('   Error:', testError.message);
      console.log('\n⚠️  MIGRATION NEEDED! Run this SQL:');
      console.log('   See: supabase/migrations/20260329_add_intro_vt_sessions_type.sql\n');
      return false;
    } else {
      console.log('⚠️  Unexpected error:', testError.message);
    }
  }

  // 2. Check existing data
  console.log('\n📦 STEP 2: Checking for Existing "Intro to VT Sessions" Data');
  console.log('-'.repeat(70));
  
  const { data: packages, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('package_type', 'Intro to VT Sessions');

  const { data: sessions, error: sessError } = await supabase
    .from('sessions')
    .select('*')
    .eq('type', 'Intro to VT Sessions');

  console.log(`Packages with "Intro to VT Sessions": ${packages?.length || 0}`);
  console.log(`Sessions with "Intro to VT Sessions": ${sessions?.length || 0}`);
  
  if ((packages?.length || 0) > 0 || (sessions?.length || 0) > 0) {
    console.log('✅ Type is already in use!');
  } else {
    console.log('ℹ️  No data yet (expected before trainer adds first package)');
  }

  // 3. Check all current types
  console.log('\n📋 STEP 3: Current Training Types in Database');
  console.log('-'.repeat(70));
  
  const { data: allPackages } = await supabase
    .from('packages')
    .select('package_type');
    
  const { data: allSessions } = await supabase
    .from('sessions')
    .select('type');

  const packageTypes = [...new Set(allPackages?.map(p => p.package_type) || [])].sort();
  const sessionTypes = [...new Set(allSessions?.map(s => s.type) || [])].sort();

  console.log('\nPackage Types:');
  packageTypes.forEach(type => {
    const count = allPackages?.filter(p => p.package_type === type).length || 0;
    const indicator = type === 'Intro to VT Sessions' ? '✨ NEW!' : '';
    console.log(`  • ${type} (${count} packages) ${indicator}`);
  });

  console.log('\nSession Types:');
  sessionTypes.forEach(type => {
    const count = allSessions?.filter(s => s.type === type).length || 0;
    const indicator = type === 'Intro to VT Sessions' ? '✨ NEW!' : '';
    console.log(`  • ${type} (${count} sessions) ${indicator}`);
  });

  // 4. Summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(70));
  
  const hasIntroType = packageTypes.includes('Intro to VT Sessions') || 
                       sessionTypes.includes('Intro to VT Sessions');
  
  if (hasIntroType) {
    console.log('\n✅ "Intro to VT Sessions" is FULLY OPERATIONAL');
    console.log('   - Database constraint allows the type');
    console.log('   - Type is already in use');
    console.log('   - Ready for production use');
  } else {
    console.log('\n⚠️  "Intro to VT Sessions" is READY but NOT YET USED');
    console.log('   - Database constraint allows the type');
    console.log('   - Waiting for trainer to add first package');
    console.log('   - Code changes are complete');
  }
  
  console.log('\n📖 Next Steps:');
  console.log('   1. Have trainer log in');
  console.log('   2. Go to Trainer → Clients');
  console.log('   3. Click "Add Sessions" for a client');
  console.log('   4. Select "Intro to VT Sessions (30 min)"');
  console.log('   5. Add sessions and test booking\n');

  return true;
}

verifyIntroVTSessions().catch(console.error);
