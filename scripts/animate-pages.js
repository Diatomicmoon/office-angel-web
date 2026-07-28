const fs = require('fs');
const path = require('path');

// 1. Update Navbar
const navPath = path.join(__dirname, '../src/components/Navbar.tsx');
let nav = fs.readFileSync(navPath, 'utf-8');

if (!nav.includes('href="/ai-employee"')) {
  nav = nav.replace(
    '<Link href="/pricing" className={linkClass("pricing")}>Pricing</Link>',
    '<Link href="/ai-employee" className={linkClass("ai-employee")}>AI Employee</Link>\n          <Link href="/pricing" className={linkClass("pricing")}>Pricing</Link>'
  );
  nav = nav.replace(
    '<Link\n            href="/pricing"',
    '<Link\n            href="/ai-employee"\n            onClick={() => setOpen(false)}\n            className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"\n          >\n            AI Employee\n          </Link>\n          <Link\n            href="/pricing"'
  );
  nav = nav.replace(
    'activePage?: "features" | "pricing"',
    'activePage?: "features" | "ai-employee" | "pricing"'
  );
  fs.writeFileSync(navPath, nav);
  console.log('Navbar updated');
}

// 2. Update page.tsx (Landing Page Animations)
const pagePath = path.join(__dirname, '../src/app/page.tsx');
let page = fs.readFileSync(pagePath, 'utf-8');

if (!page.includes('framer-motion')) {
  page = page.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { motion } from "framer-motion";');
  
  page = page.replace(
    'export default function LandingPage() {', 
    'export default function LandingPage() {\n  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };\n  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };\n'
  );

  // Wrap Hero Section
  page = page.replace(
    '<div className="relative z-10">',
    '<motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10">'
  );
  page = page.replace(
    '          <div className="inline-flex items-center',
    '          <motion.div variants={fadeUp} className="inline-flex items-center'
  );
  page = page.replace(
    'for Contractors\n          </div>',
    'for Contractors\n          </motion.div>'
  );
  
  page = page.replace(
    '<h1 className="text-4xl',
    '<motion.h1 variants={fadeUp} className="text-4xl'
  );
  page = page.replace(
    'autopilot.</span>\n          </h1>',
    'autopilot.</span>\n          </motion.h1>'
  );
  
  page = page.replace(
    '<p className="text-lg',
    '<motion.p variants={fadeUp} className="text-lg'
  );
  page = page.replace(
    'around the clock.\n          </p>',
    'around the clock.\n          </motion.p>'
  );
  
  page = page.replace(
    '<div className="flex flex-col sm:flex-row justify-center gap-4">',
    '<motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">'
  );
  page = page.replace(
    'See All Features\n            </Link>\n          </div>\n          </div>',
    'See All Features\n            </Link>\n          </motion.div>\n          </motion.div>'
  );

  // Animate Feature titles
  page = page.replace(
    '<div className="text-center mb-12 md:mb-16">',
    '<motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12 md:mb-16">'
  );
  page = page.replace(
    'the trades.</p>\n            </div>',
    'the trades.</p>\n            </motion.div>'
  );

  // Wrap How It Plugs In titles
  page = page.replace(
    '<div className="max-w-4xl mx-auto px-4 md:px-8 text-center">\n            <h2 className="text-2xl',
    '<motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-4xl mx-auto px-4 md:px-8 text-center">\n            <motion.h2 variants={fadeUp} className="text-2xl'
  );
  page = page.replace(
    'retraining anyone.</p>',
    'retraining anyone.</motion.p>'
  );
  page = page.replace(
    '<p className="text-gray-500 text-base md:text-lg mb-10 md:mb-12">',
    '<motion.p variants={fadeUp} className="text-gray-500 text-base md:text-lg mb-10 md:mb-12">'
  );
  page = page.replace(
    '</p>\n              </div>\n            </div>\n          </div>',
    '</p>\n              </div>\n            </div>\n          </motion.div>'
  );
  
  // Wrap bottom CTA
  page = page.replace(
    '<div className="max-w-4xl mx-auto text-center relative z-10">\n            <h2',
    '<motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-4xl mx-auto text-center relative z-10">\n            <motion.h2 variants={fadeUp}'
  );
  page = page.replace(
    'ready to scale your crew?</h2>',
    'ready to scale your crew?</motion.h2>'
  );
  page = page.replace(
    '<p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12">',
    '<motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12">'
  );
  page = page.replace(
    'exactly how it works.\n            </p>',
    'exactly how it works.\n            </motion.p>'
  );
  page = page.replace(
    'Get in Touch\n            </Link>\n          </div>',
    'Get in Touch\n            </Link>\n          </motion.div>'
  );

  fs.writeFileSync(pagePath, page);
  console.log('page.tsx animated');
}
