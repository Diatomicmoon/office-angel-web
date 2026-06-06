import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const newSearchLogic = `async function handleSearch(val: string) {
    setSearchAddress(val);
    if (val.length < 4) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(val + ', MN')}&addressdetails=1&limit=5\`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error(err);
    }
  }`;

code = code.replace(
  /async function handleSearch\(e: React\.FormEvent\) \{[\s\S]*?console\.error\(err\);\s*\}\s*\}/,
  newSearchLogic
);

// also fix text color
code = code.replace(
  /className="w-full h-12 px-3 text-sm focus:outline-none bg-transparent"/g,
  `className="w-full h-12 px-3 text-sm focus:outline-none bg-transparent text-gray-900 placeholder:text-gray-400"`
);

fs.writeFileSync(path, code);
console.log("Fixed Search Handler");
