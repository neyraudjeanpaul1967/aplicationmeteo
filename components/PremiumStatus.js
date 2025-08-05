/**
 * COMPOSANT PREMIUM STATUS
 *
 * Ce composant affiche le statut premium de l'utilisateur connecté.
 * Il vérifie si l'utilisateur a un abonnement premium actif et affiche
 * les informations correspondantes (date d'expiration, statut, etc.).
 *
 * Fonctionnalités:
 * - Récupération du statut premium via API
 * - Affichage conditionnel selon le statut
 * - Format de date localisé en français
 * - Design responsive avec icônes
 */

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function PremiumStatus() {
  // Récupération de l'utilisateur connecté depuis le contexte d'authentification
  const { user } = useAuth();

  // État local pour stocker les informations de statut premium
  const [premiumStatus, setPremiumStatus] = useState(null);

  // État de chargement pour éviter l'affichage prématuré
  const [loading, setLoading] = useState(true);

  // Effet qui se déclenche quand l'utilisateur change (connexion/déconnexion)
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et a un ID valide
    if (user?.id) {
      fetchPremiumStatus();
    }
  }, [user]);

  /**
   * Fonction pour récupérer le statut premium de l'utilisateur
   * Appelle l'API /api/users/premium-status avec l'ID utilisateur
   */
  const fetchPremiumStatus = async () => {
    try {
      // Appel API pour récupérer le statut premium
      const response = await fetch(
        `/api/users/premium-status?userId=${user.id}`
      );
      const data = await response.json();

      // Mise à jour de l'état avec les données reçues
      setPremiumStatus(data);
    } catch (error) {
      // Gestion des erreurs de réseau ou d'API
      console.error("Erreur lors de la récupération du statut premium:", error);
    } finally {
      // Arrêt du chargement dans tous les cas (succès ou erreur)
      setLoading(false);
    }
  };

  // Affichage conditionnel: masquer si pas d'utilisateur ou en cours de chargement
  // Affichage conditionnel: masquer si pas d'utilisateur ou en cours de chargement
  if (!user?.id || loading) {
    return null;
  }

  // Si l'utilisateur a un statut premium actif
  if (premiumStatus?.is_premium) {
    // Conversion de la date d'expiration en objet Date JavaScript
    const expiresAt = new Date(premiumStatus.premium_expires_at);

    return (
      // Container principal avec design vert pour indiquer le statut premium
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          {/* Icône de validation (checkmark) */}
          <svg
            className="w-5 h-5 text-green-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>

          {/* Informations textuelles du statut premium */}
          <div>
            <h3 className="text-green-800 font-semibold">
              Utilisateur Premium
            </h3>
            <p className="text-green-600 text-sm">
              {/* Formatage de la date en français (DD/MM/YYYY) */}
              Votre abonnement expire le {expiresAt.toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas premium, ne rien afficher
  // (Possibilité d'ajouter ici un message pour promouvoir l'upgrade premium)
  return null;
}
