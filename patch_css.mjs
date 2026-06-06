import fs from 'fs';
const path = './src/app/globals.css';
let css = fs.readFileSync(path, 'utf8');

if (!css.includes('overflow-x: hidden')) {
  css += `\n\n/* Mobile App WebView Fixes */\nhtml, body {\n  overflow-x: hidden;\n  overscroll-behavior-y: none;\n}\n`;
  fs.writeFileSync(path, css);
  console.log("CSS Patched.");
}
