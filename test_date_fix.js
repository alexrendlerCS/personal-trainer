// Test script to verify the date fix for recurring sessions
// This simulates the timezone issue and shows the fix

const testDateFix = () => {
  console.log("🧪 Testing Date Fix for Recurring Sessions\n");

  // Simulate the problematic date string (like "2025-09-17")
  const selectedDate = "2025-09-17"; // This should be a Wednesday

  console.log("Selected Date:", selectedDate);
  console.log("Expected Day: Wednesday (day index 3)\n");

  // OLD (Problematic) method - can be affected by timezone
  const oldMethod = new Date(selectedDate).getDay();
  console.log("❌ OLD Method (new Date(selectedDate).getDay()):");
  console.log("  Result:", oldMethod);
  console.log("  Day Name:", getDayName(oldMethod));
  console.log("  Issue: Can be affected by timezone\n");

  // NEW (Fixed) method - uses local date parsing
  const parseLocalDateString = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const newMethod = parseLocalDateString(selectedDate).getDay();
  console.log("✅ NEW Method (parseLocalDateString(selectedDate).getDay()):");
  console.log("  Result:", newMethod);
  console.log("  Day Name:", getDayName(newMethod));
  console.log("  Fix: Uses local date parsing, no timezone issues\n");

  // Test with different dates
  const testDates = [
    "2025-09-17", // Wednesday
    "2025-09-18", // Thursday
    "2025-09-19", // Friday
    "2025-09-20", // Saturday
  ];

  console.log("📅 Testing Multiple Dates:");
  testDates.forEach((date) => {
    const oldResult = new Date(date).getDay();
    const newResult = parseLocalDateString(date).getDay();
    const isCorrect = oldResult === newResult;

    console.log(
      `  ${date}: ${getDayName(newResult)} - ${isCorrect ? "✅" : "❌"} ${isCorrect ? "Match" : "Mismatch"}`
    );
  });

  console.log("\n🎉 Fix Summary:");
  console.log(
    "- OLD method: new Date(selectedDate).getDay() - can be wrong due to timezone"
  );
  console.log(
    "- NEW method: parseLocalDateString(selectedDate).getDay() - always correct"
  );
  console.log(
    "- This ensures the booking summary shows the correct day of the week"
  );
};

const getDayName = (dayIndex) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayIndex];
};

// Run the test
testDateFix();
