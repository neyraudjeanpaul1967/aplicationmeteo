/**
 * API CRÉATION D'UTILISATEUR - INSCRIPTION DANS LA TABLE USER
 *
 * Cette API s'exécute côté serveur pour créer un profil utilisateur
 * dans la table custom "user" après l'authentification Supabase Auth.
 *
 * Fonctionnalités:
 * - Création d'un profil utilisateur personnalisé
 * - Utilise la service role key pour contourner RLS
 * - Synchronisation avec l'ID d'authentification Supabase
 * - Gestion des champs optionnels du profil
 *
 * Paramètres (POST body):
 * - userId (string): ID de l'utilisateur authentifié par Supabase Auth
 * - userData (object): Données du profil utilisateur
 *   - email (string): Adresse email (requis)
 *   - nom (string): Nom de famille (optionnel)
 *   - prenom (string): Prénom (optionnel)
 *   - telephone (string): Numéro de téléphone (optionnel)
 *   - localite (string): Localisation/ville (optionnel)
 *
 * Réponses:
 * - 200: Utilisateur créé avec succès
 * - 400: Paramètres manquants ou invalides
 * - 405: Méthode HTTP non autorisée
 * - 500: Erreur serveur/base de données
 *
 * Sécurité:
 * - Utilise SUPABASE_SERVICE_ROLE_KEY pour les opérations administratives
 * - Génère un password_hacher unique basé sur l'ID utilisateur
 * - Validation des paramètres d'entrée
 */

import { createClient } from "@supabase/supabase-js";

// === CONFIGURATION DU CLIENT SUPABASE ADMINISTRATEUR ===
// Utilisation de la service role key pour contourner les politiques RLS
// et permettre la création d'utilisateurs depuis l'API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, // URL publique du projet Supabase
  process.env.SUPABASE_SERVICE_ROLE_KEY // Clé administrative avec tous les privilèges
);

export default async function handler(req, res) {
  // === VALIDATION DE LA MÉTHODE HTTP ===
  // Seules les requêtes POST sont acceptées pour la création d'utilisateurs
  if (req.method !== "POST") {
    console.log("❌ Méthode non autorisée:", req.method);
    return res.status(405).json({
      error: "Method not allowed",
      allowed: "POST",
      received: req.method,
    });
  }

  try {
    // === EXTRACTION ET VALIDATION DES PARAMÈTRES ===
    const { userId, userData } = req.body;

    // Vérification de la présence des paramètres obligatoires
    if (!userId || !userData) {
      console.log("❌ Paramètres manquants:", {
        userId: !!userId,
        userData: !!userData,
      });
      return res.status(400).json({
        error: "userId and userData are required",
        received: {
          hasUserId: !!userId,
          hasUserData: !!userData,
        },
      });
    }

    // Validation de l'email (champ obligatoire dans userData)
    if (!userData.email) {
      console.log("❌ Email manquant dans userData");
      return res.status(400).json({
        error: "email is required in userData",
        received: userData,
      });
    }

    console.log("💾 API: Création utilisateur:", {
      userId,
      email: userData.email,
      hasOptionalData: {
        nom: !!userData.nom,
        prenom: !!userData.prenom,
        telephone: !!userData.telephone,
        localite: !!userData.localite,
      },
    });

    // === INSERTION DANS LA TABLE USER ===
    // Création de l'enregistrement utilisateur avec les données fournies
    const { data, error } = await supabaseAdmin
      .from("user") // Table personnalisée des profils utilisateurs
      .insert([
        {
          id: userId, // ID de l'utilisateur authentifié (référence à auth.users)
          email: userData.email, // Email principal (obligatoire)
          nom: userData.nom || "", // Nom de famille (optionnel, défaut vide)
          prenom: userData.prenom || "", // Prénom (optionnel, défaut vide)
          telephone: userData.telephone || "", // Téléphone (optionnel, défaut vide)
          localite: userData.localite || "", // Localisation (optionnel, défaut vide)
          password_hacher: `auth_${userId}`, // Hash unique pour référence interne
          // Champs premium automatiquement null (gérés par Stripe)
          // premium_expires_at: null (par défaut)
          // stripe_customer_id: null (par défaut)
        },
      ])
      .select(); // Retourner les données insérées pour confirmation

    // === GESTION DES ERREURS D'INSERTION ===
    if (error) {
      console.error("❌ Erreur insertion dans table user:", error);

      // Gestion spécifique des erreurs courantes
      if (error.code === "23505") {
        // Violation de contrainte unique
        return res.status(409).json({
          error: "Un utilisateur avec cet ID existe déjà",
          code: "USER_ALREADY_EXISTS",
          userId: userId,
        });
      }

      return res.status(500).json({
        error: error.message,
        code: error.code,
        details: "Erreur lors de la création du profil utilisateur",
      });
    }

    // === SUCCÈS DE LA CRÉATION ===
    console.log("✅ Utilisateur créé avec succès:", data[0]);
    return res.status(200).json({
      data: data[0],
      message: "Profil utilisateur créé avec succès",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // === GESTION GLOBALE DES ERREURS ===
    console.error("💥 Erreur générale création utilisateur:", err);
    return res.status(500).json({
      error: "Erreur serveur interne",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
