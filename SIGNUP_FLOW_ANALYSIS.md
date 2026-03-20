# Sign-Up Flow Analysis - Before Changes

## Current Implementation

### 1. Frontend (`app/login/page.tsx`)

#### FormData Interface (Line 34-39)
```typescript
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;  // Single field for full name
}
```

#### State Management (Line 47-51)
```typescript
const [formData, setFormData] = useState<FormData>({
  email: "",
  password: "",
  confirmPassword: "",
  full_name: "",
});
```

#### Input Handler (Line 62-70)
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  
  // Clear error message when user starts typing
  if (statusMessage.type === "error") {
    setStatusMessage({ type: null, message: "" });
  }
};
```

#### Validation (Line 72-88)
```typescript
const validateSignupForm = () => {
  if (formData.password !== formData.confirmPassword) {
    setStatusMessage({
      type: "error",
      message: "Passwords do not match",
    });
    return false;
  }
  if (formData.password.length < 6) {
    setStatusMessage({
      type: "error",
      message: "Password must be at least 6 characters long",
    });
    return false;
  }
  return true;
};
```

**Missing Validations:**
- ❌ No first name validation
- ❌ No last name validation
- ❌ No phone validation
- ❌ No email format validation in signup (only in login)

#### Sign-Up Handler (Line 211-278)
```typescript
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateSignupForm()) {
    return;
  }
  
  setIsLoading(true);
  setStatusMessage({ type: null, message: "" });
  
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,  // Sends full_name only
        role: userType,
      }),
    });
    
    // ... error handling
  }
}
```

**Currently Sends:**
- ✅ email
- ✅ password
- ✅ full_name (single field)
- ✅ role

**Needs to Send:**
- ✅ email
- ✅ password
- 🆕 first_name
- 🆕 last_name
- 🆕 phone (optional)
- ✅ role

#### Form UI (Lines 536-597)
```tsx
<form onSubmit={handleSignup}>
  <div className="grid w-full items-center gap-4">
    {/* Error display */}
    
    {/* Full Name - Single field */}
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="full_name">Full Name</Label>
      <Input
        id="full_name"
        name="full_name"
        value={formData.full_name}
        onChange={handleInputChange}
        placeholder="Enter your full name"
        required
      />
    </div>
    
    {/* Email */}
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter your email"
        required
      />
    </div>
    
    {/* Password */}
    {/* Confirm Password */}
    {/* Submit Button */}
  </div>
</form>
```

---

### 2. Backend (`app/api/auth/signup/route.ts`)

#### Request Handling (Lines 6-13)
```typescript
const { email, password, full_name, role } = await req.json();

if (!email || !password || !full_name || !role) {
  return new Response(
    JSON.stringify({ error: "Missing required fields" }),
    { status: 400 }
  );
}
```

**Currently Expects:**
- email (required)
- password (required)
- full_name (required)
- role (required)

**Needs to Handle:**
- email (required)
- password (required)
- first_name (required)
- last_name (required)
- phone (optional)
- role (required)

#### Database Insert (Lines 47-58)
```typescript
const { error: insertError } = await supabase.from("users").insert([
  {
    id: data.user.id,
    email: email,
    full_name: full_name,  // Only stores full_name
    role: role,
    created_at: new Date().toISOString(),
    contract_accepted: false,
    google_account_connected: false,
  },
]);
```

**Currently Inserts:**
- id, email, full_name, role, created_at, contract_accepted, google_account_connected

**Needs to Insert:**
- id, email
- 🆕 first_name
- 🆕 last_name
- full_name (constructed from first + last)
- 🆕 phone (optional)
- role, created_at, contract_accepted, google_account_connected

---

## Changes Required

### Phase 1: Update FormData Interface
```typescript
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;      // NEW
  last_name: string;       // NEW
  phone: string;           // NEW (optional)
}
```

### Phase 2: Update State Initialization
```typescript
const [formData, setFormData] = useState<FormData>({
  email: "",
  password: "",
  confirmPassword: "",
  first_name: "",          // NEW
  last_name: "",           // NEW
  phone: "",               // NEW
});
```

### Phase 3: Enhanced Validation
```typescript
const validateSignupForm = () => {
  // Existing password validation...
  
  // NEW: Name validation
  if (!formData.first_name.trim()) {
    setStatusMessage({
      type: "error",
      message: "First name is required",
    });
    return false;
  }
  
  if (!formData.last_name.trim()) {
    setStatusMessage({
      type: "error",
      message: "Last name is required",
    });
    return false;
  }
  
  // NEW: Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setStatusMessage({
      type: "error",
      message: "Please enter a valid email address",
    });
    return false;
  }
  
  // NEW: Optional phone validation (if provided)
  if (formData.phone.trim()) {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
      setStatusMessage({
        type: "error",
        message: "Please enter a valid phone number",
      });
      return false;
    }
  }
  
  return true;
};
```

### Phase 4: Update handleSignup API Call
```typescript
const response = await fetch("/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: formData.email,
    password: formData.password,
    first_name: formData.first_name,    // NEW
    last_name: formData.last_name,      // NEW
    phone: formData.phone || null,      // NEW (optional)
    role: userType,
  }),
});
```

### Phase 5: Update Form UI
Replace single "Full Name" field with:
```tsx
{/* First Name */}
<div className="flex flex-col space-y-1.5">
  <Label htmlFor="first_name">First Name</Label>
  <Input
    id="first_name"
    name="first_name"
    value={formData.first_name}
    onChange={handleInputChange}
    placeholder="Enter your first name"
    required
  />
