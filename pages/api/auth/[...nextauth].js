/**
 * API NEXTAUTH - CONFIGURATION D'AUTHENTIFICATION GOOGLE
 *
 * Cette API configure NextAuth.js pour l'authentification via Google OAuth.
 * Elle sert d'alternative ou de complément au système d'authentification Supabase.
 *
 * ⚠️ ÉTAT ACTUEL: Configuration de base présente mais non utilisée activement
 * Le projet utilise principalement AuthContext.js avec Supabase Auth.
 *
 * Fonctionnalités configurées:
 * - Authentification Google OAuth 2.0
 * - Redirection personnalisée vers /auth/signin
 * - Gestion des sessions et tokens JWT
 * - Callbacks pour la personnalisation des données utilisateur
 *
 * Variables d'environnement requises:
 * - GOOGLE_CLIENT_ID: ID client de l'application Google OAuth
 * - GOOGLE_CLIENT_SECRET: Secret client de l'application Google OAuth
 *
 * Pages personnalisées:
 * - signIn: Redirige vers /auth/signin au lieu de la page par défaut
 *
 * Intégration:
 * - Route API automatique: /api/auth/* (NextAuth.js catch-all)
 * - Compatible avec le système de session React
 * - Peut être utilisé en parallèle avec Supabase Auth si nécessaire
 *
 * Utilisation potentielle:
 * - Connexion rapide via Google
 * - Alternative pour les utilisateurs préférant OAuth
 * - Intégration future avec le système de favoris
 */

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// === CONFIGURATION DES OPTIONS NEXTAUTH ===
export const authOptions = {
  // === FOURNISSEURS D'AUTHENTIFICATION ===
  providers: [
    // Configuration Google OAuth Provider (seulement si les clés sont configurées)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID, // ID client depuis Google Cloud Console
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Secret client depuis Google Cloud Console
            // Scopes par défaut: openid, email, profile
            // Permet l'accès aux informations de base de l'utilisateur Google
          }),
        ]
      : []),
  ],

  // === PAGES PERSONNALISÉES ===
  pages: {
    signIn: "/auth/signin", // Redirection vers notre page de connexion personnalisée
    // Autres pages possibles: signOut, error, verifyRequest, newUser
  },

  // === CONFIGURATION DE SESSION ===
  session: {
    strategy: "jwt", // Utilise JWT au lieu de database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // === SECRET POUR JWT (REQUIS EN PRODUCTION) ===
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-not-secure",

  // === LOGS DE DÉBOGAGE ===
  debug: process.env.NODE_ENV === "development",

  // === CALLBACKS DE PERSONNALISATION ===
  callbacks: {
    /**
     * Callback de session - Personnalise les données de session
     * Appelé chaque fois qu'une session est vérifiée
     * @param {Object} session - Objet session par défaut
     * @param {Object} token - Token JWT contenant les données utilisateur
     * @returns {Object} Session personnalisée retournée au client
     */
    async session({ session, token }) {
      // Pour l'instant, on retourne la session sans modification
      // Possibilité d'ajouter des données personnalisées:
      // session.user.id = token.sub; // ID utilisateur depuis le token
      // session.user.role = token.role; // Rôle utilisateur personnalisé
      return session;
    },

    /**
     * Callback JWT - Personnalise le contenu du token JWT
     * Appelé lors de la création/mise à jour du token
     * @param {Object} token - Token JWT en cours
     * @param {Object} user - Données utilisateur (seulement lors de la première connexion)
     * @returns {Object} Token personnalisé
     */
    async jwt({ token, user }) {
      // Lors de la première connexion, 'user' contient les données du provider
      if (user) {
        // Possibilité d'ajouter des données personnalisées au token:
        // token.role = user.role; // Rôle depuis la base de données
        // token.userId = user.id; // ID personnalisé
      }

      // Le token est automatiquement chiffré et signé par NextAuth.js
      return token;
    },
  },

  // === CONFIGURATION ADDITIONNELLE ===
  // session: {
  //   strategy: "jwt", // Utilise JWT au lieu de database sessions
  //   maxAge: 30 * 24 * 60 * 60, // 30 jours
  // },

  // debug: process.env.NODE_ENV === "development", // Logs détaillés en développement
};

// === EXPORT DE L'API NEXTAUTH ===
// NextAuth() crée automatiquement toutes les routes d'authentification:
// - GET/POST /api/auth/signin
// - GET/POST /api/auth/signout
// - GET/POST /api/auth/callback
// - GET /api/auth/session
// - GET /api/auth/csrf

/**
 * Handler par défaut avec gestion d'erreur
 * Évite les erreurs 404 si NextAuth n'est pas correctement configuré
 */
const handler = (req, res) => {
  try {
    return NextAuth(authOptions)(req, res);
  } catch (error) {
    console.error("❌ Erreur NextAuth:", error);

    // En cas d'erreur de configuration, retourner une réponse d'erreur appropriée
    if (req.url?.includes("/api/auth/")) {
      return res.status(500).json({
        error: "Configuration NextAuth incomplète",
        details:
          "Vérifiez les variables d'environnement NEXTAUTH_SECRET et GOOGLE_CLIENT_ID",
        timestamp: new Date().toISOString(),
      });
    }

    // Pour les autres erreurs, les propager
    throw error;
  }
};

export default handler;
