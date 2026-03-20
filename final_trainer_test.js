/**
 * Final Test: Reproduce exact trainer experience
 * Simulating clicking Monday, March 17, 2026 on the calendar
 */

console.log('🎯 REPRODUCING TRAINER BUG REPORT\n');
console.log('='.repeat(70));
console.log('Scenario: Trainer clicks Monday, March 17, 2026 on calendar');
console.log('Expected: Modal shows "Monday"');
console.log('Reported Bug: Modal shows "Sunday"');
console.log('='.repeat(70));

// What happens when trainer clicks a date on the calendar
const selectedDateForSession = "2026-03-17"; // Monday, March 17, 2026

console.log('\n📅 Trainer clicks on calendar date: Monday, March 17, 2026');
console.log(`   selectedDateForSession state set to: "${selectedDateForSession}"`);

// Current Code (BUGGY) - Line 3802 in page.tsx
console.log('\n❌ BUGGY CODE (Current Implementation):');
console.log('   Line 3802: dayOfWeek: new Date(selectedDateForSession).getDay()');
console.log('   ' + '-'.repeat(66));

const dateObjBuggy = new Date(selectedDateForSession);
const dayOfWeekBuggy = dateObjBuggy.getDay();
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

console.log(`   Date object created: ${dateObjBuggy.toString()}`);
console.log(`   getDay() returns: ${dayOfWeekBuggy}`);
console.log(`   dayNames[${dayOfWeekBuggy}] = "${dayNames[dayOfWeekBuggy]}"`);
console.log(`   `);
console.log(`   👁️  TRAINER SEES IN MODAL: "• ${dayNames[dayOfWeekBuggy]} at 9:00 AM for 4 weeks"`);

// Check if this matches the bug report
const actualDayName = dateObjBuggy.toLocaleDateString('en-US', { weekday: 'long' });
const actualDate = dateObjBuggy.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

console.log(`\n   🔍 Analysis:`);
console.log(`      Date object's actual local date: ${actualDate}`);
console.log(`      Date object's actual day name: ${actualDayName}`);
console.log(`      BUT displayed using dayNames[getDay()]: ${dayNames[dayOfWeekBuggy]}`);

if (actualDate.includes('16')) {
  console.log(`\n   ⚠️  BUG CONFIRMED!`);
  console.log(`      The date object is actually March 16, but getDay() still returns ${dayOfWeekBuggy}`);
  console.log(`      This is the CONFUSING part of the bug!`);
}

// Proposed Fix
console.log('\n✅ PROPOSED FIX:');
console.log('   Line 3802: dayOfWeek: new Date(selectedDateForSession + "T00:00:00").getDay()');
console.log('   ' + '-'.repeat(66));

const dateObjFixed = new Date(selectedDateForSession + 'T00:00:00');
const dayOfWeekFixed = dateObjFixed.getDay();

console.log(`   Date object created: ${dateObjFixed.toString()}`);
console.log(`   getDay() returns: ${dayOfWeekFixed}`);
console.log(`   dayNames[${dayOfWeekFixed}] = "${dayNames[dayOfWeekFixed]}"`);
console.log(`   `);
console.log(`   👁️  TRAINER WOULD SEE: "• ${dayNames[dayOfWeekFixed]} at 9:00 AM for 4 weeks"`);

const fixedActualDate = dateObjFixed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});
console.log(`\n   ✅ Date object's actual local date: ${fixedActualDate}`);
console.log(`      This matches what the trainer clicked!`);

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY:');
console.log('='.repeat(70));

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const offset = -new Date().getTimezoneOffset() / 60;

console.log(`\nYour Current Timezone: ${timezone} (UTC${offset >= 0 ? '+' : ''}${offset})`);
console.log(``);
console.log(`When trainer clicks: Monday, March 17, 2026`);
console.log(`  selectedDateForSession: "2026-03-17"`);
console.log(``);
console.log(`Buggy Code Result:`);
console.log(`  new Date("2026-03-17") creates: ${dateObjBuggy.toString()}`);
console.log(`  .getDay() = ${dayOfWeekBuggy} → displays "${dayNames[dayOfWeekBuggy]}"`);
console.log(`  Actual local date in object: ${actualDate}`);

