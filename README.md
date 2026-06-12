# ProLife Community

Plateforme web de gestion des membres pour la communauté ProLife.

## Technologies

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Backend** : Supabase (Auth, PostgreSQL, Storage)
- **Déploiement** : Vercel

## Fonctionnalités

- Authentification (connexion / inscription)
- Gestion des adhésions (validation/rejet)
- Gestion des membres (CRUD + photo)
- Archives des anciens membres
- Gestion des événements
- Exports PDF et Excel
- Tableau de bord avec statistiques
- Notifications par email

## Installation

```bash
# Cloner le projet
git clone https://github.com/m-tech-cod/prolife
cd prolife

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Lancer en développement
npm run dev

## Variables d'environnement

NEXT_PUBLIC_SUPABASE_URL=https://nnjhbqvvepwkuksrdqgx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2OjqHR545V_a3i1bbzUEow_CUVMGgk4

RESEND_API_KEY=re_XazU9opA_9iPyZnxFnBykeSCYseAaxTaj
NEXT_PUBLIC_APP_URL=http://communaute-prolife.vercel.app

##  Build

npm run build
npm start

##  Rôles

Rôle	Accès
Admin	Accès total
Secrétaire	Accès total
Membre	Profil uniquement

## Emails de notification
Notification aux admins pour nouvelle adhésion

Confirmation au membre après validation/rejet

## Palette de couleurs
Vert principal : #007A2F

Rouge : #9F2723

Jaune : #F2BE2E

## Licence
© 2024 Communauté ProLife  - Tous droits réservés