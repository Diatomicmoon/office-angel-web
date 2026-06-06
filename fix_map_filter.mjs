import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Undo the wrong replacement
code = code.replace(
  /visits=\{visits\.filter\(v => \{\s*if \(mapFilter === 'all'\) return true;\s*const isKnocked = \['hot', 'warm', 'not_interested', 'do_not_knock'\]\.includes\(v\.interest_level\);\s*if \(mapFilter === 'knocked'\) return isKnocked;\s*return !isKnocked;\s*\}\)\}/,
  `visits={visits}`
);

// Apply correctly to MapView
code = code.replace(
  /<MapView visits=\{visits\} onMapClick=\{handleMapClick\} onPinClick=\{handlePinClick\} \/>/,
  `<MapView visits={visits.filter(v => {
              if (mapFilter === 'all') return true;
              const isKnocked = ['hot', 'warm', 'not_interested', 'do_not_knock'].includes(v.interest_level);
              if (mapFilter === 'knocked') return isKnocked;
              return !isKnocked;
            })} onMapClick={handleMapClick} onPinClick={handlePinClick} />`
);

fs.writeFileSync(path, code);
console.log("Fixed Map filter");
