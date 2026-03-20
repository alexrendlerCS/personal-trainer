# Database Migration: Add Phone and Name Fields

**Migration File**: `supabase/migrations/20260319_add_phone_and_name_fields_to_users.sql`

## What This Migration Does

Adds three new optional columns to the `users` table:
- `phone` (VARCHAR(20)) - For storing client phone numbers
- `first_name` (VARCHAR(255)) - For storing first name separately
- `last_name` (VARCHAR(255)) - For storing last name separately

**Note**: The existing `full_name` column is kept for backward compatibility.

## How to Run the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20260319_add_phone_and_name_fields_to_users.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** button
7. Verify success ✅

### Option 2: Node.js Script (Automated)
```bash
node run_migration.js
```

### Option 3: Supabase CLI
```bash
supabase db push
```

### Option 4: Direct psql Command
```bash
psql <your-database-connection-string> < supabase/migrations/20260319_add_phone_and_name_fields_to_users.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('phone', 'first_name', 'last_name');
```

Expected result:
| column_name | data_type         | is_nullable |
|-------------|-------------------|-------------|
| phone       | character varying | YES         |
| first_name  | character varying | YES         |
| last_name   | character varying | YES         |

## What Changes After Migration

### New User Sign-Up Flow
- Will collect first_name, last_name, and phone
- Still stores full_name as: `first_name + ' ' + last_name`

### Existing Users
- Will continue to work with just `full_name`
- Can be updated later via "Edit Client Info" feature

### Backward Compatibility
- All existing code using `full_name` continues to work
- No data migration needed
- Gradual transition to new fields

## Next Steps After Migration

1. ✅ Update TypeScript types (`lib/database.types.ts`) - DONE
2. 🔨 Update sign-up form to collect split names and phone
3. 🔨 Add "Edit Client Info" modal on clients page
4. 🔨 Update client displays to show phone numbers (optional)

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the new columns
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
```

## Safety Notes

✅ **Safe to run** - This migration:
- Only adds new optional columns
- Does not modify existing data
- Does not delete or rename any columns
- Does not break existing functionality
- Uses `IF NOT EXISTS` to prevent errors if run multiple times

⚠️ **Before running**:
- Backup your database (optional but recommended)
- Run during low-traffic period (optional)
- Test in development/staging first (if available)
