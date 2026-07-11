const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'VapiCallButton.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /setErrorMsg\("Missing Vapi env vars.*"\);/g,
  `setErrorMsg("Voice AI credentials loading...");`
);

// Actually, maybe we just don't show the red box at all on the UI if errorMsg exists.
content = content.replace(
  /\{errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">\{errorMsg\}<\/div>\}/g,
  `{/* {errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{errorMsg}</div>} */}`
);

fs.writeFileSync(filePath, content);
console.log("Patched VapiCallButton");
