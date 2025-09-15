-- Fix the problematic package data
-- This corrects the package that was incorrectly updated by the webhook

-- Update the package to reflect the correct values from the Stripe payment
UPDATE packages 
SET 
    sessions_included = 4,  -- Client paid for 4 sessions
    original_sessions = 4,  -- Original package size was 4 sessions
    transaction_id = 'cs_live_a13KebpZM3nrYcSeYmIaUxntIeJiBfbpCpFdTmP3wY9Qu0fTbQcGhpEZrS',  -- Link to Stripe payment
    price = 520.00,  -- Amount paid
    purchase_date = '2025-09-14'  -- Date from the payment record
WHERE id = '1cb3004c-1775-4792-9eea-dfb11d1170f9';

-- Verify the update
SELECT 
    id,
    client_id,
    package_type,
    sessions_included,
    sessions_used,
    original_sessions,
    transaction_id,
    price,
    purchase_date,
    status
FROM packages 
WHERE id = '1cb3004c-1775-4792-9eea-dfb11d1170f9';

-- Also verify the payment record has the correct package_id
UPDATE payments 
SET package_id = '1cb3004c-1775-4792-9eea-dfb11d1170f9'
WHERE transaction_id = 'cs_live_a13KebpZM3nrYcSeYmIaUxntIeJiBfbpCpFdTmP3wY9Qu0fTbQcGhpEZrS';

-- Verify the payment record
SELECT 
    id,
    client_id,
    amount,
    session_count,
    package_type,
    package_id,
    transaction_id,
    status
FROM payments 
WHERE transaction_id = 'cs_live_a13KebpZM3nrYcSeYmIaUxntIeJiBfbpCpFdTmP3wY9Qu0fTbQcGhpEZrS';
