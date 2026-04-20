const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../anime_op_quiz_starter.jsx');

// Read as binary buffer
const buffer = fs.readFileSync(filePath);
const utf8String = buffer.toString('utf8');

console.log('File read as UTF-8');
console.log('Sample (first 500 chars):');
console.log(utf8String.substring(0, 500));

// Check for Thai Unicode ranges
const thaiMatches = utf8String.match(/[\u0e00-\u0e7f]/g);
console.log(`Thai characters found: ${thaiMatches ? thaiMatches.length : 0}`);

// Convert Thai to Unicode escapes
const converted = utf8String.replace(/[\u0e00-\u0e7f]/g, (char) => {
  const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
  return `\\u${code}`;
});

fs.writeFileSync(filePath, converted, 'utf8');
console.log('Conversion complete');

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
if (verify.match(/\\u0e/)) {
  console.log('✓ Unicode escapes found');
  const escapeCount = (verify.match(/\\u0e/g) || []).length;
  console.log(`  Total: ${escapeCount} Thai escapes`);
} else {
  console.log('✗ No escapes found');
}
