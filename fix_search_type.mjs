import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /async function handleSearch\(val: string\) \{/,
  `async function handleSearch(val: string) {`
);

fs.writeFileSync(path, code);
console.log("Fixed search type");
