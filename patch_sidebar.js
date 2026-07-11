const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The issue is this line:
// const showHeavyFeatures = !isTrial && !isRestricted && !isSales;
// We also want to hide Lead Pipeline (CRM) for trial users:
// {(!isRestricted && !isTrial) && (
//   <Link href="/crm" className={itemClass('/crm')}>
//     <Users size={18} /><span>Lead Pipeline</span>
//   </Link>
// )}

content = content.replace(
  /\{\(!isRestricted && !isTrial\) && \(\s*<Link href="\/crm"/,
  `{(!isRestricted) && (
              <Link href="/crm"`
);

fs.writeFileSync(filePath, content);
console.log("Patched successfully");
