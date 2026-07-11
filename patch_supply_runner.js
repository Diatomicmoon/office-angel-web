const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'supply-runner', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Default Kits
const newKits = `const DEFAULT_KITS: PresetKit[] = [
  {
    id: "kit-1",
    name: "Basic Van Restock",
    items: [
      { name: "Premium Silicone Sealant (Clear)", quantity: 12, unit: "tube", notes: "" },
      { name: "Utility Blades (100pk)", quantity: 1, unit: "box", notes: "" },
      { name: "Masking Tape (2-inch)", quantity: 6, unit: "roll", notes: "" },
      { name: "Assorted Shims", quantity: 2, unit: "bundle", notes: "" },
      { name: "Heavy Duty Trash Bags", quantity: 1, unit: "box", notes: "" },
      { name: "Safety Glasses", quantity: 3, unit: "ea", notes: "" },
      { name: "Microfiber Towels", quantity: 10, unit: "ea", notes: "" }
    ]
  },
  {
    id: "kit-2",
    name: "Standard Installation Kit",
    items: [
      { name: "Mounting Hardware Assortment", quantity: 1, unit: "box", notes: "" },
      { name: "Drop Cloths (Canvas)", quantity: 2, unit: "ea", notes: "" },
      { name: "Industrial Cleaning Solvent", quantity: 1, unit: "gal", notes: "" },
      { name: "Protective Foam Roll", quantity: 1, unit: "roll", notes: "" }
    ]
  }
];`;

content = content.replace(/const DEFAULT_KITS: PresetKit\[\] = \[[\s\S]*?\]\s*\}\s*\];/g, newKits);

// Replace supplier email
content = content.replace(/orders@ced-twincities\.com/g, 'orders@local-supply.com');

// Replace placeholder text
content = content.replace(/e\.g\. 500ft spool 12\/2 Romex/g, 'e.g. 10 cases of Premium Silicone Sealant');

fs.writeFileSync(filePath, content);
console.log("Patched supply runner successfully");
