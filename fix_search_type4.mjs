import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const selectSearchCode = `
  function selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSearchAddress(result.display_name.split(',')[0]);
    setSearchResults([]);
    
    localStorage.setItem("oa_map_lat", lat.toString());
    localStorage.setItem("oa_map_lng", lng.toString());
    localStorage.setItem("oa_map_zoom", "18");
    
    handleMapClick(lat, lng);
  }
`;

code = code.replace(
  /function handlePinClick/,
  selectSearchCode + '\n  function handlePinClick'
);

fs.writeFileSync(path, code);
console.log("Fixed search type 4");
