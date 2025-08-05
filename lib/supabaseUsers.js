import { supabase } from "./supabase";

// Service pour gérer la table user de Supabase
export const supabaseUserService = {
  // Créer un utilisateur dans la table user
  async createUser(userId, userData) {
    try {
      console.log("💾 Insertion dans table user:", { userId, userData });

      // Utiliser l'API route pour l'insertion côté serveur
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Erreur API insertion user:", result.error);
        return { data: null, error: result.error };
      }

      console.log("✅ Utilisateur créé dans table user:", result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error("💥 Erreur createUser:", err);
      return { data: null, error: err.message };
    }
  },

  // Récupérer un utilisateur par son ID
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Erreur récupération user:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error("💥 Erreur getUserById:", err);
      return { data: null, error: err.message };
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(userId, userData) {
    try {
      console.log("🔄 Mise à jour utilisateur:", { userId, userData });

      const updateData = {
        nom: userData.nom,
        prenom: userData.prenom,
        telephone: userData.telephone,
        localite: userData.localite,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user")
        .update(updateData)
        .eq("id", userId)
        .select();

      if (error) {
        console.error("❌ Erreur mise à jour user:", error);
        return { data: null, error: error.message };
      }

      console.log("✅ Utilisateur mis à jour:", data);
      return { data: data[0], error: null };
    } catch (err) {
      console.error("💥 Erreur updateUser:", err);
      return { data: null, error: err.message };
    }
  },

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      const { error } = await supabase.from("user").delete().eq("id", userId);

      if (error) {
        console.error("❌ Erreur suppression user:", error);
        return { error: error.message };
      }

      console.log("✅ Utilisateur supprimé de la table user");
      return { error: null };
    } catch (err) {
      console.error("💥 Erreur deleteUser:", err);
      return { error: err.message };
    }
  },

  // Récupérer tous les utilisateurs (admin)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erreur récupération users:", error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error("💥 Erreur getAllUsers:", err);
      return { data: null, error: err.message };
    }
  },
};
