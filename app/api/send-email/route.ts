import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Forcer le mode dynamique (pas de build statique)
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json();
    
    const { data, error } = await resend.emails.send({
      from: `ProLife <${FROM_EMAIL}>`,
      to: [to],
      subject,
      text: message,
    });
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}