import { supabase } from "./supabase";

// Service pour gérer les favoris des utilisateurs
export const favorisService = {
  // Récupérer tous les favoris d'un utilisateur
  async getFavoris(userId) {
    try {
      console.log("📋 Récupération favoris pour:", userId);

      const { data, error } = await supabase
        .from("favoris")
        .select("*")
        .eq("id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Erreur récupération favoris:", error);
        return { data: [], error: error.message };
      }

      console.log("✅ Favoris récupérés:", data);
      return { data: data || [], error: null };
    } catch (err) {
      console.error("💥 Erreur getFavoris:", err);
      return { data: [], error: err.message };
    }
  },

  // Ajouter une ville aux favoris
  async ajouterFavori(userId, ville) {
    try {
      console.log("➕ Ajout favori:", { userId, ville });

      // Vérifier d'abord le nombre de favoris existants
      const { data: existingFavoris, error: countError } = await supabase
        .from("favoris")
        .select("ville")
        .eq("id", userId);

      if (countError) {
        console.error("❌ Erreur vérification favoris:", countError);
        return { data: null, error: countError.message };
      }

      // Vérifier la limite de 3 favoris
      if (existingFavoris && existingFavoris.length >= 3) {
        return { data: null, error: "Limite de 3 favoris atteinte" };
      }

      // Vérifier si la ville n'est pas déjà en favori
      const villeExiste = existingFavoris?.some(
        (f) => f.ville.toLowerCase() === ville.toLowerCase()
      );

      if (villeExiste) {
        return { data: null, error: "Cette ville est déjà dans vos favoris" };
      }

      // Ajouter le favori
      const { data, error } = await supabase
        .from("favoris")
        .insert([
          {
            id: userId,
            ville: ville,
          },
        ])
        .select();

      if (error) {
        console.error("❌ Erreur ajout favori:", error);
        return { data: null, error: error.message };
      }

      console.log("✅ Favori ajouté:", data);
      return { data: data[0], error: null };
    } catch (err) {
      console.error("💥 Erreur ajouterFavori:", err);
      return { data: null, error: err.message };
    }
  },

  // Supprimer une ville des favoris
  async supprimerFavori(userId, ville) {
    try {
      console.log("🗑️ Suppression favori:", { userId, ville });

      const { data, error } = await supabase
        .from("favoris")
        .delete()
        .eq("id", userId)
        .eq("ville", ville)
        .select();

      if (error) {
        console.error("❌ Erreur suppression favori:", error);
        return { data: null, error: error.message };
      }

      console.log("✅ Favori supprimé:", data);
      return { data: data[0], error: null };
    } catch (err) {
      console.error("💥 Erreur supprimerFavori:", err);
      return { data: null, error: err.message };
    }
  },

  // Vérifier si une ville est en favori
  async estEnFavori(userId, ville) {
    try {
      const { data, error } = await supabase
        .from("favoris")
        .select("ville")
        .eq("id", userId)
        .eq("ville", ville)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("❌ Erreur vérification favori:", error);
        return { estFavori: false, error: error.message };
      }

      return { estFavori: !!data, error: null };
    } catch (err) {
      console.error("💥 Erreur estEnFavori:", err);
      return { estFavori: false, error: err.message };
    }
  },
};
