import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace handleSearch state logic
const newSearchState = `const [searchAddress, setSearchAddress] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(val: string) {
    setSearchAddress(val);
    if (val.length < 4) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Add MN to ensure local results
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(val + ', MN')}&addressdetails=1&limit=5\`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error(err);
    }
    setIsSearching(false);
  }

  function selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSearchAddress(result.display_name.split(',')[0]);
    setSearchResults([]);
    
    // Smoothly pan map (handled by updating local storage or just relying on click)
    localStorage.setItem("oa_map_lat", lat.toString());
    localStorage.setItem("oa_map_lng", lng.toString());
    localStorage.setItem("oa_map_zoom", "18");
    
    // Automatically open the log visit modal for this selected address
    handleMapClick(lat, lng);
  }`;

code = code.replace(
  /const \[searchAddress, setSearchAddress\] = useState\(""\);\s*async function handleSearch\(e: React\.FormEvent\) \{[\s\S]*?\}\s*\} catch \(err\) \{\s*console\.error\(err\);\s*\}\s*\}/,
  newSearchState
);

// Replace UI section
const newSearchUI = `<div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-md px-4 flex flex-col gap-2">
              <div className="relative w-full shadow-lg rounded-xl bg-white">
                <div className="flex items-center px-3 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search address to log visit..." 
                    value={searchAddress}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full h-12 px-3 text-sm focus:outline-none bg-transparent"
                  />
                  {searchAddress.length > 0 && (
                     <button onClick={() => {setSearchAddress(''); setSearchResults([]);}}><XCircle className="w-4 h-4 text-gray-400" /></button>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto bg-white rounded-b-xl border-t border-gray-100 shadow-xl">
                    {searchResults.map((res: any, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectSearchResult(res)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 flex flex-col"
                      >
                        <span className="text-sm font-medium text-gray-900 truncate">{res.display_name.split(',')[0]}</span>
                        <span className="text-xs text-gray-500 truncate">{res.display_name.split(',').slice(1).join(',')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
              <button onClick={() => setMapFilter('all')} className={\`px-4 py-2 rounded-full shadow-lg text-xs font-semibold border \${mapFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}\`}>All Pins</button>
              <button onClick={() => setMapFilter('unknocked')} className={\`px-4 py-2 rounded-full shadow-lg text-xs font-semibold border \${mapFilter === 'unknocked' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}\`}>Unknocked</button>
              <button onClick={() => setMapFilter('knocked')} className={\`px-4 py-2 rounded-full shadow-lg text-xs font-semibold border \${mapFilter === 'knocked' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}\`}>Knocked</button>
            </div>`;

code = code.replace(
  /<div className="absolute top-4 left-1\/2 -translate-x-1\/2 z-\[1000\] flex flex-col items-center gap-2 w-full max-w-md px-4">[\s\S]*?<\/div>\s*<\/div>/,
  newSearchUI
);

// We need to import Search icon if it's not already
if (!code.includes('Search,')) {
    code = code.replace(/import \{ Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone, HardHat, Home \}/, 'import { Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone, HardHat, Home, Search }');
}

fs.writeFileSync(path, code);
console.log("Patched Search UI");
