import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { TENANT_COOKIE } from '@/lib/tenant'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const tenantMode = process.env.HARD_HAT_TENANT_MODE || process.env.OFFICE_ANGEL_TENANT_MODE

  // Define public routes that don't require authentication
  // Root ('/') is now the public landing page, '/login' is auth, etc.
  const publicRoutes = ['/login', '/signup-secret', '/privacy-policy', '/terms', '/about', '/pricing', '/portal', '/$']
  const isPublicRoute = 
    request.nextUrl.pathname === '/' || 
    publicRoutes.some(route => route !== '/$' && request.nextUrl.pathname.startsWith(route))

  // If the user is not signed in and the current path is not public, redirect the user to /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // In auth-tenant mode, require a selected company cookie before accessing app routes.
  // (This keeps “login selects tenant” consistent across all screens.)
  if (tenantMode === 'auth' && user && !isPublicRoute) {
    const hasTenantCookie = Boolean(request.cookies.get(TENANT_COOKIE)?.value)
    const isSelecting = request.nextUrl.pathname.startsWith('/select-company')
    if (!hasTenantCookie && !isSelecting) {
      const url = request.nextUrl.clone()
      url.pathname = '/select-company'
      return NextResponse.redirect(url)
    }
  }

  // If the user is signed in and trying to access login, redirect to dashboard
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = tenantMode === 'auth' ? '/select-company' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
