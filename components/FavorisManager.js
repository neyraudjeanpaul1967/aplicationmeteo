/**
 * COMPOSANT FAVORIS MANAGER - GESTION DES VILLES FAVORITES
 *
 * Ce composant gère la liste des villes favorites de l'utilisateur.
 * Il permet d'ajouter, supprimer et naviguer entre les villes favorites.
 * Limite de 3 villes pour les utilisateurs gratuits.
 *
 * Props:
 * - villeActuelle: nom de la ville actuellement affichée
 * - onVilleChange: fonction callback appelée quand l'utilisateur change de ville
 *
 * Fonctionnalités:
 * - Affichage de la liste des favoris
 * - Ajout de nouvelles villes (avec limite)
 * - Suppression de villes existantes
 * - Navigation entre les villes
 * - Messages de feedback utilisateur
 * - Gestion des états de chargement
 */

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function FavorisManager({ villeActuelle, onVilleChange }) {
  // État local pour stocker la liste des villes favorites
  const [favoris, setFavoris] = useState([]);

  // État de chargement pour les opérations asynchrones
  const [isLoading, setIsLoading] = useState(false);

  // Messages de feedback pour l'utilisateur (succès, erreurs, etc.)
  const [message, setMessage] = useState("");

  // Récupération de l'utilisateur connecté
  const { user } = useAuth();

  // Effet pour charger les favoris quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      chargerFavoris();
    }
  }, [user]);

  /**
   * Fonction pour charger la liste des villes favorites depuis l'API
   * Utilise une requête GET avec l'ID utilisateur en paramètre
   */
  const chargerFavoris = async () => {
    // Vérification de la présence de l'utilisateur
    if (!user?.id) return;

    try {
      // Construction de l'URL avec les paramètres de requête
      const url = new URL("/api/favoris", window.location.origin);
      url.searchParams.append("userId", user.id);

      // Appel de l'API pour récupérer les favoris
      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        // Mise à jour de l'état avec les données reçues (tableau vide par défaut)
        setFavoris(result.data || []);
      }
    } catch (error) {
      // Gestion des erreurs de réseau ou d'API
      console.error("Erreur chargement favoris:", error);
    }
  };

  /**
   * Fonction pour ajouter la ville actuelle aux favoris
   * Vérifie les conditions avant l'ajout (limite, doublons, etc.)
   */
  const ajouterFavori = async () => {
    // Vérifications préalables: utilisateur connecté et ville sélectionnée
    if (!user?.id || !villeActuelle) return;

    // Activation de l'état de chargement
    setIsLoading(true);
    setMessage("");

    try {
      // Requête POST pour ajouter la ville aux favoris
      const response = await fetch("/api/favoris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ville: villeActuelle,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Succès: affichage du message de confirmation
        setMessage("✅ Ville ajoutée aux favoris !");
        chargerFavoris(); // Rechargement de la liste pour mise à jour
      } else {
        // Erreur API: affichage du message d'erreur reçu
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      // Erreur réseau: affichage d'un message générique
      setMessage("❌ Erreur lors de l'ajout");
      console.error("Erreur ajout favori:", error);
    }

    // Désactivation de l'état de chargement
    setIsLoading(false);

    // Auto-suppression du message après 3 secondes
    setTimeout(() => setMessage(""), 3000);
  };

  /**
   * Fonction pour supprimer une ville des favoris
   * @param {string} ville - Nom de la ville à supprimer
   */
  const supprimerFavori = async (ville) => {
    // Vérification de la présence de l'utilisateur
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Requête DELETE pour supprimer la ville des favoris
      const response = await fetch("/api/favoris", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ville: ville,
        }),
      });

      if (response.ok) {
        // Succès: message de confirmation
        setMessage("🗑️ Favori supprimé");
        chargerFavoris(); // Recharger la liste
      } else {
        const result = await response.json();
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Erreur lors de la suppression");
      console.error("Erreur suppression favori:", error);
    }

    setIsLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const selectionnerFavori = (ville) => {
    if (onVilleChange) {
      onVilleChange(ville);
    }
  };

  // N'afficher que si l'utilisateur est connecté
  if (!user) {
    return null;
  }

  const villeEstEnFavori = favoris.some(
    (f) => f.ville.toLowerCase() === villeActuelle?.toLowerCase()
  );

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
        ⭐ Mes Favoris ({favoris.length}/3)
      </h3>

      {/* Liste des favoris */}
      {favoris.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-1 gap-2">
            {favoris.map((favori, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
              >
                <button
                  onClick={() => selectionnerFavori(favori.ville)}
                  className="flex-1 text-left text-blue-700 hover:text-blue-900 font-medium"
                >
                  📍 {favori.ville}
                </button>
                <button
                  onClick={() => supprimerFavori(favori.ville)}
                  className="text-red-500 hover:text-red-700 ml-2 p-1"
                  title="Supprimer ce favori"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton d'ajout */}
      <div className="flex items-center gap-2">
        <button
          onClick={ajouterFavori}
          disabled={
            isLoading ||
            !villeActuelle ||
            villeEstEnFavori ||
            favoris.length >= 3
          }
          className="flex-1 bg-meteo-blue text-white px-4 py-2 rounded-lg hover:bg-meteo-title disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading
            ? "⏳"
            : villeEstEnFavori
            ? "✅ En favoris"
            : "➕ Ajouter aux favoris"}
        </button>
      </div>

      {/* Message de statut */}
      {message && (
        <div
          className={`mt-2 p-2 rounded text-sm ${
            message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Aide */}
      {favoris.length === 0 && (
        <p className="text-gray-600 text-sm mt-2">
          💡 Recherchez une ville puis cliquez sur "Ajouter aux favoris" pour la
          sauvegarder
        </p>
      )}
    </div>
  );
}
