import { NextResponse } from 'next/server';

// Vérifier si on est en mode build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

export async function POST(request: Request) {
  // Pendant le build, retourner une réponse simulée
  if (isBuildTime) {
    return NextResponse.json({ success: true, message: "Build mode" });
  }
  
  // En production, utiliser Resend
  const { to, subject, message } = await request.json();
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ProLife <onboarding@resend.dev>',
      to: [to],
      subject,
      text: message,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: 400 });
  }
  
  return NextResponse.json({ success: true, data });
}