# New Training Type Implementation Analysis

## Executive Summary

Adding a new training type requires updates across **multiple layers** of the application. Based on previous issues, we need to ensure consistency across:
- Database schema (TypeScript types)
- Frontend UI components (4 types currently defined in different places)
- Session booking flows
- Package purchase flows
- Google Calendar integration
- Email notifications
- Analytics/reporting
- Stripe payment integration

## Current Training Types

The application currently supports **4 training types** consistently across database and UI:

### Database Schema (lib/database.types.ts) ✅ FIXED
✅ **sessions.type**: `"In-Person Training" | "Virtual Training" | "Partner Training" | "Posing Package"`
✅ **packages.package_type**: `"In-Person Training" | "Virtual Training" | "Partner Training" | "Posing Package"`

**Database Verification (as of March 29, 2026):**
- ✅ 308 total sessions across 4 types:
  - In-Person Training: 275 sessions
  - Virtual Training: 26 sessions
  - Partner Training: 2 sessions
  - Posing Package: 5 sessions
  
- ✅ 127 total packages across 4 types:
  - In-Person Training: 113 packages
  - Virtual Training: 10 packages
  - Partner Training: 1 package
  - Posing Package: 3 packages

### UI/Frontend (Multiple locations) ✅
The following locations define **4 types** including "Posing Package":
1. `app/trainer/schedule/page.tsx` - Lines 216-242
2. `app/client/booking/page.tsx` - Lines 83-117
3. `app/client/packages/page.tsx` - Lines 62-65, 231-260
4. `app/client/dashboard/page.tsx` - Lines 514-534

---

## ✅ Schema Updated - No Critical Issues

The TypeScript schema file has been updated to match the actual database state. All 4 training types are now properly defined.

---

## Complete Implementation Checklist

### ✅ 1. DATABASE LAYER

#### A. TypeScript Type Definitions (`lib/database.types.ts`)
**Lines to Update:**
- Line 98: `sessions.Row.type`
- Line 126: `sessions.Insert.type`
- Line 154: `sessions.Update.type`
- Line 179-182: `packages.Row.package_type`
- Line 196-199: `packages.Insert.package_type`
- Line 213-216: `packages.Update.package_type`

**Current:**
```typescript
type: "In-Person Training" | "Virtual Training" | "Partner Training";
```

**Action Required:**
```typescript
type: "In-Person Training" | "Virtual Training" | "Partner Training" | "Posing Package" | "NEW_TYPE_NAME";
```

#### B. Database Migration
**Must create migration file** to update the enum constraint on:
- `sessions.type` column
- `packages.package_type` column

**Example SQL:**
```sql
-- Update sessions table constraint
ALTER TABLE sessions 
DROP CONSTRAINT IF EXISTS sessions_type_check;

ALTER TABLE sessions 
ADD CONSTRAINT sessions_type_check 
CHECK (type IN ('In-Person Training', 'Virtual Training', 'Partner Training', 'Posing Package', 'NEW_TYPE_NAME'));

-- Update packages table constraint  
ALTER TABLE packages 
DROP CONSTRAINT IF EXISTS packages_package_type_check;

ALTER TABLE packages 
ADD CONSTRAINT packages_package_type_check 
CHECK (package_type IN ('In-Person Training', 'Virtual Training', 'Partner Training', 'Posing Package', 'NEW_TYPE_NAME'));
```

---

### ✅ 2. SESSION BOOKING FLOW

#### A. Trainer Schedule Page (`app/trainer/schedule/page.tsx`)
**Line 216-242**: Session types array
```typescript
const sessionTypes = [
  {
    id: "In-Person Training",
    name: "In-Person Training",
    duration: "60 min",
    description: "One-on-one personal training sessions at our facility",
  },
  // ... add new type here
];
```

**Other locations in this file:**
- Line 2519-2528: Package type summary calculation
- Line 2591: Package type filtering
- Line 550-570: Package summary by type

#### B. Client Booking Page (`app/client/booking/page.tsx`)
**Line 83-117**: Session types array (same structure as above)

**Critical logic areas:**
- Line 275: `isInPerson` check for location logic
- Line 352: `isInPerson` check for timezone logic
- Line 1320: Timezone determination based on session type
- Line 1518: In-person location requirements
- Line 1792: Timezone logic for recurring sessions
- Line 1988: Location field population
- Line 884-903: Package type initialization object
- Line 859-938: Session availability checking

