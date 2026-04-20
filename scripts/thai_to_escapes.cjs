const fs = require('fs');
const path = require('path');

const files = ['anime_op_quiz_starter.jsx', 'src/data/animeData.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, '../' + file);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Count before
  const thaiMatches = content.match(/[\u0e00-\u0e7f]/g) || [];
  const before = thaiMatches.length;
  
  // Convert Thai to \uXXXX escapes
  content = content.replace(/[\u0e00-\u0e7f]/g, (char) => {
    const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
    return `\\u${code}`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`${file}:`);
  console.log(`  Converted: ${before} Thai chars → Unicode escapes`);
  
  // Verify
  const verify = fs.readFileSync(filePath, 'utf8');
  const escapeCount = (verify.match(/\\u0e/g) || []).length;
  console.log(`  Verification: ${escapeCount} escapes found ✓`);
});

console.log('\nReady for build!');
