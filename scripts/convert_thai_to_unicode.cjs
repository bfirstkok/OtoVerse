const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../anime_op_quiz_starter.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Count before
const thaiPattern = /[ก-๙]/g;
const thaiMatches = content.match(thaiPattern);
const thaiCount = thaiMatches ? thaiMatches.length : 0;

// Convert Thai characters to Unicode escapes
content = content.replace(/[ก-๙]/g, (char) => {
  const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
  return `\\u${code}`;
});

fs.writeFileSync(filePath, content, 'utf8');

console.log(`Converted ${thaiCount} Thai characters to Unicode escapes`);

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
if (verify.match(/\\u0e/)) {
  console.log('Conversion successful ✓');
} else {
  console.log('Conversion failed ✗');
}
