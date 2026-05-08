import fs from 'fs';

let middleware = fs.readFileSync('src/middleware.ts', 'utf8');

// Temporarily bypass auth check
middleware = middleware.replace(
  `  // If the user is not signed in and the current path is not public, redirect the user to /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }`,
  `  // If the user is not signed in and the current path is not public, redirect the user to /login
  if (!user && !isPublicRoute) {
    // RED BUTTON: BYPASS AUTH TEMPORARILY
    // const url = request.nextUrl.clone()
    // url.pathname = '/login'
    // return NextResponse.redirect(url)
  }`
);

fs.writeFileSync('src/middleware.ts', middleware);
console.log("Auth bypassed.");
