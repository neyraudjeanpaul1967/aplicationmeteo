/**
 * API STATUT PREMIUM UTILISATEUR - VÉRIFICATION DE L'ABONNEMENT
 *
 * Cette API vérifie et retourne le statut premium d'un utilisateur.
 * Elle gère automatiquement l'expiration des abonnements premium.
 *
 * Fonctionnalités:
 * - Vérification du statut premium actuel
 * - Gestion automatique de l'expiration des abonnements
 * - Mise à jour en temps réel du statut si expiré
 * - Retour de la date d'expiration pour l'affichage
 *
 * Paramètres (Query):
 * - userId (string): ID de l'utilisateur dont on veut vérifier le statut
 *
 * Réponses:
 * - 200: Statut récupéré avec succès
 *   - is_premium (boolean): Statut premium actuel (après vérification expiration)
 *   - premium_expires_at (string|null): Date d'expiration ISO ou null
 * - 400: ID utilisateur manquant
 * - 405: Méthode HTTP non autorisée (seul GET accepté)
 * - 500: Erreur serveur/base de données
 *
 * Logique métier:
 * - Vérifie la date d'expiration automatiquement
 * - Met à jour le statut si l'abonnement a expiré
 * - Synchronise avec les données Stripe via webhook
 *
 * Utilisation:
 * - Appelée par PremiumStatus.js pour l'affichage
 * - Utilisée pour valider l'accès aux fonctionnalités premium
 * - Intégrée dans le flux d'authentification
 */

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  // === VALIDATION DE LA MÉTHODE HTTP ===
  // Seules les requêtes GET sont acceptées pour la vérification du statut
  if (req.method !== "GET") {
    console.log("❌ Méthode non autorisée pour premium-status:", req.method);
    return res.status(405).json({
      message: "Method not allowed",
      allowed: "GET",
      received: req.method,
    });
  }

  try {
    // === EXTRACTION ET VALIDATION DES PARAMÈTRES ===
    const { userId } = req.query;

    // Vérification de la présence de l'ID utilisateur
    if (!userId) {
      console.log("❌ ID utilisateur manquant pour vérification premium");
      return res.status(400).json({
        error: "ID utilisateur requis",
        parameter: "userId",
      });
    }

    console.log("🔍 Vérification statut premium pour utilisateur:", userId);

    // === RÉCUPÉRATION DES DONNÉES PREMIUM ===
    // Requête pour obtenir les informations premium de l'utilisateur
    const { data: userData, error } = await supabaseAdmin
      .from("user") // Table des profils utilisateurs
      .select("is_premium, premium_expires_at") // Champs liés au premium
      .eq("id", userId) // Filtrage par ID utilisateur
      .single(); // Un seul résultat attendu

    // Gestion des erreurs de base de données
    if (error) {
      console.error("❌ Erreur récupération statut premium:", error);

      // Gestion spécifique si l'utilisateur n'existe pas
      if (error.code === "PGRST116") {
        return res.status(404).json({
          error: "Utilisateur non trouvé",
          userId: userId,
        });
      }

      return res.status(500).json({
        error: "Erreur serveur lors de la vérification du statut",
        details: error.message,
      });
    }

    // === VÉRIFICATION ET GESTION DE L'EXPIRATION ===
    let isPremium = userData?.is_premium || false; // Statut premium actuel
    let expirationInfo = userData?.premium_expires_at || null;

    // Si l'utilisateur est premium ET a une date d'expiration
    if (isPremium && userData.premium_expires_at) {
      const expiresAt = new Date(userData.premium_expires_at);
      const now = new Date();

      console.log("📅 Vérification expiration:", {
        expires_at: expiresAt.toISOString(),
        current_time: now.toISOString(),
        is_expired: now > expiresAt,
      });

      // Si l'abonnement a expiré
      if (now > expiresAt) {
        console.log("⏰ Abonnement premium expiré, mise à jour du statut");

        // === MISE À JOUR AUTOMATIQUE DU STATUT ===
        // Désactivation du premium dans la base de données
        const { error: updateError } = await supabaseAdmin
          .from("user")
          .update({ is_premium: false }) // Suppression du statut premium
          .eq("id", userId);

        if (updateError) {
          console.error("❌ Erreur mise à jour statut expiré:", updateError);
          // On continue même en cas d'erreur pour retourner le statut correct
        } else {
          console.log("✅ Statut premium mis à jour après expiration");
        }

        isPremium = false; // Mise à jour locale pour la réponse
      }
    }

    // === RETOUR DU STATUT PREMIUM ===
    const response = {
      is_premium: isPremium,
      premium_expires_at: expirationInfo,
      checked_at: new Date().toISOString(), // Timestamp de vérification
      user_id: userId, // Confirmation de l'utilisateur vérifié
    };

    console.log("✅ Statut premium vérifié:", response);

    res.status(200).json(response);
  } catch (error) {
    // === GESTION GLOBALE DES ERREURS ===
    console.error("💥 Erreur générale vérification premium:", error);
    return res.status(500).json({
      error: "Erreur serveur interne",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