</div>

{/* Last Name */}
<div className="flex flex-col space-y-1.5">
  <Label htmlFor="last_name">Last Name</Label>
  <Input
    id="last_name"
    name="last_name"
    value={formData.last_name}
    onChange={handleInputChange}
    placeholder="Enter your last name"
    required
  />
</div>

{/* Phone Number */}
<div className="flex flex-col space-y-1.5">
  <Label htmlFor="phone">Phone Number (Optional)</Label>
  <Input
    id="phone"
    name="phone"
    type="tel"
    value={formData.phone}
    onChange={handleInputChange}
    placeholder="(555) 555-5555"
  />
  <p className="text-xs text-gray-500 mt-1">
    Optional - for scheduling updates
  </p>
</div>
```

### Phase 6: Update Backend API Route

#### Update Request Validation
```typescript
const { email, password, first_name, last_name, phone, role } = await req.json();

if (!email || !password || !first_name || !last_name || !role) {
  return new Response(
    JSON.stringify({ error: "Missing required fields" }),
    { status: 400 }
  );
}
```

#### Update Database Insert
```typescript
// Construct full_name for backward compatibility
const full_name = `${first_name} ${last_name}`;

const { error: insertError } = await supabase.from("users").insert([
  {
    id: data.user.id,
    email: email,
    full_name: full_name,              // Constructed
    first_name: first_name,            // NEW
    last_name: last_name,              // NEW
    phone: phone || null,              // NEW (optional)
    role: role,
    created_at: new Date().toISOString(),
    contract_accepted: false,
    google_account_connected: false,
  },
]);
```

#### Update Auth Metadata
```typescript
await supabase.auth.admin.updateUserById(data.user.id, {
  email_confirm: true,
  user_metadata: {
    full_name: full_name,              // Constructed
    first_name: first_name,            // NEW
    last_name: last_name,              // NEW
    phone: phone,                      // NEW
    role,
  },
});
```

---

## Form Field Order (UX Consideration)

**Recommended Order:**
1. First Name ⭐
2. Last Name ⭐
3. Email ⭐
4. Phone Number (Optional) 📱
5. Password 🔒
6. Confirm Password 🔒

**Why this order?**
- Name fields first (natural flow)
- Contact info grouped together
- Security fields (passwords) at the end
- Matches user's mental model

---

## Backward Compatibility

✅ **Maintains full_name** - Existing code won't break
✅ **Constructs full_name** - `first_name + ' ' + last_name`
✅ **Optional phone** - Doesn't require existing users to update
✅ **New fields nullable** - Database schema supports null values

---

## Error Messages

### New Error Messages Needed:
- "First name is required"
- "Last name is required"
- "Please enter a valid phone number"
- "Phone number must be at least 10 digits"

### Existing Error Messages (Keep):
- "Passwords do not match"
- "Password must be at least 6 characters long"
- "Please enter a valid email address"
- "An account with this email already exists..."

---

## Testing Checklist

After implementation:
- [ ] Can create account with first/last name
- [ ] Phone number is optional (can be left blank)
- [ ] First name validation works (required)
- [ ] Last name validation works (required)
- [ ] Email validation works
- [ ] Phone validation works (if provided)
- [ ] full_name is constructed correctly
- [ ] Data saves to database correctly
- [ ] Old sign-up flow compatibility maintained
- [ ] Error messages display correctly
- [ ] Form clears after successful signup
- [ ] Login email pre-fills correctly

---

## Summary of Changes

### Frontend Changes:
1. Update FormData interface (3 new fields)
2. Update state initialization
3. Enhanced validation function (4 new checks)
4. Update handleSignup API call payload
5. Replace single name field with 2 name fields + phone field
6. Update form clearing logic

### Backend Changes:
1. Update request parameter extraction
2. Update validation checks
3. Construct full_name from first + last
4. Update database insert (add 3 new fields)
5. Update auth metadata

### Files to Modify:
- ✅ `app/login/page.tsx` (Frontend)
- ✅ `app/api/auth/signup/route.ts` (Backend)

**Estimated Time:** 2-3 hours
**Risk Level:** Low (backward compatible)
**Testing Required:** Medium (need to test all validation paths)
