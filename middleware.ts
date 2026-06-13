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

  // Vérifier si le compte est actif (pour toutes les routes protégées)
  if (user) {
    const { data: userMeta } = await supabase
      .from('users_metadata')
      .select('role, is_active')
      .eq('id', user.id)
      .single();
    
    // Si le compte n'est pas actif, déconnecter et rediriger
    if (userMeta && !userMeta.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/auth/login?error=account_inactive', request.url));
    }
    
    const role = userMeta?.role;
    
    // Routes protégées (dashboard)
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      // Les membres n'ont pas accès au dashboard
      if (role === 'membre') {
        return NextResponse.redirect(new URL('/mon-profil', request.url));
      }
    }
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