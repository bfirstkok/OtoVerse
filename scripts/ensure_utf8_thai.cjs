const fs = require('fs');
const path = require('path');

const files = ['anime_op_quiz_starter.jsx', 'src/data/animeData.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, '../' + file);
  
  try {
    // Read as UTF-8
    const utf8Content = fs.readFileSync(filePath, 'utf8');
    
    // Count Thai and escapes
    const thaiMatches = utf8Content.match(/[\u0e00-\u0e7f]/g) || [];
    const escapeMatches = utf8Content.match(/\\u0e[0-9a-fA-F]{2}/g) || [];
    
    console.log(`${file}:`);
    console.log(`  Thai chars: ${thaiMatches.length}`);
    console.log(`  Unicode escapes: ${escapeMatches.length}`);
    
    // If more escapes than Thai, convert escapes to Thai
    if (escapeMatches.length > thaiMatches.length) {
      console.log(`  Converting ${escapeMatches.length} escapes to Thai...`);
      
      let converted = utf8Content.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        const code = parseInt(hex, 16);
        return String.fromCharCode(code);
      });
      
      fs.writeFileSync(filePath, converted, 'utf8');
      
      const verify = fs.readFileSync(filePath, 'utf8');
      const verifyThaiMatches = verify.match(/[\u0e00-\u0e7f]/g) || [];
      console.log(`  ✓ Converted! Thai chars now: ${verifyThaiMatches.length}`);
    } else if (thaiMatches.length > 0) {
      console.log(`  ✓ Already has Thai characters`);
    } else {
      console.log(`  ⚠ No Thai or escapes found`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('\nDone!');
