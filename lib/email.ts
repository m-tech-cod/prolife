export async function sendEmail({
  to,
  subject,
  message,
}: {
  to: string | string[];
  subject: string;
  message: string;
}) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        to: Array.isArray(to) ? to[0] : to, 
        subject, 
        message 
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return { success: false, error };
  }
}

// VOTRE EMAIL POUR RECEVOIR LES NOTIFICATIONS
const MON_EMAIL = 'malomonaraffath@gmail.com';

export async function notifyNewAdhesion(memberName: string, memberEmail: string) {
  // Envoi à votre email uniquement (pour que ça fonctionne avec Resend)
  const result = await sendEmail({
    to: MON_EMAIL,
    subject: '📝 Nouvelle demande d\'adhésion ProLife',
    message: `Bonjour,\n\nUne nouvelle demande d'adhésion a été soumise.\n\nNom: ${memberName}\nEmail: ${memberEmail}\n\nConnectez-vous pour traiter cette demande.\n\nL'équipe ProLife`,
  });
  
  return result;
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