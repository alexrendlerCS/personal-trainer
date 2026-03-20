require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugRecurringSessions() {
  try {
    console.log('🔍 Investigating recent recurring sessions...\n');

    // Check recent recurring sessions
    const { data: recentSessions, error } = await supabase
      .from('sessions')
      .select('id, date, start_time, type, status, is_recurring, google_event_id, client_google_event_id, created_at')
      .eq('is_recurring', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    }

    console.log('Recent recurring sessions:');
    recentSessions.forEach(session => {
      console.log(`📅 Session ${session.id}:`);
      console.log(`   Date: ${session.date} ${session.start_time}`);
      console.log(`   Type: ${session.type} | Status: ${session.status}`);
      console.log(`   Trainer Event ID: ${session.google_event_id || 'null'}`);
      console.log(`   Client Event ID: ${session.client_google_event_id || 'null'}`);
      console.log(`   Created: ${session.created_at}`);
      console.log('   ---');
    });

    // Check for sessions on Monday 3/30/2026
    const targetDate = '2026-03-30';
    const { data: mondaySessions, error: mondayError } = await supabase
      .from('sessions')
      .select('*')
      .eq('date', targetDate)
      .order('start_time');

    if (mondayError) {
      console.error('Error fetching Monday sessions:', mondayError);
      return;
    }

    console.log(`\n📍 Sessions on ${targetDate}:`);
    if (mondaySessions.length === 0) {
      console.log('   No sessions found for this date');
    } else {
      mondaySessions.forEach(session => {
        console.log(`   ${session.start_time} - ${session.type} (${session.status}) - Recurring: ${session.is_recurring}`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Trainer Event: ${session.google_event_id || 'null'}`);
        console.log(`   Client Event: ${session.client_google_event_id || 'null'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugRecurringSessions();