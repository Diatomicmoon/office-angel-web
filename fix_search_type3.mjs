import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const \[searchAddress, setSearchAddress\] = useState\(""\);/,
  `const [searchAddress, setSearchAddress] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);`
);

fs.writeFileSync(path, code);
console.log("Fixed search type 3");
