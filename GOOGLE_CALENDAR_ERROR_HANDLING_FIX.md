# Google Calendar Error Handling Fix

## Issue Identified
When booking sessions as a trainer, if a client's Google Calendar authentication had expired (invalid_grant error), the session was being created successfully but no error message was shown to the user. The logs showed:
- Trainer calendar event: ✅ Created successfully
- Client calendar event: ❌ Failed with `invalid_grant` 
- Frontend: **No visible warning to user** (only success dialog)

## Problems Found

### Problem 1: Single Session Booking
The `/api/google/calendar/client-event` endpoint was returning **HTTP 200** even when calendar authentication failed.

### Problem 2: Recurring Session Booking  
The `createCalendarEvents()` helper function was silently catching client calendar errors and not tracking them, so the success dialog showed "added to both calendars" even when the client calendar failed.

## Root Cause
1. **API Issue**: Client calendar endpoint returned 200 with error field instead of 4xx status
2. **Frontend Issue**: Only checked HTTP status, not response body
3. **Recurring Sessions**: Didn't track or display client calendar failures

## Solution Implemented

### Phase 1: Single Session Booking Fix

#### 1. API Changes (`app/api/google/calendar/client-event/route.ts`)
**Before:**
```typescript
// Returned 200 with error field
return NextResponse.json({
  eventId: null,
  error: 'calendar_auth_failed',
  message: 'Session created but...'
});
```

**After:**
```typescript
// Returns 401 status code for auth errors
return NextResponse.json({
  error: 'calendar_auth_expired',
  message: "Client's Google Calendar authentication has expired...",
  details: errorMessage
}, { status: 401 });
```

#### 2. Frontend Changes (`app/trainer/schedule/page.tsx`)
**Enhanced error handling** in `handleCreateSession()`:

```typescript
if (clientEventResponse.ok) {
  const clientEventData = await clientEventResponse.json();
  clientEventId = clientEventData.eventId;
} else {
  const errorData = await clientEventResponse.json().catch(() => ({}));
  
  if (clientEventResponse.status === 401 && errorData.error === 'calendar_auth_expired') {
    // Show specific message about auth expiration
    calendarErrorMsg += `${selectedClient.full_name}'s Google Calendar authentication has expired...`;
  }
  calendarSuccess = false;
}
```

### Phase 2: Recurring Session Booking Fix

#### 1. Track Client Calendar Errors
Modified `createCalendarEvents()` to return error information:

```typescript
// Return type now includes clientCalendarError
Promise<{ 
  trainerEventId: string | null, 
  clientEventId: string | null, 
  clientCalendarError?: string 
}>

// Capture specific error messages
if (errorData?.error === 'calendar_auth_expired') {
  clientCalendarError = `${client.full_name}'s Google Calendar authentication has expired and needs to be reconnected`;
}
```

#### 2. Collect and Display Warnings
```typescript
const clientCalendarIssues: string[] = [];

// Collect issues as sessions are created
if (eventIds.clientCalendarError) {
  clientCalendarIssues.push(eventIds.clientCalendarError);
}

// Pass to success message
if (clientCalendarIssues.length > 0) {
  const uniqueIssues = [...new Set(clientCalendarIssues)];
  setCalendarWarningMessage(uniqueIssues[0]);
}
```

#### 3. Enhanced Success Dialog UI
Added a **visually distinct warning section** with amber styling:

```typescript
{calendarWarningMessage && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-semibold text-amber-900 mb-1">
          Client Calendar Sync Issue
        </h4>
        <p className="text-sm text-amber-800">
          {calendarWarningMessage}
        </p>
        <p className="text-xs text-amber-700 mt-2">
          Sessions were added to your calendar. The client will need to 
          reconnect their Google Calendar to see these sessions.
        </p>
      </div>
    </div>
  </div>
)}
```

## User Experience Now

### Before (All Booking Types)
- Session booked ✅
- Trainer calendar updated ✅  
- Client calendar fails silently ❌
- **No warning shown** - success dialog says "added to both calendars" ❌

### After: Single Session Booking
- Session booked ✅
- Trainer calendar updated ✅
- Client calendar fails with auth error ⚠️
- **Error dialog shown** explaining the specific issue ✅

### After: Recurring Session Booking  
- Sessions booked ✅
- Trainer calendar updated ✅
- Client calendar fails with auth error ⚠️
- **Success dialog with prominent warning section:**

```
┌─────────────────────────────────────────────┐
│ ✓ Session Booked!                           │
│ Sessions successfully booked!                │
├─────────────────────────────────────────────┤
│ ⚠ Client Calendar Sync Issue                │
│                                              │
│ Alex Client's Google Calendar               │
│ authentication has expired and needs        │
│ to be reconnected                           │
│                                              │
│ Sessions were added to your calendar.       │
│ The client will need to reconnect their     │
│ Google Calendar to see these sessions.      │
└─────────────────────────────────────────────┘
```

**Visual Features:**
- ⚠️ **Amber warning icon** (AlertTriangle from lucide-react)
- **Amber background** (bg-amber-50) with amber border
- **Bold heading** "Client Calendar Sync Issue"
- **Client name** included in error message
- **Clear action item** for resolution
- **Separated from success message** for better visibility

## Testing
To test this fix:

### Single Session Booking
1. Book a single session for a client whose Google Calendar auth has expired
2. Verify you see an **error dialog** (not success) explaining the issue
3. Verify the session is still created in the database
4. Verify the trainer's calendar event is created
5. Verify the client calendar event is NOT created

### Recurring Session Booking
1. Book recurring sessions for a client whose Google Calendar auth has expired
2. Verify you see a **success dialog WITH amber warning section**
3. Warning should include:
   - ⚠️ Triangle icon
   - "Client Calendar Sync Issue" heading
   - Client's name in the message
   - Explanation about reconnecting
4. Verify all sessions are created in the database
5. Verify trainer calendar events are created for all sessions
6. Verify client calendar events are NOT created

## Related Error Types Handled
- ✅ `invalid_grant` - Refresh token expired/revoked
- ✅ `invalid_token` - Access token invalid
- ✅ `unauthorized` - Generic auth failure
- ✅ Client calendar not connected (400)
- ✅ Database errors (500)
- ✅ Trainer calendar failures

## Implementation Details

### State Variables Added
```typescript
const [calendarWarningMessage, setCalendarWarningMessage] = useState("");
```

### Icons Added
```typescript
import { AlertTriangle } from "lucide-react";
```

### Functions Modified
1. `createCalendarEvents()` - Now returns `clientCalendarError` field
2. Recurring session booking flow - Tracks client calendar issues in array
3. Success message setter - Separates warning from success message
4. Dialog close handler - Clears warning message

## Follow-up Improvements (Optional)
1. Add a "Reconnect Google Calendar" button in the error dialog
2. Show client's Google Calendar connection status in the client list
3. Proactively check calendar auth before booking
4. Send email to client when their calendar auth expires
5. Add banner in trainer dashboard showing which clients need to reconnect
