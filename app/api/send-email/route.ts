import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json();
    
    const { data, error } = await resend.emails.send({
      from: `ProLife <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: [to],
      subject,
      text: message,
    });
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}