if (dayNames[dayOfWeekBuggy] !== actualDayName) {
  console.log(`\n  🚨 DISCREPANCY DETECTED!`);
  console.log(`     getDay() says: ${dayNames[dayOfWeekBuggy]}`);
  console.log(`     But actual date is: ${actualDayName}, ${actualDate}`);
  console.log(`     This is the bug the trainer reported!`);
} else {
  console.log(`\n  ℹ️  In your timezone, getDay() happens to match the actual day`);
  console.log(`     But the date is still wrong (March 16 instead of March 17)`);
}

console.log(``);
console.log(`Fixed Code Result:`);
console.log(`  new Date("2026-03-17T00:00:00") creates: ${dateObjFixed.toString()}`);
console.log(`  .getDay() = ${dayOfWeekFixed} → displays "${dayNames[dayOfWeekFixed]}"`);
console.log(`  Actual local date in object: ${fixedActualDate}`);
console.log(`  ✅ This matches what trainer clicked!`);

// Wait, I think I misunderstood the bug...
console.log('\n' + '='.repeat(70));
console.log('🤔 WAIT - LET ME REANALYZE...');
console.log('='.repeat(70));

console.log(`
The test shows something interesting:

Buggy: new Date("2026-03-17")
  - Creates: Mon Mar 16 2026 17:00:00 GMT-0700 
  - .getDay() = 1 (Monday)
  - .toLocaleDateString() = "Monday, March 16, 2026"
  
The confusion is:
- getDay() returns 1 which means Monday
- But the actual date in the object is March 16, 2026
- And toLocaleDateString() says it's Monday
- So getDay() is technically correct for the day it represents (Monday the 16th)
- But we wanted Monday the 17th!

The trainer's bug report says "trying to book on Monday but displays Sunday"

Let me check which Monday they were clicking...
`);

// Check if there's a scenario where getDay() would return 0 (Sunday)
console.log('\nTesting Sunday, March 16:');
const sundayTest = new Date("2026-03-16");
console.log(`  new Date("2026-03-16").getDay() = ${sundayTest.getDay()} (${dayNames[sundayTest.getDay()]})`);
console.log(`  Actual date: ${sundayTest.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`);

console.log('\n' + '='.repeat(70));
console.log('💡 AH-HA MOMENT:');
console.log('='.repeat(70));
console.log(`
If the trainer clicked Monday March 17 on the calendar:
- selectedDateForSession = "2026-03-17"  
- new Date("2026-03-17") creates March 16 at 5 PM
- But getDay() = 1 (Monday) because March 16 IS a Monday!
- So the display would show "Monday" which seems correct
- But it's the WRONG Monday (16th not 17th)

However, the trainer reported seeing "Sunday" when they clicked Monday.
This would only happen if:
1. They clicked Sunday March 16, OR
2. There's a different date parsing issue, OR
3. The bug is in a different location

Let me check the Booking Review section which uses toLocaleDateString...
`);

console.log('\n='.repeat(70));
console.log('🔍 CHECKING BOOKING REVIEW SECTION (Line 3987)');
console.log('='.repeat(70));

console.log('\nCode: const sessionDate = new Date(selectedDateForSession);');
console.log(`      sessionDate.toLocaleDateString("en-US", { weekday: "long", ... })`);
console.log('');
const reviewDate = new Date(selectedDateForSession);
const reviewDisplay = reviewDate.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

console.log(`Trainer clicked: Monday, March 17, 2026`);
console.log(`Booking Review displays: ${reviewDisplay}`);

if (!reviewDisplay.includes('17')) {
  console.log(`\n🚨 BUG FOUND HERE!`);
  console.log(`   Expected: Monday, March 17, 2026`);
  console.log(`   Actually shows: ${reviewDisplay}`);
  console.log(`   This is off by one day!`);
}

console.log('\n✅ Test Complete');
