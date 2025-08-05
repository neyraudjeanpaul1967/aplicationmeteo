/**
 * COMPOSANT HEADER - EN-TÊTE DE L'APPLICATION
 *
 * Composant principal qui affiche l'en-tête de l'application météo.
 * Contient le logo, le titre et les boutons d'authentification.
 *
 * Fonctionnalités:
 * - Affichage du logo de l'application
 * - Titre "Météo de Jean-Paul"
 * - Boutons de connexion/déconnexion conditionnels
 * - Lien vers la page de profil
 * - Design responsive (mobile/tablet/desktop)
 * - Gestion des états de chargement
 */

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  // Récupération des données d'authentification depuis le contexte
  // user: informations de l'utilisateur connecté (null si déconnecté)
  // signOut: fonction pour déconnecter l'utilisateur
  // loading: état de chargement pendant les opérations d'auth
  const { user, signOut, loading } = useAuth();

  /**
   * Gestionnaire de déconnexion
   * Appelle la fonction signOut du contexte d'authentification
   */
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    // Container principal avec classes responsive
    <header className="w-full max-w-[350px] md:max-w-[980px] lg:max-w-[1200px] mx-auto">
      {/* Flex container principal avec gap et styles conditionnels selon l'écran */}
      {/* Flex container principal avec gap et styles conditionnels selon l'écran */}
      <div className="flex items-center gap-4 bg-white/20 p-5 rounded-lg mb-5 md:gap-24 lg:gap-8 md:bg-transparent md:p-0">
        {/* SECTION LOGO - Container flex pour le logo de l'application */}
        <div className="flex items-center gap-4 flex-[2] md:w-1/2 md:justify-start md:flex-1">
          {/* Logo principal - Utilise une balise img standard pour éviter les conflits d'optimisation */}
          <img
            src="/assets/img/7b302fa8-a663-4834-9720-708d43b96eda.png"
            alt="logo"
            className="w-full h-auto shadow-[11px_5px_8px_0px_#2d93aa] md:w-full lg:w-3/4 max-w-[320px] md:max-w-[350px] lg:max-w-[400px]"
          />
        </div>

        {/* SECTION TITRE - Titre principal de l'application */}
        <div className="flex-[2] bg-meteo-title text-white p-4 rounded-lg text-center md:py-24 lg:py-24 lg:text-3xl md:flex-[3]">
          <h1 className="text-lg font-normal tracking-wide md:text-xl lg:text-2xl">
            Météo de Jean-Paul
          </h1>
        </div>

        {/* SECTION AUTHENTIFICATION - Boutons de connexion/déconnexion */}
        <div className="ml-4 flex flex-col gap-2">
          {/* État de chargement - Affiché pendant les opérations d'authentification */}
          {loading ? (
            <div className="text-white text-sm">Chargement...</div>
          ) : user ? (
            /* UTILISATEUR CONNECTÉ - Affichage du nom et des boutons d'action */
            <>
              {/* Message de bienvenue - Visible uniquement sur desktop (md:block) */}
              <div className="text-white text-xs text-center hidden md:block">
                Bonjour, {user.user_metadata?.name || user.email}
              </div>

              {/* Container des boutons d'action */}
              <div className="flex flex-col gap-1">
                {/* Bouton vers la page de profil utilisateur */}
                <Link
                  href="/profile"
                  className="bg-meteo-blue hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors text-center"
                >
                  Profil
                </Link>

                {/* Bouton de déconnexion */}
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            /* UTILISATEUR NON CONNECTÉ - Boutons de connexion et inscription */
            <div className="flex flex-col gap-1">
              {/* Bouton de connexion - Redirige vers la page de signin */}
              <Link
                href="/auth/signin"
                className="bg-meteo-blue hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors text-center"
              >
                Connexion
              </Link>

              {/* Bouton d'inscription - Redirige vers la page de signup */}
              <Link
                href="/auth/signup"
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors text-center"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
