/**
 * Page de confirmation de paiement Stripe
 *
 * Cette page gère le retour utilisateur après un processus de paiement Stripe.
 * Elle est automatiquement appelée via la redirection configurée dans l'API
 * de création de session Stripe (/api/chekout_sessions).
 *
 * Fonctionnalités principales :
 * - Récupération de l'ID de session depuis l'URL (?session_id=xxx)
 * - Vérification du statut de paiement via l'API backend
 * - Affichage conditionnel selon le résultat (succès, erreur, loading)
 * - Interface utilisateur avec feedback visuel approprié
 *
 * Workflow de paiement :
 * 1. Utilisateur clique "Acheter Premium" sur la page d'accueil
 * 2. Redirection vers Stripe pour le paiement
 * 3. Stripe redirige vers cette page avec session_id
 * 4. Vérification backend du paiement et activation premium
 * 5. Affichage du résultat à l'utilisateur
 *
 * États possibles :
 * - "loading" : Vérification en cours du statut de paiement
 * - "complete"/"paid" : Paiement réussi, premium activé
 * - "error" : Erreur lors du paiement ou de la vérification
 *
 * Intégrations :
 * - Next.js Router : Récupération des paramètres URL et navigation
 * - API checkout-sessions : Vérification du statut de paiement
 * - Interface utilisateur responsive avec états visuels
 *
 * @author Jean-Paul
 * @version 1.0.0
 * @since 2025
 */

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Composant de page de confirmation de paiement
 *
 * Gère l'affichage du résultat d'un paiement Stripe et la vérification
 * de l'activation du statut premium utilisateur.
 *
 * @returns {JSX.Element} Interface de confirmation avec état approprié
 */
export default function Success() {
  // Hook de navigation Next.js pour accéder aux paramètres URL
  const router = useRouter();

  // Extraction de l'ID de session depuis les paramètres de requête URL
  const { session_id } = router.query;

  // État local pour tracker le statut de vérification du paiement
  const [status, setStatus] = useState("loading");

  /**
   * Effect de vérification du statut de paiement
   *
   * Se déclenche quand session_id est disponible dans l'URL.
   * Effectue un appel à l'API backend pour vérifier le paiement
   * et activer le statut premium si nécessaire.
   *
   * Workflow :
   * 1. Vérification de la présence de session_id
   * 2. Appel API vers /api/checkout-sessions/[session_id]
   * 3. Traitement de la réponse et mise à jour du statut
   * 4. Gestion des erreurs avec fallback approprié
   *
   * Dependencies : [session_id] - Se relance si l'ID change
   */
  useEffect(() => {
    // Vérification de la présence obligatoire de session_id
    if (session_id) {
      console.log("🔍 Success page - Session ID:", session_id);

      // Appel API pour vérifier le statut de la session de paiement Stripe
      fetch(`/api/checkout-sessions/${session_id}`)
        .then((res) => {
          console.log("📡 Success page - Response status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("✅ Success page - Data received:", data);
          // Mise à jour du statut local avec la réponse de l'API
          setStatus(data.status);
        })
        .catch((error) => {
          console.error("❌ Success page - Error:", error);
          // En cas d'erreur, définir le statut comme erreur
          setStatus("error");
        });
    } else if (router.isReady) {
      // Log d'erreur seulement si le router est prêt et qu'il n'y a vraiment pas de session_id
      console.log(
        "❌ Success page - No session_id found in URL after router ready"
      );
      setStatus("error");
    }
    // Sinon, on reste en loading le temps que le router soit prêt
  }, [session_id, router.isReady]); // Dépendance : se relance quand session_id change ou router est prêt

  /**
   * Affichage de l'état de chargement
   *
   * Pendant que l'API vérifie le statut du paiement Stripe.
   * Inclut un spinner animé pour feedback utilisateur.
   */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Traitement du paiement...</h1>
          {/* Spinner CSS animé pour indiquer le chargement */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  /**
   * Affichage de confirmation de paiement réussi
   *
   * Statuts acceptés : "complete" ou "paid" (variations Stripe)
   * Inclut icône de validation, message de succès et bouton retour.
   */
  if (status === "complete" || status === "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="mb-4">
            {/* Icône SVG de validation (checkmark) */}
            <svg
              className="w-16 h-16 text-green-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            Paiement réussi !
          </h1>
          <p className="text-green-600 mb-6">
            Votre commande a été traitée avec succès.
          </p>
          {/* Bouton de retour à la page d'accueil */}
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  /**
   * Affichage d'erreur de paiement
   *
   * Cas par défaut pour tous les autres statuts (échec, annulation, etc.)
   * Inclut icône d'erreur, message explicatif et bouton retour.
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <div className="mb-4">
          {/* Icône SVG d'erreur (croix) */}
          <svg
            className="w-16 h-16 text-red-600 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-red-800 mb-4">
          Erreur de paiement
        </h1>
        <p className="text-red-600 mb-6">
          Une erreur est survenue lors du traitement de votre paiement.
        </p>
        {/* Bouton de retour pour permettre une nouvelle tentative */}
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
