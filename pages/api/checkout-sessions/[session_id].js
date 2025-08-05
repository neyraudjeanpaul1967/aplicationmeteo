/**
 * API VÉRIFICATION SESSION STRIPE - TRAITEMENT POST-PAIEMENT
 *
 * Cette API vérifie et traite les sessions de paiement Stripe après redirection.
 * Elle est appelée sur la page de succès pour confirmer le paiement et activer le premium.
 *
 * Fonctionnalités:
 * - Récupération et vérification de la session Stripe
 * - Activation automatique du statut premium après paiement
 * - Gestion de l'abonnement mensuel (30 jours)
 * - Mise à jour du customer ID Stripe
 * - Recherche d'utilisateur par métadonnées ou email
 *
 * Paramètres (URL dynamique):
 * - session_id (string): ID de la session Stripe retournée après paiement
 *
 * Réponses:
 * - 200: Session vérifiée avec succès
 *   - session (object): Données de la session Stripe
 *   - user_updated (boolean): Statut de mise à jour utilisateur
 *   - premium_expires_at (string): Date d'expiration du premium
 * - 400: Session ID manquant
 * - 405: Méthode HTTP non autorisée (seul GET accepté)
 * - 500: Erreur Stripe ou base de données
 *
 * Workflow:
 * 1. Récupération de la session depuis Stripe
 * 2. Vérification du statut de paiement
 * 3. Identification de l'utilisateur (métadonnées ou email)
 * 4. Calcul de la date d'expiration (30 jours)
 * 5. Mise à jour du profil utilisateur
 *
 * Sécurité:
 * - Vérification côté serveur avec Stripe
 * - Utilisation de supabaseAdmin pour les mises à jour
 * - Validation du statut de paiement avant activation
 */

import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  console.log(
    "🔍 API Vérification Session - Démarrage avec session_id:",
    req.query.session_id
  );

  // === VALIDATION DE LA MÉTHODE HTTP ===
  if (req.method !== "GET") {
    console.log("❌ Méthode non autorisée:", req.method);
    return res.status(405).json({
      message: "Method not allowed",
      allowed: "GET",
      received: req.method,
    });
  }

  // === EXTRACTION ET VALIDATION DES PARAMÈTRES ===
  const { session_id } = req.query;

  if (!session_id) {
    console.log("❌ Session ID manquant dans la requête");
    return res.status(400).json({
      message: "Session ID is required",
      parameter: "session_id",
    });
  }

  try {
    // === RÉCUPÉRATION DE LA SESSION STRIPE ===
    console.log("📡 Récupération session depuis Stripe...");
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log("✅ Session Stripe récupérée:", {
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      created: new Date(session.created * 1000).toISOString(),
      metadata: session.metadata,
    });

    // === TRAITEMENT DU PAIEMENT RÉUSSI ===
    if (session.payment_status === "paid") {
      console.log("💰 Paiement confirmé, mise à jour du statut utilisateur...");

      // === IDENTIFICATION DE L'UTILISATEUR ===
      let userId = session.metadata?.user_id;
      console.log("👤 User ID depuis métadonnées:", userId);

      // Recherche par email si pas d'ID dans les métadonnées
      if (!userId && session.customer_email) {
        console.log(
          "📧 Pas d'user_id, recherche par email:",
          session.customer_email
        );

        const { data: userData } = await supabaseAdmin
          .from("user")
          .select("id")
          .eq("email", session.customer_email)
          .single();

        console.log("🔍 Résultat recherche utilisateur:", userData);

        if (userData) {
          userId = userData.id;
          console.log("✅ Utilisateur trouvé par email, ID:", userId);
        } else {
          console.log("⚠️ Aucun utilisateur trouvé avec cet email");
        }
      }

      // === MISE À JOUR DU STATUT PREMIUM ===
      if (userId) {
        console.log("🔄 Mise à jour statut premium utilisateur...");

        // === CALCUL DE LA DATE D'EXPIRATION ===
        // Abonnement mensuel : 30 jours à partir de maintenant
        const premiumExpiresAt = new Date();
        premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30); // 30 jours

        console.log("📅 Date d'expiration calculée:", {
          current_date: new Date().toISOString(),
          expires_at: premiumExpiresAt.toISOString(),
          duration_days: 30,
        });

        // === PRÉPARATION DES DONNÉES DE MISE À JOUR ===
        const updateData = {
          is_premium: true, // Activation du statut premium
          premium_expires_at: premiumExpiresAt.toISOString(), // Date d'expiration
          stripe_customer_id: session.customer, // ID client Stripe pour futurs paiements
        };

        console.log("💾 Données de mise à jour:", updateData);

        // === EXÉCUTION DE LA MISE À JOUR ===
        const { error: updateError } = await supabaseAdmin
          .from("user")
          .update(updateData)
          .eq("id", userId);

        // Gestion des erreurs de mise à jour
        if (updateError) {
          console.error("❌ Erreur mise à jour Supabase:", updateError);

          // On continue malgré l'erreur pour retourner les infos de session
          return res.status(200).json({
            session: {
              id: session.id,
              payment_status: session.payment_status,
              customer_email: session.customer_email,
              amount_total: session.amount_total,
            },
            user_updated: false,
            error: "Erreur lors de la mise à jour du profil utilisateur",
            details: updateError.message,
          });
        } else {
          console.log(
            `✅ Utilisateur ${userId} mis à jour premium jusqu'au ${premiumExpiresAt.toISOString()}`
          );
        }

        // === RETOUR DE SUCCÈS AVEC MISE À JOUR ===
        return res.status(200).json({
          status: "complete",
          session: {
            id: session.id,
            payment_status: session.payment_status,
            customer_email: session.customer_email,
            amount_total: session.amount_total,
            currency: session.currency,
          },
          user_updated: true,
          user_id: userId,
          premium_expires_at: premiumExpiresAt.toISOString(),
          stripe_customer_id: session.customer,
          message: "Statut premium activé avec succès",
        });
      } else {
        // === AUCUN UTILISATEUR TROUVÉ ===
        console.log("❌ Aucun utilisateur trouvé pour ce paiement");

        return res.status(200).json({
          status: "complete",
          session: {
            id: session.id,
            payment_status: session.payment_status,
            customer_email: session.customer_email,
            amount_total: session.amount_total,
          },
          user_updated: false,
          error: "Utilisateur non trouvé",
          message: "Paiement confirmé mais utilisateur non identifié",
        });
      }
    } else {
      // === PAIEMENT NON CONFIRMÉ ===
      console.log("⏳ Paiement non finalisé, statut:", session.payment_status);

      return res.status(200).json({
        status: "pending",
        session: {
          id: session.id,
          payment_status: session.payment_status,
          customer_email: session.customer_email,
        },
        user_updated: false,
        message: `Paiement en cours: ${session.payment_status}`,
      });
    }
  } catch (error) {
    // === GESTION GLOBALE DES ERREURS ===
    console.error("💥 Erreur générale vérification session:", error);

    return res.status(500).json({
      status: "error",
      error: "Erreur serveur lors de la vérification",
      details: error.message,
      session_id: req.query.session_id,
      timestamp: new Date().toISOString(),
    });
  }
}
