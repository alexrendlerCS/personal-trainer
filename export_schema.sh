#!/bin/bash

# Export complete database schema for CoachKilday iOS app development
PGPASSWORD='Rendypoo1!' psql -h aws-0-us-west-1.pooler.supabase.com -p 6543 -U postgres.gpbarexscmauxziijhxe -d postgres << 'EOF'

-- =====================================================
-- COMPLETE DATABASE SCHEMA EXPORT FOR COACHKILDAY iOS
-- =====================================================

\echo '=== TABLE STRUCTURES ==='

\d+ users
\d+ sessions  
\d+ packages
\d+ payments
\d+ contracts
\d+ discount_codes
\d+ trainer_availability
\d+ trainer_unavailable_slots
\d+ notifications
\d+ messages
\d+ availability
\d+ password_reset_tokens
\d+ activity_log
\d+ session_payments
\d+ newsletter_subscribers

\echo ''
\echo '=== ROW LEVEL SECURITY POLICIES ==='

SELECT schemaname, tablename, policyname, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

\echo ''
\echo '=== TABLE CONSTRAINTS ==='

SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

\echo ''
\echo '=== INDEXES ==='

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''
\echo '=== SAMPLE DATA (for understanding current structure) ==='

\echo 'USERS (first 3 rows):'
SELECT id, full_name, email, role, status, created_at, contract_accepted, google_account_connected 
FROM users 
LIMIT 3;

\echo ''
\echo 'PACKAGES (with counts by type):'
SELECT package_type, status, COUNT(*), AVG(sessions_included) as avg_sessions, AVG(price) as avg_price
FROM packages 
GROUP BY package_type, status
ORDER BY package_type, status;

\echo ''
\echo 'SESSIONS (with counts by type and status):'
SELECT type, status, COUNT(*) as count, 
       MIN(date) as earliest_date, 
       MAX(date) as latest_date
FROM sessions 
GROUP BY type, status
ORDER BY type, status;

\echo ''
\echo 'PAYMENTS (summary by method and status):'
SELECT method, status, COUNT(*) as count, 
       SUM(amount) as total_amount,
       AVG(amount) as avg_amount
FROM payments 
GROUP BY method, status
ORDER BY method, status;

\echo ''
\echo 'DISCOUNT CODES (active codes):'
SELECT code, percent_off, amount_off, currency, max_redemptions, expires_at
FROM discount_codes 
WHERE expires_at IS NULL OR expires_at > NOW()
ORDER BY created_at DESC;

EOF