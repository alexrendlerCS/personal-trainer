/**
 * Deep dive into the timezone bug
 * Let's see exactly what's happening with date parsing
 */

console.log('🔍 DEEP DIVE: Timezone Bug Investigation\n');
console.log('='.repeat(70));

const testDate = "2026-03-17"; // Monday

console.log('Testing date string:', testDate);
console.log('Expected: Monday, March 17, 2026\n');

// Method 1: Plain Date constructor (current buggy code)
console.log('Method 1: new Date(dateString)');
const date1 = new Date(testDate);
console.log('  Result:', date1.toString());
console.log('  UTC:', date1.toUTCString());
console.log('  Local date:', date1.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
console.log('  getDay():', date1.getDay(), `(${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date1.getDay()]})`);
console.log('  getDate():', date1.getDate());
console.log('  getHours():', date1.getHours());
console.log('');

// Method 2: Adding time component (proposed fix)
console.log('Method 2: new Date(dateString + "T00:00:00")');
const date2 = new Date(testDate + 'T00:00:00');
console.log('  Result:', date2.toString());
console.log('  UTC:', date2.toUTCString());
console.log('  Local date:', date2.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
console.log('  getDay():', date2.getDay(), `(${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date2.getDay()]})`);
console.log('  getDate():', date2.getDate());
console.log('  getHours():', date2.getHours());
console.log('');

// Let's check if the issue is DST-related
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const offset = -new Date().getTimezoneOffset() / 60;

console.log('='.repeat(70));
console.log('Current Environment:');
console.log('  Timezone:', userTimezone);
console.log('  UTC Offset:', offset, 'hours');
console.log('  Date now:', new Date());
console.log('');

// Test: What does the user see when they look at the calendar?
console.log('='.repeat(70));
console.log('What the user actually sees:');
console.log('');

// When user clicks on Monday, March 17 in the calendar
const selectedDateForSession = "2026-03-17"; // This is what goes into state

// This is what happens in the "Confirmed Sessions" display (line 3908)
const dayOfWeekBuggy = new Date(selectedDateForSession).getDay();
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

console.log('User clicks: Monday, March 17, 2026');
console.log('selectedDateForSession:', selectedDateForSession);
console.log('');
console.log('Buggy code calculates:');
console.log('  new Date(selectedDateForSession).getDay() =', dayOfWeekBuggy);
console.log('  Displays:', dayNames[dayOfWeekBuggy]);
console.log('');

// This is what happens in the "Booking Review" (line 3987)
const sessionDateBuggy = new Date(selectedDateForSession);
console.log('Booking Review shows:');
console.log('  Date object:', sessionDateBuggy.toString());
console.log('  toLocaleDateString:', sessionDateBuggy.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric', 
  month: 'long',
  day: 'numeric'
}));
console.log('');

// Proposed fix
const dayOfWeekFixed = new Date(selectedDateForSession + 'T00:00:00').getDay();
const sessionDateFixed = new Date(selectedDateForSession + 'T00:00:00');

console.log('Fixed code calculates:');
console.log('  new Date(selectedDateForSession + "T00:00:00").getDay() =', dayOfWeekFixed);
console.log('  Displays:', dayNames[dayOfWeekFixed]);
console.log('');
console.log('Booking Review shows:');
console.log('  Date object:', sessionDateFixed.toString());
console.log('  toLocaleDateString:', sessionDateFixed.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long', 
  day: 'numeric'
}));

console.log('');
console.log('='.repeat(70));
console.log('VERDICT:');
if (dayOfWeekBuggy !== dayOfWeekFixed) {
  console.log('❌ BUG DETECTED!');
  console.log(`   Buggy code shows: ${dayNames[dayOfWeekBuggy]}`);
  console.log(`   Fixed code shows: ${dayNames[dayOfWeekFixed]}`);
  console.log(`   User expected: Monday`);
} else {
  console.log('✅ No discrepancy in this timezone');
  console.log('   However, trainer reported seeing Sunday instead of Monday');
  console.log('   This suggests trainer is in a DIFFERENT timezone');
}

// Simulate other timezones
console.log('');
console.log('='.repeat(70));
console.log('Simulating Different Timezones:');
console.log('');

// We can't actually change TZ in Node easily, but we can calculate what would happen
const timezones = [
  { name: 'UTC', offset: 0 },
  { name: 'Eastern (UTC-5)', offset: -5 },
  { name: 'Central (UTC-6)', offset: -6 },
  { name: 'Mountain (UTC-7)', offset: -7 },
  { name: 'Pacific (UTC-8)', offset: -8 },
  { name: 'Tokyo (UTC+9)', offset: 9 },
];

console.log('When parsing "2026-03-17" (Monday):');
console.log('');
console.log('Timezone           | UTC interprets as        | Local hour | Shows as');
console.log('-'.repeat(75));

timezones.forEach(tz => {
  // "2026-03-17" is parsed as 2026-03-17T00:00:00Z (UTC midnight)
  // In local time, this becomes: 00:00 + offset
  const localHour = 0 - tz.offset; // UTC midnight adjusted to local
  const actualDay = localHour < 0 ? 'March 16 (Sunday)' : 'March 17 (Monday)';
  const hourDisplay = ((localHour + 24) % 24).toString().padStart(2, '0');
  
  console.log(
    `${tz.name.padEnd(18)} | 2026-03-17T00:00:00Z     | ${hourDisplay}:00     | ${actualDay}`
  );
});

console.log('');
console.log('This explains why western timezones see Sunday!');
console.log('UTC midnight = 5 PM Pacific on the PREVIOUS day');
