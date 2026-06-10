import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  const { data: { user } } = await supabase.auth.getUser()

  // Routes protégées (dashboard)
  if (request.nextUrl.pathname.startsWith('/dashboard') && user) {
    const { data: userMeta } = await supabase
      .from('users_metadata')
      .select('role')
      .eq('id', user.id)
      .single();
    
    // Les membres n'ont pas accès au dashboard
    if (userMeta?.role === 'membre') {
      return NextResponse.redirect(new URL('/mon-profil', request.url));
    }
    // admin et secretaire peuvent accéder
  }

  // Route login : si déjà connecté, redirige vers dashboard
  if (request.nextUrl.pathname === '/auth/login' && user) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}