require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deepInvestigation() {
    console.log('🔬 DEEP DATABASE INVESTIGATION\n');

    // 1. Check the exact sessions that failed vs succeeded
    console.log('📊 DETAILED SESSION ANALYSIS:');
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, date, start_time, google_event_id, client_google_event_id, created_at, client_id, trainer_id')
        .eq('is_recurring', true)
        .order('created_at', { ascending: false })
        .limit(15);

    sessions.forEach(s => {
        const trainerSuccess = s.google_event_id ? '✅ SUCCESS' : '❌ FAILED ';
        const clientSuccess = s.client_google_event_id ? '✅ SUCCESS' : '❌ FAILED ';
        console.log(`${s.created_at.substring(5, 16)} | ${s.date} ${s.start_time}`);
        console.log(`   Trainer: ${trainerSuccess} | Client: ${clientSuccess}`);
        console.log(`   Session ID: ${s.id}`);
        console.log(`   Client ID: ${s.client_id} | Trainer ID: ${s.trainer_id}`);
        console.log('');
    });

    console.log('\n🎯 SUCCESS vs FAILURE PATTERN:');
    const successfulSessions = sessions.filter(s => s.google_event_id);
    const failedSessions = sessions.filter(s => !s.google_event_id);

    console.log(`✅ Successful trainer calendar events: ${successfulSessions.length}`);
    console.log(`❌ Failed trainer calendar events: ${failedSessions.length}`);

    if (successfulSessions.length > 0) {
        console.log('\n✅ SUCCESSFUL SESSIONS DETAILS:');
        successfulSessions.forEach(s => {
            console.log(`   ${s.created_at.substring(0, 16)} | ${s.date} | Event ID: ${s.google_event_id}`);
        });
    }

    if (failedSessions.length > 0) {
        console.log('\n❌ FAILED SESSIONS DETAILS:');
        failedSessions.slice(0, 5).forEach(s => {
            console.log(`   ${s.created_at.substring(0, 16)} | ${s.date} | Session: ${s.id}`);
        });
    }

    // 2. Check for any pattern in client/trainer IDs
    console.log('\n👥 USER ID PATTERNS:');
    const trainerIds = [...new Set(sessions.map(s => s.trainer_id))];
    const clientIds = [...new Set(sessions.map(s => s.client_id))];

    console.log(`Unique trainers involved: ${trainerIds.length}`);
    console.log(`Unique clients involved: ${clientIds.length}`);

    trainerIds.forEach(id => {
        const trainerSessions = sessions.filter(s => s.trainer_id === id);
        const successRate = trainerSessions.filter(s => s.google_event_id).length / trainerSessions.length * 100;
        console.log(`   Trainer ${id}: ${trainerSessions.length} sessions, ${successRate.toFixed(0)}% success rate`);
    });

    // 3. Check if there are any single (non-recurring) sessions that worked recently
    console.log('\n🔍 COMPARING WITH SINGLE SESSIONS:');
    const { data: singleSessions } = await supabase
        .from('sessions')
        .select('id, date, start_time, google_event_id, client_google_event_id, created_at, is_recurring')
        .eq('is_recurring', false)
        .gte('created_at', '2026-03-10T00:00:00')
        .order('created_at', { ascending: false })
        .limit(10);

    console.log(`Recent single sessions: ${singleSessions.length}`);
    singleSessions.forEach(s => {
        const trainerSuccess = s.google_event_id ? '✅' : '❌';
        const clientSuccess = s.client_google_event_id ? '✅' : '❌';
        console.log(`   ${s.created_at.substring(5, 16)} | ${s.date} | T:${trainerSuccess} C:${clientSuccess}`);
    });

    // 4. Check the specific trainer's Google Calendar settings
    const trainerId = '770d2327-1fc2-4f24-bac7-747626e6bf77'; // Alex Trainer
    console.log('\n🧑‍🏫 TRAINER GOOGLE CALENDAR STATUS:');
    const { data: trainerData } = await supabase
        .from('users')
        .select('id, full_name, email, google_account_connected, google_refresh_token, google_calendar_id')
        .eq('id', trainerId)
        .single();

    if (trainerData) {
        console.log(`   Name: ${trainerData.full_name}`);
        console.log(`   Email: ${trainerData.email}`);
        console.log(`   Google Connected: ${trainerData.google_account_connected}`);
        console.log(`   Has Refresh Token: ${trainerData.google_refresh_token ? 'YES' : 'NO'}`);
        console.log(`   Has Calendar ID: ${trainerData.google_calendar_id ? 'YES' : 'NO'}`);
    }
}

deepInvestigation().then(() => process.exit());