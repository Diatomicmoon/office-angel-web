import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('searchAddress')) {
  // Add search state
  code = code.replace(
    /const \[canvassingActive, setCanvassingActive\] = useState\(false\);/,
    `const [canvassingActive, setCanvassingActive] = useState(false);\n  const [searchAddress, setSearchAddress] = useState("");`
  );

  // Add search handler
  const searchHandler = `
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchAddress) return;
    
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(searchAddress)}\`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        // Force the map to move by tricking the browser center state (or handle natively in MapView later)
        localStorage.setItem("oa_map_lat", lat.toString());
        localStorage.setItem("oa_map_lng", lng.toString());
        localStorage.setItem("oa_map_zoom", "18");
        window.location.reload(); // Hacky but works for instant zoom
      } else {
        alert("Address not found.");
      }
    } catch (err) {
      console.error(err);
    }
  }
  `;
  
  code = code.replace(
    /function handleMapClick/,
    searchHandler + '\n\n  function handleMapClick'
  );

  // Add Search Bar to UI
  code = code.replace(
    /<div className="absolute top-4 left-1\/2 -translate-x-1\/2 z-\[1000\] flex gap-2">/,
    `<div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 w-full max-w-md px-4">
              <form onSubmit={handleSearch} className="w-full flex shadow-lg">
                <input 
                  type="text" 
                  placeholder="Search Address..." 
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="w-full h-10 px-4 rounded-l-full border border-r-0 text-sm focus:outline-none"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-full font-medium text-sm">Find</button>
              </form>
              <div className="flex gap-2">`
  );

  // Fix the closing div for the toggles block
  code = code.replace(
    /<button onClick=\{\(\) => setMapFilter\('knocked'\)\} className=\{`px-3 py-1\.5 rounded-full shadow-md text-xs font-medium border \$\{mapFilter === 'knocked' \? 'bg-blue-600 text-white' : 'bg-white\/90 text-gray-700'\}`\}>Knocked Only<\/button>\s*<\/div>/,
    `<button onClick={() => setMapFilter('knocked')} className={\`px-3 py-1.5 rounded-full shadow-md text-xs font-medium border \${mapFilter === 'knocked' ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700'}\`}>Knocked Only</button>
              </div>
            </div>`
  );
  
  fs.writeFileSync(path, code);
  console.log("Patched Search");
}