**Action Required:**
- Add to session types array
- Update `isInPerson` logic if new type requires location
- Consider timezone handling (in-person = trainer timezone, virtual = client timezone)

---

### ✅ 3. PACKAGE PURCHASE FLOW

#### A. Packages Page (`app/client/packages/page.tsx`)
**Line 62-65**: PackageType TypeScript type
```typescript
type PackageType =
  | "In-Person Training"
  | "Virtual Training"
  | "Partner Training"
  | "Posing Package"
  | "NEW_TYPE_NAME"; // Add here
```

**Line 70-260**: Package sections definition
```typescript
const packageSections: PackageSection[] = [
  {
    title: "In-Person Training",
    description: "Get personalized attention with face-to-face sessions",
    icon: "🏋️",
    packages: [ /* pricing tiers */ ],
  },
  // ... add new section here
];
```

**Other locations:**
- Line 294: Default selected package type
- Line 478-497: Package type counts initialization
- Line 749: Package type validation
- Line 760-764: Single session type array
- Line 832-835: Purchase options array
- Line 1251-1275: Package type UI rendering with icons

#### B. Checkout Session API (`app/api/stripe/checkout-session/route.ts`)
**Line 24-40**: Package pricing definitions
```typescript
const PACKAGE_PRICES: Record<string, PackagePrice> = {
  "In-Person Training": {
    hourlyRate: 130,
    weeklyRates: { /* tiers */ },
  },
  // ... add new type here
};
```

**Line 137-145**: Package description helper
```typescript
switch (type) {
  case "In-Person Training":
    return `🎯 Includes ${count} personalized in-person...`;
  case "NEW_TYPE_NAME":
    return `🎯 Includes ${count} NEW_TYPE description...`;
}
```

**Line 167-175**: Session type description
**Line 215-225**: Image selection by type

#### C. Stripe Webhook (`app/api/stripe/webhook/route.ts`)
**Line 150-152**: Valid package types array
```typescript
const validPackageTypes = [
  "In-Person Training",
  "Virtual Training",
  "Partner Training",
  "NEW_TYPE_NAME", // Add here
];
```

**Other locations:**
- Line 155: Package type extraction from metadata
- Line 209: Payment record creation
- Line 257: Package lookup by type
- Line 381: Package creation
- Line 407: New package type assignment

---

### ✅ 4. CLIENT DASHBOARD

#### A. Dashboard Page (`app/client/dashboard/page.tsx`)
**Line 514-534**: Package types initialization
```typescript
const packageTypes: Record<string, PackageTypeCount> = {
  "In-Person Training": { type: "In-Person Training", remaining: 0, total: 0 },
  // ... add new type here
};
```

**Line 336**: Partner training special icon logic
```typescript
if (rawSession.type === "Partner Training") {
  // Special handling
}
// Add similar logic for new type if needed
```

**Line 1044**: Display logic for type abbreviations

---

### ✅ 5. TRAINER FEATURES

#### A. Clients Page (`app/trainer/clients/page.tsx`)
**Line 1172-1174**: Session type dropdown
```typescript
<SelectItem value="In-Person Training">In-Person Training</SelectItem>
<SelectItem value="Virtual Training">Virtual Training</SelectItem>
<SelectItem value="Partner Training">Partner Training</SelectItem>
<SelectItem value="NEW_TYPE_NAME">NEW_TYPE_NAME</SelectItem>
```

**Other locations:**
- Line 218: Package type field selection
- Line 426-430: Package type display
- Line 639: Package lookup by type
- Line 664: Package creation with type

#### B. Settings Page (`app/trainer/settings/page.tsx`)
**Line 879-881**: Session type dropdown (Add Sessions Modal)
**Line 1156-1157**: Session type dropdown (Manual Package Creation)

**Other locations:**
- Line 787: Package lookup by type
- Line 809: Package creation
- Line 818: Package update
- Line 1063: Manual package creation
- Line 1078: Package update
- Line 1094: Package insertion

#### C. Dashboard Page (`app/trainer/dashboard/page.tsx`)
**Line 667**: Package type field
**Line 810-816**: Default package type for QR code generation
**Line 1361**: Payment package type display
**Line 1434**: QR code description

---

### ✅ 6. GOOGLE CALENDAR INTEGRATION

#### A. Calendar Event Creation (`app/api/google/calendar/event/route.ts`)
**No explicit type filtering** - Uses session data directly
- Line 90-94: Event creation from request body

