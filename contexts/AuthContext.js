/**
 * CONTEXTE D'AUTHENTIFICATION - GESTION CENTRALISÉE DES UTILISATEURS
 *
 * Ce contexte gère toute la logique d'authentification de l'application.
 * Il fournit un point d'accès centralisé pour la connexion, l'inscription,
 * la déconnexion et la gestion de l'état utilisateur.
 *
 * Fonctionnalités:
 * - Authentification avec Supabase Auth
 * - Mode démo en cas de problème de configuration
 * - Gestion des sessions utilisateur
 * - Inscription avec création de profil automatique
 * - Connexion avec validation d'email/mot de passe
 * - Déconnexion sécurisée
 * - États de chargement pour l'UX
 * - Gestion d'erreurs avec messages localisés
 *
 * Utilisation:
 * const { user, signIn, signUp, signOut, loading } = useAuth();
 */

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { demoAuth } from "../lib/demoAuth";
import { supabaseUserService } from "../lib/supabaseUsers";

// Création du contexte d'authentification
const AuthContext = createContext({});

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * Doit être utilisé à l'intérieur d'un AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Fonction pour vérifier si Supabase est correctement configuré
 * Vérifie la présence des variables d'environnement nécessaires
 * @returns {boolean} - true si configuré, false pour activer le mode démo
 */
const isSupabaseConfigured = () => {
  const hasConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://demo.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "demo-key";

  if (!hasConfig) {
    console.log("🎭 Supabase non configuré - mode démo activé");
    return false;
  }

  return true;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  // Choisir le client à utiliser
  const authClient = isDemoMode ? demoAuth : supabase.auth;

  useEffect(() => {
    // Afficher le mode utilisé
    if (isDemoMode) {
      console.log("🎭 Mode démo activé - Supabase non configuré");
      console.log(
        "💡 Utilisez demo@example.com / demo123 pour tester la connexion"
      );
    }

    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        if (isDemoMode) {
          const {
            data: { session },
          } = await authClient.getSession();
          setUser(session?.user ?? null);
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const authListener = isDemoMode
      ? authClient.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        })
      : supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

    const subscription = isDemoMode
      ? authListener
      : authListener.data.subscription;

    return () => {
      if (isDemoMode) {
        // Pour le mode démo, pas de désabonnement nécessaire
      } else {
        subscription?.unsubscribe();
      }
    };
  }, []);

  // Inscription
  const signUp = async (email, password, userData) => {
    try {
      if (isDemoMode) {
        const { data, error } = await authClient.signUp(
          email,
          password,
          userData
        );
        if (error) throw error;
        return { data, error: null };
      } else {
        console.log("📝 Données d'inscription:", { email, userData });

        // Version simplifiée pour tester
        const signUpData = {
          email,
          password,
        };

        console.log("🚀 Envoi à Supabase (version simple):", signUpData);

        const { data, error } = await supabase.auth.signUp(signUpData);

        if (error) {
          console.error("❌ Erreur Supabase complète:", error);
          console.error("❌ Message:", error.message);
          console.error("❌ Code:", error.status);

          // Messages d'erreur plus explicites
          if (error.message?.includes("User already registered")) {
            throw new Error("Cette adresse email est déjà utilisée");
          } else if (error.message?.includes("Signup is disabled")) {
            throw new Error("L'inscription est désactivée sur ce projet");
          } else if (error.message?.includes("Email rate limit exceeded")) {
            throw new Error(
              "Limite d'emails atteinte, veuillez réessayer plus tard"
            );
          } else {
            throw new Error(`Erreur d'inscription: ${error.message}`);
          }
        }

        console.log("✅ Succès Supabase:", data);

        // Si l'inscription réussit, créer l'entrée dans la table user
        if (data.user) {
          try {
            console.log("💾 Création entrée dans table user...");

            // Utiliser le service pour créer l'utilisateur
            const { data: userRecord, error: userError } =
              await supabaseUserService.createUser(data.user.id, {
                email: data.user.email,
                nom: userData.nom,
                prenom: userData.prenom,
                telephone: userData.telephone,
                localite: userData.localite,
              });

            if (userError) {
              console.error(
                "❌ Erreur création profil utilisateur:",
                userError
              );
            } else {
              console.log("✅ Profil utilisateur créé:", userRecord);
            }

            // Mettre à jour aussi les métadonnées de auth.users
            await supabase.auth.updateUser({
              data: {
                nom: userData.nom || "",
                prenom: userData.prenom || "",
                telephone: userData.telephone || "",
                localite: userData.localite || "",
              },
            });
          } catch (updateError) {
            console.warn("⚠️ Erreur création utilisateur:", updateError);
          }
        }

        return { data, error: null };
      }
    } catch (error) {
      console.error("💥 Erreur dans signUp:", error);

      // Si Supabase échoue et qu'on n'est pas déjà en mode démo, basculer vers le démo
      if (!isDemoMode && error.message?.includes("422")) {
        console.warn(
          "🔄 Basculement vers le mode démo suite à l'erreur Supabase"
        );
        setIsDemoMode(true);

        // Retry en mode démo
        try {
          const { data, error: demoError } = await demoAuth.signUp(
            email,
            password,
            userData
          );
          if (demoError) throw demoError;
          return { data, error: null };
        } catch (demoError) {
          return { data: null, error: demoError.message };
        }
      }

      return { data: null, error: error.message };
    }
  };

  // Connexion
  const signIn = async (email, password) => {
    try {
      if (isDemoMode) {
        const { data, error } = await authClient.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return { data, error: null };
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      if (isDemoMode) {
        const { error } = await authClient.signOut();
        if (error) throw error;
        return { error: null };
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
      }
    } catch (error) {
      return { error: error.message };
    }
  };

  // Mise à jour du profil
  const updateProfile = async (updates) => {
    try {
      if (isDemoMode) {
        const result = await authClient.updateUser(updates);
        return result;
      } else {
        // Mettre à jour les métadonnées auth.users
        const { data, error } = await supabase.auth.updateUser({
          data: updates,
        });

        if (error) throw error;

        // Mettre à jour aussi la table user personnalisée
        if (data.user) {
          const { error: userError } = await supabaseUserService.updateUser(
            data.user.id,
            updates
          );

          if (userError) {
            console.warn("⚠️ Erreur mise à jour table user:", userError);
          } else {
            console.log("✅ Profil mis à jour dans table user");
          }
        }

        return { data, error: null };
      }
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  // Changement de mot de passe
  const updatePassword = async (newPassword) => {
    try {
      if (isDemoMode) {
        const result = await authClient.updatePassword(newPassword);
        return result;
      } else {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  // Suppression du compte
  const deleteAccount = async () => {
    try {
      if (isDemoMode) {
        const result = await authClient.deleteAccount();
        return result;
      } else {
        // Note: Supabase ne permet pas la suppression directe du compte côté client
        // Il faut utiliser l'API Admin ou une fonction Edge
        const { error } = await supabase.rpc("delete_user_account");
        if (error) throw error;
        return { error: null };
      }
    } catch (error) {
      return { error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
