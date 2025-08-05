/**
 * API Route pour créer une session de paiement Stripe
 *
 * Cette API route gère la création de sessions de paiement Stripe pour l'achat premium.
 * Elle est appelée depuis la page d'accueil quand l'utilisateur clique sur "Acheter Premium".
 *
 * Fonctionnalités :
 * - Création de session Stripe Checkout
 * - Configuration du produit premium (9,99€)
 * - URLs de redirection (succès/annulation)
 * - Métadonnées utilisateur pour l'identification
 *
 * Sécurité :
 * - Validation des données utilisateur
 * - Vérification du format email
 * - Gestion d'erreurs complète
 *
 * Workflow :
 * 1. Réception des données utilisateur (ID + email)
 * 2. Validation des paramètres
 * 3. Création de la session Stripe
 * 4. Retour de l'URL de redirection
 *
 * @author Jean-Paul
 * @version 1.0.0
 * @since 2025
 */

import Stripe from "stripe";

// Initialisation du client Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Handler principal de l'API route
 *
 * @param {NextApiRequest} req - Requête HTTP
 * @param {NextApiResponse} res - Réponse HTTP
 */
export default async function handler(req, res) {
  // Seules les requêtes POST sont autorisées
  if (req.method !== "POST") {
    console.log(`❌ Méthode non autorisée: ${req.method}`);
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { userId, userEmail } = req.body;

    console.log("🚀 Création session Stripe pour:", { userId, userEmail });

    // Validation des paramètres requis
    if (!userId || !userEmail) {
      console.log("❌ Paramètres manquants:", {
        userId: !!userId,
        userEmail: !!userEmail,
      });
      return res.status(400).json({
        error: "ID utilisateur et email requis",
        details: "userId et userEmail sont obligatoires",
      });
    }

    // Validation du format email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.log("❌ Format email invalide:", userEmail);
      return res.status(400).json({
        error: "Format email invalide",
        details: "Veuillez fournir un email valide",
      });
    }

    // Configuration de l'URL de base pour les redirections
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    console.log("🔧 Configuration session Stripe...");

    // Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      // Mode de paiement unique (non récurrent)
      mode: "payment",

      // Configuration du produit premium
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Application Météo - Version Premium",
              description:
                "Accès premium pour 30 jours : favoris illimités, prévisions étendues, alertes personnalisées",
            },
            unit_amount: 999, // 9,99€ en centimes
          },
          quantity: 1,
        },
      ],

      // Métadonnées pour identifier l'utilisateur après paiement
      metadata: {
        userId: userId,
        userEmail: userEmail,
        purchaseType: "premium_monthly",
        timestamp: new Date().toISOString(),
      },

      // Email pré-rempli pour Stripe Checkout
      customer_email: userEmail,

      // URLs de redirection après paiement
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?cancelled=true`,

      // Configuration des méthodes de paiement acceptées
      payment_method_types: ["card"],

      // Durée d'expiration de la session (30 minutes)
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    console.log("✅ Session Stripe créée:", {
      sessionId: session.id,
      url: session.url,
      userId: userId,
    });

    // Retour de l'URL de redirection vers Stripe
    res.status(200).json({
      url: session.url,
      sessionId: session.id,
      message: "Session créée avec succès",
    });
  } catch (error) {
    // Gestion complète des erreurs Stripe et autres
    console.error("❌ Erreur création session Stripe:", error);

    // Gestion spécifique des erreurs Stripe
    if (error.type === "StripeCardError") {
      return res.status(400).json({
        error: "Erreur de carte de crédit",
        details: error.message,
      });
    }

    if (error.type === "StripeRateLimitError") {
      return res.status(429).json({
        error: "Trop de requêtes",
        details: "Veuillez patienter avant de réessayer",
      });
    }

    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        error: "Requête invalide",
        details: error.message,
      });
    }

    if (error.type === "StripeAPIError") {
      return res.status(502).json({
        error: "Erreur API Stripe",
        details: "Problème temporaire avec le service de paiement",
      });
    }

    if (error.type === "StripeConnectionError") {
      return res.status(503).json({
        error: "Erreur de connexion",
        details: "Impossible de contacter le service de paiement",
      });
    }

    if (error.type === "StripeAuthenticationError") {
      console.error(
        "🔐 Erreur d'authentification Stripe - Vérifier les clés API"
      );
      return res.status(500).json({
        error: "Erreur de configuration",
        details: "Problème de configuration du service de paiement",
      });
    }

    // Erreur générique pour les cas non prévus
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: "Une erreur inattendue s'est produite",
      timestamp: new Date().toISOString(),
    });
  }
}
