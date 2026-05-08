import fs from 'fs';

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');

// The layout probably has a sidebar or something that checks for the user profile. Let's see what's in it.
console.log(layout);
