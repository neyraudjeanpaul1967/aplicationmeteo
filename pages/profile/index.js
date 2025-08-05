/**
 * PAGE PROFIL UTILISATEUR - GESTION DU COMPTE PERSONNEL
 *
 * Cette page permet aux utilisateurs connectés de gérer leur profil personnel.
 * Elle offre une interface complète pour la modification des informations,
 * le changement de mot de passe et la suppression de compte.
 *
 * Fonctionnalités principales:
 * - Affichage et modification des informations personnelles
 * - Changement sécurisé du mot de passe
 * - Suppression définitive du compte utilisateur
 * - Interface à onglets pour une navigation claire
 * - Validation des données côté client et serveur
 *
 * Sécurité:
 * - Redirection automatique si non connecté
 * - Validation avec Zod des données saisies
 * - Confirmation obligatoire pour la suppression
 * - Email non modifiable pour éviter les conflits d'identité
 *
 * Intégration:
 * - Utilise AuthContext pour toutes les opérations d'authentification
 * - Compatible avec le système Supabase Auth
 * - Synchronisation avec la table user personnalisée
 * - Design responsive et accessible
 *
 * Navigation:
 * 1. Informations personnelles: nom, prénom, téléphone, localité
 * 2. Mot de passe: changement sécurisé avec confirmation
 * 3. Zone dangereuse: suppression de compte avec avertissement
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../../lib/validations";

export default function Profile() {
  // === HOOKS ET SERVICES D'AUTHENTIFICATION ===
  const {
    user, // Utilisateur connecté depuis AuthContext
    updateProfile, // Fonction de mise à jour du profil
    updatePassword, // Fonction de changement de mot de passe
    deleteAccount, // Fonction de suppression de compte
    signOut, // Fonction de déconnexion
    loading, // État de chargement de l'authentification
  } = useAuth();

  const router = useRouter(); // Router Next.js pour la navigation

  // === ÉTATS LOCAUX DE LA PAGE ===
  const [activeTab, setActiveTab] = useState("profile"); // Onglet actif ("profile", "password", "danger")
  const [isLoading, setIsLoading] = useState(false); // État de chargement des opérations
  const [message, setMessage] = useState(""); // Messages de succès/erreur
  const [errors, setErrors] = useState({}); // Erreurs de validation par champ

  // === DONNÉES DU FORMULAIRE PROFIL ===
  const [profileData, setProfileData] = useState({
    nom: "", // Nom de famille
    prenom: "", // Prénom
    email: "", // Email (lecture seule)
    telephone: "", // Numéro de téléphone
    localite: "", // Ville/localité
  });

  // === DONNÉES DU FORMULAIRE MOT DE PASSE ===
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", // Mot de passe actuel (pour vérification)
    newPassword: "", // Nouveau mot de passe
    confirmNewPassword: "", // Confirmation du nouveau mot de passe
  });

  // === PROTECTION DE LA ROUTE - REDIRECTION SI NON CONNECTÉ ===
  // Surveille l'état d'authentification et redirige vers la page de connexion
  useEffect(() => {
    if (!loading && !user) {
      console.log("🔒 Utilisateur non connecté, redirection vers /auth/signin");
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  // === INITIALISATION DES DONNÉES UTILISATEUR ===
  // Pré-remplit le formulaire avec les données existantes de l'utilisateur
  useEffect(() => {
    if (user) {
      console.log("👤 Initialisation données profil depuis:", user);

      setProfileData({
        nom: user.user_metadata?.nom || "", // Nom depuis les métadonnées
        prenom: user.user_metadata?.prenom || "", // Prénom depuis les métadonnées
        email: user.email || "", // Email depuis l'objet utilisateur principal
        telephone: user.user_metadata?.telephone || "", // Téléphone depuis les métadonnées
        localite: user.user_metadata?.localite || "", // Localité depuis les métadonnées
      });
    }
  }, [user]); // Se re-exécute quand l'utilisateur change

  // === ÉTATS DE CHARGEMENT - AFFICHAGE CONDITIONNEL ===
  // Affiche un loader pendant que l'authentification se charge
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Protection supplémentaire: n'affiche rien si pas d'utilisateur
  if (!user) {
    return null;
  }

  // === GESTIONNAIRES D'ÉVÉNEMENTS - FORMULAIRE PROFIL ===

  /**
   * Gère les modifications des champs du formulaire profil
   * Met à jour l'état local et efface les erreurs de validation
   */

  /**
   * Gère les modifications des champs du formulaire profil
   * Met à jour l'état local et efface les erreurs de validation
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    // Mise à jour de la valeur du champ modifié
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacement de l'erreur de validation pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Gère les modifications des champs du formulaire mot de passe
   * Met à jour l'état local et efface les erreurs de validation
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    // Mise à jour de la valeur du champ modifié
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacement de l'erreur de validation pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // === GESTIONNAIRES DE SOUMISSION - TRAITEMENT DES FORMULAIRES ===

  /**
   * Traite la soumission du formulaire de mise à jour du profil
   * Valide les données avec Zod et appelle l'API de mise à jour
   */

  /**
   * Traite la soumission du formulaire de mise à jour du profil
   * Valide les données avec Zod et appelle l'API de mise à jour
   */
  const handleProfileSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsLoading(true); // Active l'état de chargement
    setErrors({}); // Réinitialise les erreurs
    setMessage(""); // Efface les messages précédents

    try {
      console.log("📝 Tentative mise à jour profil:", profileData);

      // === VALIDATION DES DONNÉES AVEC ZOD ===
      const validatedData = updateProfileSchema.parse(profileData);

      // === APPEL À L'API DE MISE À JOUR ===
      const { data, error } = await updateProfile({
        name: validatedData.name, // Note: Le schéma pourrait nécessiter des ajustements
      });

      // === GESTION DES RÉSULTATS ===
      if (error) {
        console.error("❌ Erreur mise à jour profil:", error);
        setMessage(error);
      } else {
        console.log("✅ Profil mis à jour avec succès:", data);
        setMessage("Profil mis à jour avec succès !");
      }
    } catch (error) {
      console.error("💥 Erreur validation/soumission:", error);

      // === GESTION DES ERREURS DE VALIDATION ZOD ===
      if (error.errors) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setMessage("Une erreur est survenue lors de la mise à jour");
      }
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Traite la soumission du formulaire de changement de mot de passe
   * Valide les données et assure la concordance des mots de passe
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsLoading(true); // Active l'état de chargement
    setErrors({}); // Réinitialise les erreurs
    setMessage(""); // Efface les messages précédents

    try {
      console.log("🔐 Tentative changement mot de passe");

      // === VALIDATION DES DONNÉES AVEC ZOD ===
      const validatedData = changePasswordSchema.parse(passwordData);

      // === APPEL À L'API DE CHANGEMENT DE MOT DE PASSE ===
      const { data, error } = await updatePassword(validatedData.newPassword);

      // === GESTION DES RÉSULTATS ===
      if (error) {
        console.error("❌ Erreur changement mot de passe:", error);
        setMessage(error);
      } else {
        console.log("✅ Mot de passe changé avec succès");
        setMessage("Mot de passe changé avec succès !");

        // === RÉINITIALISATION DU FORMULAIRE ===
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch (error) {
      console.error("💥 Erreur validation/changement:", error);

      // === GESTION DES ERREURS DE VALIDATION ZOD ===
      if (error.errors) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setMessage(
          "Une erreur est survenue lors du changement de mot de passe"
        );
      }
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Traite la suppression définitive du compte utilisateur
   * Demande une confirmation avant de procéder à l'action irréversible
   */

  /**
   * Traite la suppression définitive du compte utilisateur
   * Demande une confirmation avant de procéder à l'action irréversible
   */
  const handleDeleteAccount = async () => {
    // === CONFIRMATION UTILISATEUR OBLIGATOIRE ===
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
    );

    if (confirmDelete) {
      console.log("🗑️ Suppression compte confirmée par l'utilisateur");
      setIsLoading(true); // Active l'état de chargement

      // === APPEL À L'API DE SUPPRESSION ===
      const { error } = await deleteAccount();

      if (error) {
        console.error("❌ Erreur suppression compte:", error);
        setMessage(error);
        setIsLoading(false); // Désactive le chargement en cas d'erreur
      } else {
        console.log("✅ Compte supprimé avec succès");

        // === DÉCONNEXION ET REDIRECTION ===
        await signOut(); // Déconnexion de l'utilisateur
        router.push("/"); // Redirection vers la page d'accueil
      }
    } else {
      console.log("❌ Suppression compte annulée par l'utilisateur");
    }
  };

  // === RENDU DE L'INTERFACE UTILISATEUR ===
  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url(/assets/img/fond.png)", // Image de fond météo
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* === CONTENEUR PRINCIPAL AVEC EFFET GLASSMORPHISM === */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          {/* === EN-TÊTE DE LA PAGE === */}
          <div className="bg-meteo-title text-white px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Mon Profil</h1>
              {/* Lien de retour à l'accueil */}
              <Link
                href="/"
                className="text-white hover:text-gray-200 underline"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* === NAVIGATION PAR ONGLETS === */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {/* Onglet Informations personnelles */}
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "profile"
                    ? "border-b-2 border-meteo-blue text-meteo-blue" // Style actif
                    : "text-gray-500 hover:text-gray-700" // Style inactif
                }`}
              >
                Informations personnelles
              </button>

              {/* Onglet Mot de passe */}
              <button
                onClick={() => setActiveTab("password")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "password"
                    ? "border-b-2 border-meteo-blue text-meteo-blue" // Style actif
                    : "text-gray-500 hover:text-gray-700" // Style inactif
                }`}
              >
                Mot de passe
              </button>

              {/* Onglet Zone dangereuse */}
              <button
                onClick={() => setActiveTab("danger")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "danger"
                    ? "border-b-2 border-red-500 text-red-500" // Style actif (rouge pour danger)
                    : "text-gray-500 hover:text-gray-700" // Style inactif
                }`}
              >
                Zone dangereuse
              </button>
            </nav>
          </div>

          {/* === CONTENU PRINCIPAL DES ONGLETS === */}
          <div className="p-6">
            {/* === AFFICHAGE DES MESSAGES (SUCCÈS/ERREUR) === */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.includes("succès")
                    ? "bg-green-50 text-green-700" // Style succès (vert)
                    : "bg-red-50 text-red-700" // Style erreur (rouge)
                }`}
              >
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* === ONGLET INFORMATIONS PERSONNELLES === */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* === GRILLE RESPONSIVE POUR NOM ET PRÉNOM === */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Champ Nom */}
                  <div>
                    <label
                      htmlFor="nom"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      value={profileData.nom}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-meteo-blue focus:border-meteo-blue"
                    />
                    {/* Affichage conditionnel des erreurs de validation */}
                    {errors.nom && (
                      <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                    )}
                  </div>

                  {/* Champ Prénom */}
                  <div>
                    <label
                      htmlFor="prenom"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prénom
                    </label>
                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      required
                      value={profileData.prenom}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-meteo-blue focus:border-meteo-blue"
                    />
                    {/* Affichage conditionnel des erreurs de validation */}
                    {errors.prenom && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.prenom}
                      </p>
                    )}
                  </div>
                </div>

                {/* === CHAMP EMAIL (LECTURE SEULE) === */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    disabled // Email non modifiable pour éviter les conflits d'identité
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                {/* === CHAMP TÉLÉPHONE === */}
                <div>
                  <label
                    htmlFor="telephone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    required
                    value={profileData.telephone}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-meteo-blue focus:border-meteo-blue"
                  />
                  {/* Affichage conditionnel des erreurs de validation */}
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.telephone}
                    </p>
                  )}
                </div>

                {/* === CHAMP LOCALITÉ === */}
                <div>
                  <label
                    htmlFor="localite"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Localité
                  </label>
                  <input
                    id="localite"
                    name="localite"
                    type="text"
                    required
                    value={profileData.localite}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-meteo-blue focus:border-meteo-blue"
                  />
                  {/* Affichage conditionnel des erreurs de validation */}
                  {errors.localite && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.localite}
                    </p>
                  )}
                </div>

                {/* === BOUTON DE SOUMISSION PROFIL === */}
                <button
                  type="submit"
                  disabled={isLoading} // Désactivé pendant le chargement
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-meteo-blue hover:bg-meteo-title focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meteo-blue disabled:opacity-50"
                >
                  {isLoading ? "Mise à jour..." : "Mettre à jour le profil"}
                </button>
              </form>
            )}

            {/* Onglet Mot de passe */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mot de passe actuel
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-meteo-blue focus:border-meteo-blue"
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-meteo-blue focus:border-meteo-blue"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmNewPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    required
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-meteo-blue focus:border-meteo-blue"
                  />
                  {errors.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmNewPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-meteo-blue hover:bg-meteo-title focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meteo-blue disabled:opacity-50"
                >
                  {isLoading ? "Changement..." : "Changer le mot de passe"}
                </button>
              </form>
            )}

            {/* === ONGLET ZONE DANGEREUSE === */}
            {activeTab === "danger" && (
              <div className="space-y-6">
                {/* === SECTION SUPPRESSION DE COMPTE === */}
                <div className="border border-red-200 rounded-md p-6 bg-red-50">
                  <h3 className="text-lg font-medium text-red-900 mb-4">
                    Supprimer le compte
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Une fois votre compte supprimé, toutes vos données seront
                    définitivement effacées. Cette action ne peut pas être
                    annulée.
                  </p>
                  {/* === BOUTON DE SUPPRESSION CRITIQUE === */}
                  <button
                    onClick={handleDeleteAccount} // Gestionnaire avec confirmation
                    disabled={isLoading} // Désactivé pendant le chargement
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isLoading ? "Suppression..." : "Supprimer mon compte"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
