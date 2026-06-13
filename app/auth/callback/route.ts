import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createClient();
    // Échanger le code contre une session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Rediriger vers la page de mise à jour du mot de passe
  // Ajouter un timestamp pour éviter le cache
  return NextResponse.redirect(new URL('/auth/update-password?t=' + Date.now(), request.url));
}