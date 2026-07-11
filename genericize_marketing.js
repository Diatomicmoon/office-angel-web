const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'marketing', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace "Electrician Near Me" with generic "Contractor Near Me" or "Service Company Near Me"
content = content.replace(/"Electrician Near Me"/g, '"Our Service Near Me"');
content = content.replace(/>Electrician Near Me</g, '>Our Service Near Me<');
content = content.replace(/>Panel Upgrade</g, '>Service Call<');
content = content.replace(/>EV Charger Installer</g, '>Installation<');

// Replace specific electrical text
const oldPost = `Just finished up a massive 200 Amp service upgrade for a great customer in Maple Grove! ⚡ If you're dealing with an old Federal Pacific panel or need more power for an EV charger, give us a call. We are fully licensed, insured, and ready to roll. \\n\\n#Electrician #MapleGroveMN #PanelUpgrade #HomeImprovement #TradeVolt`;
const newPost = `Just wrapped up another successful project for a great customer! 🛠️ If you need reliable, professional service for your home or business, give us a call. We are fully licensed, insured, and ready to roll. \\n\\n#HomeService #Contractor #QualityWork #HomeImprovement`;

content = content.replace(oldPost, newPost);
content = content.replace(oldPost.replace(/\\n/g, '\n'), newPost.replace(/\\n/g, '\n'));

// Replace electrical image with generic tools/truck image
const oldImg = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop";
const newImg = "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=800&auto=format&fit=crop"; // tools/tape measure image
content = content.replace(oldImg, newImg);
content = content.replace(/alt="Electrical Panel"/, 'alt="Completed Job"');

fs.writeFileSync(filePath, content);
console.log("Patched marketing page successfully");
