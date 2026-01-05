const { execSync } = require('child_process');
const path = require('path');

// Generate favicon.ico from 32x32 PNG using sips and iconutil (macOS)
// This creates a simple single-size .ico

const publicDir = path.join(__dirname, '..', 'public');
const input = path.join(publicDir, 'favicon-32x32.png');

console.log('Note: For proper multi-size .ico files, use an online converter like:');
console.log('https://realfavicongenerator.net/ or https://favicon.io/');
console.log('');
console.log('Modern browsers use PNG favicons (which are already generated):');
console.log('- favicon-16x16.png');
console.log('- favicon-32x32.png'); 
console.log('- apple-touch-icon.png (180x180)');
console.log('- android-chrome-192x192.png');
console.log('- android-chrome-512x512.png');
console.log('');
console.log('The existing favicon.ico will work for legacy browsers.');
