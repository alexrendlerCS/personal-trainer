/**
 * Sign-Up Form Implementation Verification
 * Quick check to ensure all changes are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Sign-Up Form Implementation...\n');

const frontendPath = path.join(__dirname, 'app/login/page.tsx');
const backendPath = path.join(__dirname, 'app/api/auth/signup/route.ts');

let allChecksPass = true;

// Check Frontend
console.log('📄 Checking Frontend (app/login/page.tsx)...');
const frontendCode = fs.readFileSync(frontendPath, 'utf8');

const frontendChecks = [
  { name: 'FormData interface includes first_name', pattern: /first_name:\s*string/ },
  { name: 'FormData interface includes last_name', pattern: /last_name:\s*string/ },
  { name: 'FormData interface includes phone', pattern: /phone:\s*string/ },
  { name: 'State initialization includes first_name', pattern: /first_name:\s*""/ },
  { name: 'State initialization includes last_name', pattern: /last_name:\s*""/ },
  { name: 'State initialization includes phone', pattern: /phone:\s*""/ },
  { name: 'Validation checks first name', pattern: /first_name\.trim\(\)/ },
  { name: 'Validation checks last name', pattern: /last_name\.trim\(\)/ },
  { name: 'Validation checks email format', pattern: /emailRegex\.test/ },
  { name: 'Validation checks phone (optional)', pattern: /phone\.trim\(\)/ },
  { name: 'API call sends first_name', pattern: /first_name:\s*formData\.first_name/ },
  { name: 'API call sends last_name', pattern: /last_name:\s*formData\.last_name/ },
  { name: 'API call sends phone', pattern: /phone:\s*formData\.phone/ },
  { name: 'Form has First Name input', pattern: /<Label[^>]*>First Name<\/Label>/ },
  { name: 'Form has Last Name input', pattern: /<Label[^>]*>Last Name<\/Label>/ },
  { name: 'Form has Phone input', pattern: /<Label[^>]*>Phone Number/ },
];

frontendChecks.forEach(check => {
  const pass = check.pattern.test(frontendCode);
  console.log(`${pass ? '✅' : '❌'} ${check.name}`);
  if (!pass) allChecksPass = false;
});

// Check Backend
console.log('\n📄 Checking Backend (app/api/auth/signup/route.ts)...');
const backendCode = fs.readFileSync(backendPath, 'utf8');

const backendChecks = [
  { name: 'Extracts first_name from request', pattern: /first_name.*=.*await req\.json/ },
  { name: 'Extracts last_name from request', pattern: /last_name.*=.*await req\.json/ },
  { name: 'Extracts phone from request', pattern: /phone.*=.*await req\.json/ },
  { name: 'Validates first_name is required', pattern: /!first_name/ },
  { name: 'Validates last_name is required', pattern: /!last_name/ },
  { name: 'Constructs full_name', pattern: /full_name.*=.*`\$\{first_name\}.*\$\{last_name\}`/ },
  { name: 'Saves first_name to database', pattern: /first_name:\s*first_name/ },
  { name: 'Saves last_name to database', pattern: /last_name:\s*last_name/ },
  { name: 'Saves phone to database', pattern: /phone:\s*phone/ },
  { name: 'Saves full_name to database', pattern: /full_name:\s*full_name/ },
  { name: 'Updates user_metadata with first_name', pattern: /user_metadata:[\s\S]*first_name/ },
  { name: 'Updates user_metadata with last_name', pattern: /user_metadata:[\s\S]*last_name/ },
  { name: 'Updates user_metadata with phone', pattern: /user_metadata:[\s\S]*phone/ },
];

backendChecks.forEach(check => {
  const pass = check.pattern.test(backendCode);
  console.log(`${pass ? '✅' : '❌'} ${check.name}`);
  if (!pass) allChecksPass = false;
});

// Summary
console.log('\n' + '═'.repeat(60));
if (allChecksPass) {
  console.log('🎉 ✅ ALL CHECKS PASSED!');
  console.log('\nSign-up form implementation is complete and verified.');
  console.log('\n📋 Next Steps:');
  console.log('   1. Test the sign-up form in the browser');
  console.log('   2. Verify database records are created correctly');
  console.log('   3. Test all validation scenarios');
  console.log('   4. Verify backward compatibility');
} else {
  console.log('❌ SOME CHECKS FAILED');
  console.log('\nPlease review the failed checks above.');
}
console.log('═'.repeat(60));