**Action Required:**
- Verify event description/summary handles new type gracefully
- Test that new type appears correctly in Google Calendar

#### B. Client Calendar Event (`app/api/google/calendar/client-event/route.ts`)
**No explicit type filtering** - Uses session data directly

#### C. Session Email Notifications
**File:** `app/api/email/session-created/route.ts`
- Line 62: Session type in email body

**File:** `app/api/email/recurring-sessions-created/route.ts`
- Line 69: Session type in email body

**Action Required:**
- No changes needed - these pull from session data
- Verify email template displays new type correctly

---

### ✅ 7. SIGNUP FLOW

#### A. Signup Route (`app/api/auth/signup/route.ts`)
**Line 89**: Free package creation for new clients
```typescript
package_type: "In-Person Training", // Hardcoded
```

**Decision Required:**
- Should new clients get a free session of the NEW_TYPE?
- Or keep as "In-Person Training" only?
- Line 149: Email notification mentions "In-Person Training"

---

### ✅ 8. MARKETING/PUBLIC PAGES

#### A. Services Page (`app/services/page.tsx`)
**Line 33-70**: Service offerings
```typescript
{
  title: "In-Person Training",
  description: "...",
  features: [...],
},
// ... add new service here
```

#### B. Services Preview (`components/services-preview.tsx`)
**Line 20-42**: Service cards (3 types shown)

#### C. Login/Signup Page (`app/login/page.tsx`)
**Line 407**: Description mentions training types
**Line 726**: Welcome message mentions "In-Person Training"

#### D. CTA Section (`components/cta-section.tsx`)
**Line 91**: Mentions "virtual, in-person, or partner training"

---

### ✅ 9. ANALYTICS & REPORTING

#### A. Analytics Page (`app/trainer/analytics/AnalyticsClientPage.tsx`)
**Line 326-344**: Package type grouping and aggregation
```typescript
.select("package_type, sessions_included");
// Groups by package_type
```

**Action Required:**
- No changes needed - automatically includes all types
- Verify charts/reports display new type correctly

---

### ✅ 10. PAYMENT DELETION

#### A. Delete Payment Route (`app/api/trainer/delete-payment/route.ts`)
**Line 80**: Package type from payment record
**Line 123**: Package lookup by type
**Line 142**: Package update by type

**Action Required:**
- No changes needed - uses dynamic package_type field
- Test that refunds work correctly for new type

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Update Core Schema
1. ✅ Update TypeScript types (`lib/database.types.ts`) - DONE
2. ✅ Verify database supports new type - VERIFIED
3. ⬜ Add new type definition to session/package arrays

### Phase 2: Update Booking Flows
6. Add to trainer schedule session types
7. Add to client booking session types
8. Test booking sessions of new type
9. Verify timezone/location logic works correctly

### Phase 4: Update Purchase Flows
10. Add to package sections with pricing
11. Update Stripe checkout session API
12. Update Stripe webhook handler
13. Test purchasing packages of new type

### Phase 5: Update Dashboards
14. Add to client dashboard package types
15. Add to trainer clients page dropdowns
16. Add to trainer settings dropdowns
17. Test displaying sessions/packages of new type

### Phase 6: Update Public Pages
18. Add to services page
19. Update marketing copy
20. Update any hardcoded references

### Phase 7: Testing & Verification
21. Test complete booking flow
22. Test complete purchase flow
23. Test Google Calendar integration
24. Test email notifications
25. Test analytics/reporting
26. Test payment/refund flows

---

## 📋 FILES TO MODIFY (Complete List)

### Database & Types (2 files)
1. `lib/database.types.ts` - 6 locations
2. `supabase/migrations/YYYYMMDD_add_new_training_type.sql` - NEW FILE

### Session Booking (2 files)
3. `app/trainer/schedule/page.tsx` - 4 locations
4. `app/client/booking/page.tsx` - 10+ locations

### Package Purchase (3 files)
5. `app/client/packages/page.tsx` - 12+ locations
6. `app/api/stripe/checkout-session/route.ts` - 4 locations
7. `app/api/stripe/webhook/route.ts` - 2 locations

### Dashboards (3 files)
8. `app/client/dashboard/page.tsx` - 3 locations
9. `app/trainer/clients/page.tsx` - 2 locations
10. `app/trainer/settings/page.tsx` - 4 locations

