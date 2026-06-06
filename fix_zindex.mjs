import fs from 'fs';
const path = './src/app/canvassing/MapView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /style=\{\{ height: "100%", width: "100%", position: "absolute", inset: 0, zIndex: 0 \}\}/,
  `style={{ height: "100%", width: "100%", position: "absolute", inset: 0, zIndex: 10 }}`
);

fs.writeFileSync(path, code);
console.log("Fixed map z-index");
