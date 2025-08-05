/**
 * APPLICATION NEXT.JS - CONFIGURATION GLOBALE ET PROVIDERS
 *
 * Ce fichier _app.js est le point d'entrée principal de l'application Next.js.
 * Il configure les providers globaux et les styles pour toutes les pages.
 *
 * Architecture des providers:
 * 1. SessionProvider (NextAuth) - Gestion des sessions OAuth (Google, etc.)
 * 2. AuthProvider (Custom) - Système d'authentification principal avec Supabase
 * 3. Component - La page/composant demandé par l'utilisateur
 *
 * Fonctionnalités:
 * - Authentification hybride (NextAuth + Supabase)
 * - Persistance des sessions utilisateur
 * - Styles globaux CSS (Tailwind + custom)
 * - Context API pour l'état d'authentification
 *
 * Ordre d'encapsulation:
 * SessionProvider (externe) → AuthProvider (interne) → Page Component
 * Cet ordre permet à AuthProvider d'accéder aux sessions NextAuth si nécessaire
 *
 * Intégration:
 * - Compatible avec toutes les pages de l'application
 * - Gère automatiquement l'état d'authentification global
 * - Synchronise les sessions entre NextAuth et Supabase
 */

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/globals.css";

/**
 * Composant App principal - Point d'entrée de l'application
 *
 * @param {Object} props - Props de l'application
 * @param {React.Component} props.Component - Composant de page à rendre
 * @param {Object} props.pageProps - Props spécifiques à la page
 * @param {Object} props.pageProps.session - Session NextAuth (si présente)
 * @returns {JSX.Element} Application encapsulée dans les providers
 */
export default function App({
  Component, // Composant de page dynamique (index.js, profile/index.js, etc.)
  pageProps: { session, ...pageProps }, // Destructuration pour extraire la session
}) {
  return (
    // === PROVIDER NEXTAUTH - GESTION DES SESSIONS OAUTH ===
    // Fournit le contexte de session pour l'authentification Google/OAuth
    // Accessible via useSession() dans tous les composants enfants
    <SessionProvider session={session}>
      {/* === PROVIDER D'AUTHENTIFICATION PERSONNALISÉ === */}
      {/* Gère l'authentification Supabase et l'état utilisateur global */}
      {/* Accessible via useAuth() dans tous les composants enfants */}
      <AuthProvider>
        {/* === COMPOSANT DE PAGE DYNAMIQUE === */}
        {/* Rend la page demandée avec ses props spécifiques */}
        {/* Hérite automatiquement des contextes d'authentification */}
        <Component {...pageProps} />
      </AuthProvider>
    </SessionProvider>
  );
}