### Optional (6 files)
11. `app/trainer/dashboard/page.tsx` - 1 location (QR code)
12. `app/api/auth/signup/route.ts` - 1 location (free package)
13. `app/services/page.tsx` - 1 location (marketing)
14. `components/services-preview.tsx` - 1 location (homepage)
15. `app/login/page.tsx` - 2 locations (signup flow)
16. `components/cta-section.tsx` - 1 location (homepage)

**TOTAL: 16-22 files** depending on how comprehensive you want to be.

---

## ⚠️ COMMON PITFALLS TO AVOID

### 1. **Inconsistent Type Names**
- Use EXACT same string everywhere
- One typo = broken functionality
- Example: "In-Person Training" vs "In Person Training"

### 2. **Database Constraint Mismatch**
- TypeScript types must match database constraints
- Migration must come before code deployment
- Test on staging first

### 3. **Hardcoded Type Checks**
- Search for `=== "In-Person Training"` patterns
- Some logic may need updating (location, timezone)
- Client booking has several location-based conditionals

### 4. **Stripe Metadata**
- Must add to valid types array in webhook
- Metadata keys must match exactly
- Test in Stripe test mode first

### 5. **Google Calendar**
- Event descriptions should work automatically
- But verify event formatting looks correct
- Test both trainer and client calendar events

### 6. **Package Type Initialization**
- Multiple places initialize all types in an object
- Easy to miss one location
- Search for `"In-Person Training": {` pattern

### 7. **UI Rendering Logic**
- Some places have type-specific icons/colors
- May need custom logic for new type
- Check all switch statements and conditionals

---

## 🔍 SEARCH PATTERNS TO FIND ALL REFERENCES

Use these grep patterns to ensure you don't miss anything:

```bash
# Find all session type definitions
grep -r "In-Person Training.*Virtual Training.*Partner Training" .

# Find all package type initializations
grep -r '"In-Person Training": {' .

# Find all type checks
grep -r 'type === "In-Person Training"' .
grep -r 'package_type === "In-Person Training"' .

# Find all SelectItem/option dropdowns
grep -r 'SelectItem value="In-Person Training"' .
grep -r 'option value="In-Person Training"' .

# Find hardcoded references
grep -r "In-Person Training" . | grep -v node_modules | grep -v ".git"
```

---

## 🧪 TESTING CHECKLIST

### Before Deployment
- [ ] Database migration runs successfully
- [ ] TypeScript compiles without errors
- [ ] All dropdown menus show new type

### Booking Flow
- [ ] Trainer can book new type session
- [ ] Client can book new type session  
- [ ] Session appears in both calendars
- [ ] Session shows in dashboards
- [ ] Location field behaves correctly
- [ ] Timezone is set correctly
- [ ] Email notifications sent

### Purchase Flow
- [ ] Client can see new type packages
- [ ] Stripe checkout works
- [ ] Payment webhook processes correctly
- [ ] Package appears in client dashboard
- [ ] Sessions decrement correctly
- [ ] Refunds work correctly

### Edge Cases
- [ ] Recurring sessions of new type
- [ ] Package expiration
- [ ] Session rescheduling
- [ ] Google Calendar sync
- [ ] Analytics reports include new type
- [ ] Search/filtering includes new type

---

## 💡 RECOMMENDATION

**The system is now consistent! All 4 training types work properly.**

To add a NEW training type (5th type):

1. **Update database types first**
   - Modify `lib/database.types.ts` (already done for Posing Package)
   - Verify database constraint allows new type (may need migration)

2. **Create a comprehensive test for the new type**
   - Book a session
   - Purchase a package  
   - Verify all flows work end-to-end

3. **Deploy in stages**
   - Database migration first (if needed)
   - Backend code second
   - Frontend code last
   - This prevents runtime errors

4. **Monitor closely after deployment**
   - Watch error logs
   - Check Stripe webhook logs
   - Verify Google Calendar events
   - Test immediately after deploy

---

## 📝 NOTES

- ✅ System now supports 4 types consistently (In-Person, Virtual, Partner, Posing)
- ✅ Database has 308 sessions and 127 packages using these 4 types
- ✅ TypeScript schema updated to match database reality
- TypeScript provides good safety but can't prevent typos in strings
- Google Calendar integration is "type-agnostic" but should be tested
- Stripe metadata must exactly match type names
- Some UI logic is location-based (in-person vs virtual)
- Analytics automatically includes all types (good!)
- Email templates pull type from session data (good!)

**Total Estimated Effort for NEW (5th) type:** 4-6 hours for complete implementation + testing
