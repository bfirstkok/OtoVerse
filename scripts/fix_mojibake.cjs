const fs = require('fs');
const path = require('path');

const files = ['anime_op_quiz_starter.jsx', 'src/data/animeData.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, '../' + file);
  
  // Read the file as if it were Latin-1 (which is what mojibake looks like)
  const buffer = fs.readFileSync(filePath);
  const mojibakeText = buffer.toString('latin1');
  
  // Re-encode as UTF-8 (this fixes the mojibake)
  const properText = Buffer.from(mojibakeText, 'latin1').toString('utf8');
  
  // Write back as UTF-8
  fs.writeFileSync(filePath, properText, 'utf8');
  
  console.log(`Fixed ${file}`);
  
  // Verify
  const verify = fs.readFileSync(filePath, 'utf8');
  const thaiCount = (verify.match(/[\u0e00-\u0e7f]/g) || []).length;
  console.log(`  Thai characters: ${thaiCount}`);
});

console.log('Done!');
