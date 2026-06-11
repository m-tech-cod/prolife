import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function sendEmail({ to, subject, message }: { to: string; subject: string; message: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: `ProLife <${FROM_EMAIL}>`,
      to: [to],
      subject,
      text: message,
    });
    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return { success: false, error };
  }
}

export async function notifyNewAdhesion(memberName: string, memberEmail: string) {
  const notificationEmails = ['prolifevie@gmail.com', 'jeannineaguemon@gmail.com'];
  
  const results = await Promise.all(
    notificationEmails.map(email => 
      sendEmail({
        to: email,
        subject: '📝 Nouvelle demande d\'adhésion ProLife',
        message: `Bonjour,\n\nUne nouvelle demande d'adhésion a été soumise.\n\nNom: ${memberName}\nEmail: ${memberEmail}\n\nConnectez-vous pour traiter cette demande.\n\nL'équipe ProLife`,
      })
    )
  );
  return results[0];
}

export async function notifyAdhesionValidated(email: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return sendEmail({
    to: email,
    subject: '✅ Votre adhésion à ProLife a été validée !',
    message: `Bonjour ${name},\n\nFélicitations ! Votre demande a été validée.\n\nConnectez-vous : ${appUrl}/auth/login\n\nNous sommes pour la vie !`,
  });
}

export async function notifyAdhesionRejected(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: '❌ Votre demande d\'adhésion à ProLife',
    message: `Bonjour ${name},\n\nMerci pour votre intérêt. Après examen, nous ne pouvons pas donner suite à votre demande.\n\nL'équipe ProLife`,
  });
}