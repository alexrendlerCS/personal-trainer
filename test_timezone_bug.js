/**
 * Test script to reproduce the timezone bug where Monday displays as Sunday
 * 
 * This script simulates what happens when a user in a western timezone
 * (Pacific, Mountain, Central, Eastern) selects a date for booking.
 */

console.log('🧪 TESTING TIMEZONE BUG - Monday Showing as Sunday\n');
console.log('='.repeat(70));

// Get user's current timezone
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const now = new Date();
const offset = -now.getTimezoneOffset() / 60; // Convert to hours, positive = ahead of UTC

console.log('\n📍 Your Current Environment:');
console.log(`   Timezone: ${userTimezone}`);
console.log(`   UTC Offset: ${offset >= 0 ? '+' : ''}${offset} hours`);
console.log(`   Current Time: ${now.toString()}`);

// Test with a Monday date (March 17, 2026)
const testDateString = "2026-03-17"; // This is a Monday
console.log(`\n📅 Test Date: ${testDateString} (Monday, March 17, 2026)`);
console.log('='.repeat(70));

// Simulate the BUGGY behavior (current code)
console.log('\n❌ BUGGY CODE (Current Implementation):');
console.log('   Code: new Date(selectedDateForSession).getDay()');
console.log('-'.repeat(70));

const buggyDate = new Date(testDateString);
const buggyDayOfWeek = buggyDate.getDay();
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

console.log(`   Parsed Date Object: ${buggyDate.toString()}`);
console.log(`   ISO String: ${buggyDate.toISOString()}`);
console.log(`   getDay() returns: ${buggyDayOfWeek}`);
console.log(`   Day Name: ${dayNames[buggyDayOfWeek]}`);

if (buggyDayOfWeek !== 1) {
  console.log(`   ⚠️  BUG DETECTED! Expected Monday (1), got ${dayNames[buggyDayOfWeek]} (${buggyDayOfWeek})`);
} else {
  console.log(`   ✅ No bug detected in your timezone`);
}

// Simulate the FIXED behavior (corrected code)
console.log('\n✅ FIXED CODE (Proposed Solution):');
console.log('   Code: new Date(selectedDateForSession + \'T00:00:00\').getDay()');
console.log('-'.repeat(70));

const fixedDate = new Date(testDateString + 'T00:00:00');
const fixedDayOfWeek = fixedDate.getDay();

console.log(`   Parsed Date Object: ${fixedDate.toString()}`);
console.log(`   ISO String: ${fixedDate.toISOString()}`);
console.log(`   getDay() returns: ${fixedDayOfWeek}`);
console.log(`   Day Name: ${dayNames[fixedDayOfWeek]}`);

if (fixedDayOfWeek === 1) {
  console.log(`   ✅ CORRECT! Shows Monday (1) as expected`);
} else {
  console.log(`   ❌ Still wrong! Got ${dayNames[fixedDayOfWeek]} (${fixedDayOfWeek})`);
}

// Show the difference
console.log('\n📊 Comparison:');
console.log('='.repeat(70));
console.log(`   Buggy Code Result:  ${dayNames[buggyDayOfWeek]} (day ${buggyDayOfWeek})`);
console.log(`   Fixed Code Result:  ${dayNames[fixedDayOfWeek]} (day ${fixedDayOfWeek})`);
console.log(`   Difference:         ${buggyDayOfWeek !== fixedDayOfWeek ? '❌ MISMATCH FOUND' : '✅ No difference'}`);

// Test with multiple dates to show the pattern
console.log('\n🗓️  Testing Multiple Days:');
console.log('='.repeat(70));

const testDates = [
  { date: "2026-03-16", expectedDay: "Sunday", expectedNum: 0 },
  { date: "2026-03-17", expectedDay: "Monday", expectedNum: 1 },
  { date: "2026-03-18", expectedDay: "Tuesday", expectedNum: 2 },
  { date: "2026-03-19", expectedDay: "Wednesday", expectedNum: 3 },
  { date: "2026-03-20", expectedDay: "Thursday", expectedNum: 4 },
  { date: "2026-03-21", expectedDay: "Friday", expectedNum: 5 },
  { date: "2026-03-22", expectedDay: "Saturday", expectedNum: 6 },
];

console.log('\n   Date       | Expected    | Buggy Code  | Fixed Code  | Bug?');
console.log('   ' + '-'.repeat(67));

let bugCount = 0;
testDates.forEach(test => {
  const buggyResult = new Date(test.date).getDay();
  const fixedResult = new Date(test.date + 'T00:00:00').getDay();
  const hasBug = buggyResult !== test.expectedNum;
  
  if (hasBug) bugCount++;
  
  console.log(
    `   ${test.date} | ${test.expectedDay.padEnd(11)} | ` +
    `${dayNames[buggyResult].padEnd(11)} | ${dayNames[fixedResult].padEnd(11)} | ${hasBug ? '❌' : '✅'}`
  );
});

console.log('\n📈 Summary:');
console.log('='.repeat(70));
console.log(`   Total dates tested: ${testDates.length}`);
console.log(`   Dates with bug: ${bugCount}`);
console.log(`   Dates correct: ${testDates.length - bugCount}`);

if (bugCount > 0) {
  console.log(`\n   ⚠️  TIMEZONE BUG CONFIRMED!`);
  console.log(`   ${bugCount} out of ${testDates.length} dates show incorrect day-of-week`);
  console.log(`   This affects users in timezones behind UTC (${offset < 0 ? 'like yours!' : 'unlike yours'})`);
} else {
  console.log(`\n   ℹ️  No bug detected in your timezone (${userTimezone})`);
  console.log(`   However, the bug WILL affect users in timezones behind UTC`);
  console.log(`   (e.g., Pacific, Mountain, Central, Eastern time in the US)`);
}

// Explain why the bug happens
console.log('\n🔬 Technical Explanation:');
console.log('='.repeat(70));
console.log(`
When parsing a date string without a time component:

❌ new Date("2026-03-17")
   JavaScript interprets this as UTC midnight (00:00:00 UTC)
   If you're behind UTC (e.g., UTC-7), this becomes:
   2026-03-16T17:00:00 (5:00 PM on March 16, Sunday!)

✅ new Date("2026-03-17T00:00:00")
   JavaScript interprets this as local midnight
   2026-03-17T00:00:00 (midnight on March 17, Monday in your timezone)

This is why users in western timezones see dates shifted back by one day.
`);

// Show where in the code this bug exists
console.log('\n📍 Affected Code Locations in page.tsx:');
console.log('='.repeat(70));
console.log(`
1. Line 1233:  dayOfWeek: new Date(selectedDateForSession).getDay()
2. Line 3802:  dayOfWeek: new Date(selectedDateForSession).getDay()
3. Line 3857:  dayOfWeek: new Date(selectedDateForSession).getDay()
4. Line 3987:  const sessionDate = new Date(selectedDateForSession)

All need to be changed to:
   new Date(selectedDateForSession + 'T00:00:00')
`);

console.log('\n✅ Test Complete!');
console.log('='.repeat(70));

// Recommendation
if (bugCount > 0) {
  console.log('\n🚨 RECOMMENDATION: Fix is required for your timezone!');
  console.log('   Users in your timezone will experience this bug.');
} else {
  console.log('\n📝 NOTE: While no bug in your timezone, fix is still recommended');
  console.log('   to ensure consistency for all users globally.');
}

console.log('\n');
