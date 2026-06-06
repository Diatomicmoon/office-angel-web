import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /onChange=\{\(e\) => handleSearch\(e\.target\.value\)\}/,
  `onChange={(e: any) => handleSearch(e.target.value)}`
);

fs.writeFileSync(path, code);
console.log("Fixed search type");
