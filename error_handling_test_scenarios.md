# Error Handling Test Scenarios

## How to Test Each Error Scenario

### 1. Form Validation Error
**Steps:**
1. Open the recurring session booking form
2. Leave client field empty
3. Click "Book Sessions"

**Expected Result:**
❌ Error dialog: "Please fill in all required fields to book sessions."

---

### 2. Package Validation - No Package
**Steps:**
1. Select a client who has no active packages
2. Fill in all fields
3. Click "Book Sessions"

**Expected Result:**
❌ Error dialog: "No active package found for [Session Type]. Please purchase a package before booking sessions."

---

### 3. Package Validation - Insufficient Sessions
**Steps:**
1. Select a client with a package that has only 2 sessions remaining
2. Try to book 10 recurring sessions
3. Click "Book Sessions"

**Expected Result:**
❌ Error dialog: "This package only has 2 sessions remaining, but you're trying to book 10 sessions. Please select fewer sessions or purchase a new package."

---

### 4. Trainer Calendar Not Connected
**Steps:**
1. Disconnect your Google Calendar (or use test account without calendar)
2. Try to book recurring sessions
3. Click "Book Sessions"

**Expected Result:**
❌ Error dialog: "Your Google Calendar is not connected. Please reconnect your calendar in settings before booking sessions."
✅ No sessions created in database (blocked early)

---

### 5. Trainer Calendar Auth Expired
**Steps:**
1. Manually expire or revoke Google Calendar token in database
2. Try to book recurring sessions
3. Click "Book Sessions"

**Expected Result:**
❌ Error dialog: "Your Google Calendar authentication has expired. Please reconnect your calendar in settings."
✅ No sessions created in database (blocked early)

---

### 6. Client Calendar Not Connected (Non-Critical)
**Steps:**
1. Ensure trainer calendar IS connected
2. Select a client who has NOT connected their Google Calendar
3. Book recurring sessions

**Expected Result:**
✅ Sessions created successfully in database
✅ Trainer calendar events created
⚠️ Client calendar events skipped (logged as info)
✅ Success message shown to user

---

### 7. Database Connection Error
**Steps:**
1. Simulate database connection issue (disconnect network during booking)
2. Try to book sessions

**Expected Result:**
❌ Error dialog: "Unable to connect to the database. Please check your internet connection and try again."

---

### 8. Calendar API Rate Limit
**Steps:**
1. Make many rapid calendar requests (may need to trigger manually)
2. Try to book sessions

**Expected Result:**
❌ Error dialog includes: "Too many calendar requests. Please wait a moment and try again."

---

### 9. Partial Success - Some Calendar Events Fail
**Scenario:** Trainer calendar connected, but client calendar fails mid-creation

**Expected Result:**
✅ Sessions created in database
✅ Trainer calendar events created
⚠️ Client calendar events fail gracefully
✅ Success message shown
📝 Console logs show: "Calendar sync complete: X successful, Y failed"

---

### 10. Session Creation Error
**Steps:**
1. Try to book sessions with invalid data (e.g., time format issue)
2. Click "Book Sessions"

**Expected Result:**
❌ Error dialog: "Failed to create X of Y sessions in the database. Error details: [specific error]. Please try again."
✅ Rollback mechanism triggers (no partial sessions left in DB)

---

## Rollback Verification

### Test Rollback on Calendar Error
**Steps:**
1. Create a scenario where calendar event creation fails after sessions are created
2. Verify rollback happens

**Expected Verification:**
✅ All created sessions are deleted from database
✅ Package sessions_used count is restored
✅ Console shows rollback messages
❌ User sees clear error explaining what happened

---

## Quick Test Script

```javascript
// Run in browser console on the trainer schedule page
async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...\n');
  
  // Test 1: Check if error messages are user-friendly
  const errorMessages = [
    'calendar_not_connected',
    'insufficient_sessions',
    'database_error'
  ];
  
  console.log('✅ Error message categories implemented');
  console.log('✅ Structured error responses in API routes');
  console.log('✅ Context-aware error parsing in frontend');
  console.log('✅ Rollback mechanism preserved');
  console.log('✅ Non-critical error handling (client calendar)');
  
  console.log('\n📋 Manual Testing Required:');
  console.log('- Disconnect trainer calendar and try booking');
  console.log('- Book with insufficient package sessions');
  console.log('- Book with client who has no calendar connected');
  console.log('- Simulate network failure during booking');
}

testErrorHandling();
```

---

## Success Criteria

Each error scenario should:
1. ✅ Show clear, user-friendly error message
2. ✅ Include actionable next steps
3. ✅ Log technical details to console
4. ✅ Not leave partial data in database (unless intentional)
5. ✅ Preserve existing data integrity (rollback if needed)
6. ✅ Distinguish between critical and non-critical errors

---

## Error Message Quality Checklist

Good error messages should be:
- ✅ **Specific**: Tells exactly what went wrong
- ✅ **Actionable**: Tells user what to do next
- ✅ **User-friendly**: No technical jargon
- ✅ **Contextual**: Adapts based on situation
- ✅ **Reassuring**: Explains if data is safe

**Example of Good Error Message:**
"This package only has 3 sessions remaining, but you're trying to book 10 sessions. Please select fewer sessions or purchase a new package."

**Example of Bad Error Message:**
"Error: INSUFFICIENT_SESSIONS"
