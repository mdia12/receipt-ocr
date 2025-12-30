import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- ADMIN PROTECTION ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 1. Must be logged in
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Must be admin
    // We check user_metadata first for performance (synced via trigger)
    const role = user.user_metadata?.role || 'user'
    
    if (role !== 'admin') {
      // Fallback: Check profile if metadata is missing (optional, but safer)
      // For now, we rely on the metadata sync for speed in middleware
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  // ------------------------

  // Protect routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api') && // Be careful with API routes, might need protection too
    !request.nextUrl.pathname.startsWith('/static') &&
    !request.nextUrl.pathname.startsWith('/favicon.ico') &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/fonctionnalites') &&
    !request.nextUrl.pathname.startsWith('/tarifs') &&
    !request.nextUrl.pathname.startsWith('/securite') &&
    !request.nextUrl.pathname.startsWith('/faq') &&
    !request.nextUrl.pathname.startsWith('/docs') &&
    !request.nextUrl.pathname.startsWith('/legal')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
