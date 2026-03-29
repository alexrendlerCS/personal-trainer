#!/usr/bin/env node

/**
 * Check actual database constraints and data types for training types
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

async function checkDatabase() {
  console.log('🔍 CHECKING DATABASE TRAINING TYPES\n');

  // 1. Check distinct session types
  console.log('📊 SESSIONS TABLE - DISTINCT TYPES:');
  console.log('=' .repeat(60));
  const { data: sessionTypes, error: sessionError } = await supabase
    .from('sessions')
    .select('type')
    .order('type');

  if (sessionError) {
    console.error('Error fetching session types:', sessionError);
  } else {
    const uniqueTypes = [...new Set(sessionTypes.map(s => s.type))];
    console.log(`Found ${sessionTypes.length} total sessions with ${uniqueTypes.length} unique types:\n`);
    uniqueTypes.forEach(type => {
      const count = sessionTypes.filter(s => s.type === type).length;
      console.log(`  ✓ "${type}" (${count} sessions)`);
    });
  }

  // 2. Check distinct package types
  console.log('\n📦 PACKAGES TABLE - DISTINCT TYPES:');
  console.log('=' .repeat(60));
  const { data: packageTypes, error: packageError } = await supabase
    .from('packages')
    .select('package_type')
    .order('package_type');

  if (packageError) {
    console.error('Error fetching package types:', packageError);
  } else {
    const uniqueTypes = [...new Set(packageTypes.map(p => p.package_type))];
    console.log(`Found ${packageTypes.length} total packages with ${uniqueTypes.length} unique types:\n`);
    uniqueTypes.forEach(type => {
      const count = packageTypes.filter(p => p.package_type === type).length;
      const activeCount = packageTypes.filter(p => p.package_type === type).length;
      console.log(`  ✓ "${type}" (${count} packages)`);
    });
  }

  // 3. Check for any "Posing Package" data
  console.log('\n🎯 POSING PACKAGE SPECIFIC CHECK:');
  console.log('=' .repeat(60));
  
  const { data: posingSessions, error: posingSessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('type', 'Posing Package');

  const { data: posingPackages, error: posingPackageError } = await supabase
    .from('packages')
    .select('*')
    .eq('package_type', 'Posing Package');

  console.log(`Sessions with "Posing Package" type: ${posingSessions?.length || 0}`);
  console.log(`Packages with "Posing Package" type: ${posingPackages?.length || 0}`);

  // 4. Try to insert a test to see what constraint exists
  console.log('\n🧪 TESTING DATABASE CONSTRAINT:');
  console.log('=' .repeat(60));
  console.log('Attempting to create a package with "Test Type" to see error...\n');
  
  const { data: testPackage, error: testError } = await supabase
    .from('packages')
    .insert({
      client_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID, will fail
      package_type: 'Test Type That Does Not Exist',
      sessions_included: 1,
      original_sessions: 1,
      purchase_date: '2024-01-01',
      status: 'active'
    })
    .select();

  if (testError) {
    console.log('Error message:', testError.message);
    console.log('Error details:', testError.details);
    console.log('Error hint:', testError.hint);
    
    // Parse constraint info from error
    if (testError.message.includes('violates check constraint')) {
      console.log('\n✅ Check constraint exists on package_type');
    } else if (testError.message.includes('violates foreign key')) {
      console.log('\n(Expected foreign key error for invalid client_id)');
    }
  }

  // 5. Check payments table for package_type column
  console.log('\n💳 PAYMENTS TABLE - PACKAGE TYPES:');
  console.log('=' .repeat(60));
  const { data: paymentTypes, error: paymentError } = await supabase
    .from('payments')
    .select('package_type')
    .not('package_type', 'is', null)
    .order('package_type');

  if (paymentError) {
    console.error('Error fetching payment package types:', paymentError);
  } else {
    const uniqueTypes = [...new Set(paymentTypes.map(p => p.package_type))];
    console.log(`Found ${paymentTypes.length} payments with package_type specified:\n`);
    uniqueTypes.forEach(type => {
      const count = paymentTypes.filter(p => p.package_type === type).length;
      console.log(`  ✓ "${type}" (${count} payments)`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ DATABASE CHECK COMPLETE\n');
}

checkDatabase().catch(console.error);
