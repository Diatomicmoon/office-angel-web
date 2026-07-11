const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The current sidebar has:
//             {!isRestricted && (
//               <Link href="/projects" className={itemClass('/projects')}>
//                 <Briefcase size={18} /><span>{isTrial ? 'Jobs & Invoices' : 'Customers & Jobs'}</span>
//               </Link>
//             )}

const replacement = `{!isRestricted && (
              <Link href="/projects" className={itemClass('/projects')}>
                <Users size={18} /><span>Customer Archive</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/jobs" className={itemClass('/jobs')}>
                <Briefcase size={18} /><span>{isTrial ? 'Jobs & Invoices' : 'Job Archive'}</span>
              </Link>
            )}`;

content = content.replace(
  /\{!\(isRestricted\) && \(\s*<Link href="\/projects" className=\{itemClass\('\/projects'\)\}>\s*<Briefcase size=\{18\} \/><span\>\{isTrial \? 'Jobs & Invoices' : 'Customers & Jobs'\}<\/span>\s*<\/Link>\s*\)\}/,
  replacement
);

// If the above regex doesn't hit because of my previous patch:
content = content.replace(
  /\{!isRestricted && \(\s*<Link href="\/projects" className=\{itemClass\('\/projects'\)\}>\s*<Briefcase size=\{18\} \/><span\>\{isTrial \? 'Jobs & Invoices' : 'Customers & Jobs'\}<\/span>\s*<\/Link>\s*\)\}/,
  replacement
);

fs.writeFileSync(filePath, content);
console.log("Patched successfully");
