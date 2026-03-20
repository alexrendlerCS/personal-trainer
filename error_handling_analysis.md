# Error Handling Analysis for Recurring Session Booking

## Current Code Flow

### 1. Session Creation Process (`handleCreateRecurringSessions`)
```
1. Validate form inputs
2. Get authenticated user session
3. Check package availability
4. Create database sessions (parallel promises)
5. Update package sessions_used
6. Create Google Calendar events for all sessions
7. Reset form and show success
```

## Current Error Handling

### ✅ Good Error Handling (Already Implemented)
- **Rollback mechanism**: If calendar event creation fails, deletes all created sessions and restores package
- **Form validation**: Checks for missing required fields
- **Package validation**: Verifies sufficient sessions in package
- **Session overlap**: Checks for time conflicts
- **Generic catch block**: Shows error message to user

### ❌ Issues with Current Error Handling

1. **Generic Error Messages**: All errors show the same message to users
2. **No Specific Error Categories**: Can't distinguish between:
   - Database connection failures
   - Package availability issues
   - Calendar authentication failures
   - API rate limits
   - Network timeouts
3. **Silent Calendar Failures**: Calendar errors in `createCalendarEvents` are logged but wrapped in generic message
4. **No Partial Success Handling**: If 1 of 10 calendar events fails, everything rolls back
5. **API Error Messages Not Propagated**: API routes return status codes but messages get lost

## Error Categories to Handle

### Database Errors
- **Connection failures**: "Unable to connect to database. Please check your internet connection."
- **Session creation failures**: "Failed to create sessions in database. Please try again."
- **Package update failures**: "Failed to update package information."

### Package Validation Errors
- **No active package**: "No active package found for [session type]. Please purchase a package first."
- **Insufficient sessions**: "Package only has [X] sessions remaining, but you're trying to book [Y] sessions."

### Calendar Errors
- **Trainer calendar not connected**: "Your Google Calendar is not connected. Sessions created but calendar events skipped."
- **Client calendar not connected**: "Client's Google Calendar is not connected. Sessions created but client calendar events skipped."
- **Calendar API failures**: "Failed to create calendar events. Sessions were created but may not appear in Google Calendar."
- **Token expired**: "Google Calendar authentication expired. Please reconnect your calendar."

### API Errors
- **Rate limiting**: "Too many requests. Please wait a moment and try again."
- **Network timeout**: "Request timed out. Please check your connection and try again."
- **Server errors**: "Server error occurred. Please try again later."

### Authentication Errors
- **Not authenticated**: "You are not logged in. Please log in and try again."
- **Session expired**: "Your session has expired. Please log in again."

## Recommended Improvements

### 1. Create Error Type Enum
```typescript
enum ErrorType {
  DATABASE_CONNECTION = 'database_connection',
  DATABASE_QUERY = 'database_query',
  PACKAGE_NOT_FOUND = 'package_not_found',
  INSUFFICIENT_SESSIONS = 'insufficient_sessions',
  CALENDAR_TRAINER_NOT_CONNECTED = 'calendar_trainer_not_connected',
  CALENDAR_CLIENT_NOT_CONNECTED = 'calendar_client_not_connected',
  CALENDAR_AUTH_EXPIRED = 'calendar_auth_expired',
  CALENDAR_API_FAILURE = 'calendar_api_failure',
  NETWORK_ERROR = 'network_error',
  AUTH_ERROR = 'auth_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error'
}
```

### 2. Create Custom Error Class
```typescript
class BookingError extends Error {
  type: ErrorType;
  userMessage: string;
  technicalDetails?: any;
  
  constructor(type: ErrorType, userMessage: string, technicalDetails?: any) {
    super(userMessage);
    this.type = type;
    this.userMessage = userMessage;
    this.technicalDetails = technicalDetails;
  }
}
```

### 3. Enhance Error Messages in API Routes
- Return structured error responses with error types
- Include user-friendly messages
- Preserve technical details for logging

### 4. Add Partial Success Handling
- Option to continue even if some calendar events fail
- Show clear summary: "8/10 sessions created successfully. 2 calendar events failed."
- Allow users to retry failed calendar events separately

### 5. Add Error Recovery Actions
- "Reconnect Google Calendar" button for auth failures
- "Retry" button for temporary failures
- "Contact Support" link for unknown errors

### 6. Improve User Feedback
- Show progress during multi-session creation
- Display which specific sessions failed (if applicable)
- Provide actionable next steps

## Implementation Priority

1. **HIGH**: Distinguish between calendar connection failures and booking failures
2. **HIGH**: Better error messages for package validation
3. **MEDIUM**: Partial success handling for calendar events
4. **MEDIUM**: Structured error responses from API routes
5. **LOW**: Progress indicators during booking

## Testing Scenarios

1. Book sessions with trainer calendar disconnected
2. Book sessions with client calendar disconnected
3. Book sessions with expired Google tokens
4. Book sessions with insufficient package sessions
5. Simulate network failures during booking
6. Simulate database connection failures
