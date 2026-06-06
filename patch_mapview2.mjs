import fs from 'fs';
const path = './src/app/canvassing/MapView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const colorMap: Record<string, string> = \{[\s\S]*?\};/,
  `const colorMap: Record<string, string> = {
  hot: "#f97316", // Orange
  warm: "#3b82f6", // Blue (Knocked/Warm)
  unknocked_lead: "#a855f7", // Purple for unknocked movers
  new_build: "#ef4444", // Red for New Builds
  not_interested: "#9ca3af", // Gray
  do_not_knock: "#000000", // Black
};`
);

fs.writeFileSync(path, code);
console.log("Patched MapView colors");
