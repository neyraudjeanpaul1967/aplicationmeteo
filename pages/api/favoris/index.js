/**
 * API FAVORIS - GESTION DES VILLES FAVORITES
 *
 * Cette API gère toutes les opérations CRUD pour les villes favorites.
 * Elle implémente la logique métier pour la limitation des favoris
 * (3 villes max pour utilisateurs gratuits).
 *
 * Endpoints supportés:
 * - GET: Récupérer la liste des favoris d'un utilisateur
 * - POST: Ajouter une nouvelle ville aux favoris
 * - DELETE: Supprimer une ville des favoris
 *
 * Paramètres:
 * - userId (string): Identifiant unique de l'utilisateur
 * - ville (string): Nom de la ville (pour POST/DELETE)
 *
 * Réponses:
 * - 200: Succès avec données
 * - 400: Erreur de validation (limite atteinte, doublon, etc.)
 * - 500: Erreur serveur
 * - 503: Table non configurée
 *
 * Sécurité:
 * - Utilise supabaseAdmin pour contourner RLS
 * - Validation des paramètres d'entrée
 * - Gestion des erreurs SQL appropriée
 */

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  // Logs de debug pour tracer les requêtes
  console.log("\n=== API FAVORIS CORRIGÉE ===");
  console.log("Method:", req.method);
  console.log("Body:", req.body);
  console.log("Query:", req.query);

  const { method } = req;

  try {
    // === VÉRIFICATION DE L'EXISTENCE DE LA TABLE ===
    // Essentiel pour éviter les erreurs si la base n'est pas configurée
    console.log("1. Test existence table favorie...");
    const { data: testData, error: testError } = await supabaseAdmin
      .from("favorie")
      .select("id")
      .limit(1);

    // Gestion spécifique de l'erreur "table inexistante"
    if (testError && testError.code === "PGRST116") {
      console.log("2. ⚠️ Table favorie n'existe pas");
      return res.status(503).json({
        error: "Setup required",
        message: "La table favorie doit être créée dans Supabase",
        needsSetup: true,
      });
    }

    // Gestion des autres erreurs de base de données
    if (testError) {
      console.error("3. Erreur inattendue:", testError);
      return res.status(500).json({ error: testError.message });
    }

    console.log("2. ✅ Table favorie existe");

    // === ROUTAGE SELON LA MÉTHODE HTTP ===
    switch (method) {
      // -------------------------------
      // GET - RÉCUPÉRER LES FAVORIS
      // -------------------------------
      case "GET": {
        // Récupération de l'ID utilisateur depuis les paramètres de requête
        const { userId } = req.query;

        console.log("3. 📖 GET favoris pour userId:", userId);

        // Préparation de la requête de base avec tri chronologique
        let query = supabaseAdmin
          .from("favorie")
          .select("*")
          .order("created_at", { ascending: false }); // Plus récent en premier

        // Si userId est fourni, filtrer par utilisateur spécifique
        if (userId) {
          query = query.eq("user_id", userId);
        }

        // Exécution de la requête
        const { data: favoris, error: getFavorisError } = await query;

        // Gestion d'erreur base de données
        if (getFavorisError) {
          console.error("4. Erreur GET:", getFavorisError);
          return res.status(500).json({ error: getFavorisError.message });
        }

        // Retour des données avec logs de debug
        console.log(
          "5. ✅ GET réussi:",
          favoris?.length || 0,
          "favoris trouvés"
        );
        return res.status(200).json({ data: favoris || [] });
      }

      // -------------------------------
      // POST - AJOUTER AUX FAVORIS
      // -------------------------------
      case "POST": {
        // Extraction des paramètres depuis le body de la requête
        const { userId: postUserId, ville } = req.body;

        // Validation des paramètres obligatoires
        if (!ville) {
          console.log("6. ❌ Paramètre ville manquant");
          return res.status(400).json({
            error: "ville requise",
            received: { postUserId, ville },
          });
        }

        console.log("7. ➕ POST nouveau favori:", { postUserId, ville });

        // === VÉRIFICATION DE LA LIMITE (3 FAVORIS MAX) ===
        // Uniquement si un userId est fourni (utilisateur connecté)
        if (postUserId) {
          console.log("8. 🔍 Vérification limite pour userId:", postUserId);

          // Comptage des favoris existants pour cet utilisateur
          const { data: existingFavoris, error: countError } =
            await supabaseAdmin
              .from("favorie")
              .select("id")
              .eq("user_id", postUserId);

          if (countError) {
            console.error("9. Erreur comptage favoris:", countError);
            return res.status(500).json({ error: countError.message });
          }

          // Vérification de la limite des 3 favoris
          if (existingFavoris && existingFavoris.length >= 3) {
            console.log("10. ⚠️ Limite de 3 favoris atteinte");
            return res.status(400).json({
              error: "Limite de 3 favoris atteinte",
              current_count: existingFavoris.length,
              max_allowed: 3,
            });
          }
        }

        // === PRÉPARATION DES DONNÉES À INSÉRER ===
        const insertData = { ville };
        if (postUserId) {
          insertData.user_id = postUserId;
        }

        console.log("11. 💾 Insertion nouveau favori:", insertData);

        // === INSERTION DU NOUVEAU FAVORI ===
        const { data: newFavori, error: addError } = await supabaseAdmin
          .from("favorie")
          .insert([insertData])
          .select()
          .single();

        // Gestion des erreurs d'insertion
        if (addError) {
          console.error("12. Erreur ajout:", addError);

          // Gestion spécifique de l'erreur de contrainte unique (doublon)
          if (addError.code === "23505") {
            return res.status(400).json({
              error: "Cette ville est déjà en favoris",
              ville: ville,
            });
          }

          return res.status(500).json({ error: addError.message });
        }

        console.log("13. ✅ POST réussi:", newFavori);
        return res.status(201).json({ data: newFavori });
      }

      // -------------------------------
      // DELETE - SUPPRIMER DES FAVORIS
      // -------------------------------
      case "DELETE": {
        // Extraction des paramètres de suppression
        const {
          userId: deleteUserId,
          ville: deleteVille,
          id: deleteId,
        } = req.body;

        // Validation : au moins un critère de suppression requis
        if (!deleteVille && !deleteId) {
          console.log("14. ❌ Critères de suppression manquants");
          return res.status(400).json({
            error: "ville ou id requis pour la suppression",
            received: { deleteUserId, deleteVille, deleteId },
          });
        }

        console.log("15. 🗑️ DELETE favori:", {
          deleteUserId,
          deleteVille,
          deleteId,
        });

        // === CONSTRUCTION DE LA REQUÊTE DE SUPPRESSION ===
        let deleteQuery = supabaseAdmin.from("favorie").delete();

        // Suppression par ID (plus précis)
        if (deleteId) {
          deleteQuery = deleteQuery.eq("id", deleteId);
        } else {
          // Suppression par nom de ville
          deleteQuery = deleteQuery.eq("ville", deleteVille);

          // Filtrage additionnel par utilisateur si fourni
          if (deleteUserId) {
            deleteQuery = deleteQuery.eq("user_id", deleteUserId);
          }
        }

        // Exécution de la suppression avec retour des données supprimées
        const { data: deletedFavori, error: deleteError } = await deleteQuery
          .select()
          .single();

        // Gestion des erreurs de suppression
        if (deleteError) {
          console.error("16. Erreur suppression:", deleteError);
          return res.status(500).json({ error: deleteError.message });
        }

        // Vérification que quelque chose a été supprimé
        if (!deletedFavori) {
          console.log("17. ⚠️ Aucun favori trouvé à supprimer");
          return res.status(404).json({ error: "Favori non trouvé" });
        }

        console.log("18. ✅ DELETE réussi:", deletedFavori);
        return res.status(200).json({ data: deletedFavori });
      }

      // -------------------------------
      // MÉTHODE NON SUPPORTÉE
      // -------------------------------
      default:
        console.log("19. ❌ Méthode non autorisée:", method);
        return res.status(405).json({
          error: "Méthode non autorisée",
          allowed_methods: ["GET", "POST", "DELETE"],
          received: method,
        });
    }
  } catch (error) {
    // === GESTION GLOBALE DES ERREURS ===
    console.error("❌ Erreur générale API favoris:", error);
    return res.status(500).json({
      error: "Erreur serveur interne",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
