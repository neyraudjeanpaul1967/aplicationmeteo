/**
 * Page d'accueil principale de l'application météo
 *
 * Cette page constitue le point d'entrée principal de l'application météorologique.
 * Elle intègre tous les composants essentiels : interface météo, gestion des favoris,
 * statut premium et interface d'achat Stripe.
 *
 * Fonctionnalités principales :
 * - Affichage de l'interface météo principale via le composant Hero
 * - Gestion du statut premium utilisateur avec PremiumStatus
 * - Interface d'achat premium avec intégration Stripe
 * - Gestion de l'authentification et redirection conditionnelle
 * - Interface responsive adaptée mobile et desktop
 *
 * Architecture des composants :
 * - Header : Navigation et authentification
 * - Hero : Interface météo principale avec recherche et favoris
 * - PremiumStatus : Affichage du statut d'abonnement utilisateur
 * - Footer : Informations et liens secondaires
 *
 * Intégrations :
 * - AuthContext : Gestion de l'état d'authentification utilisateur
 * - Stripe API : Traitement des paiements premium via /api/chekout_sessions
 * - Next.js Head : Métadonnées SEO et configuration PWA
 *
 * Sécurité :
 * - Vérification de l'authentification avant achat premium
 * - Timeout de requête pour éviter les blocages réseau
 * - Gestion d'erreurs complète avec messages utilisateur explicites
 *
 * @author Jean-Paul
 * @version 1.0.0
 * @since 2025
 */

import Head from "next/head";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import PremiumStatus from "../components/PremiumStatus";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Composant principal de la page d'accueil
 *
 * Gère l'affichage de l'interface météo principale et l'achat premium.
 * Utilise le contexte d'authentification pour sécuriser les achats.
 *
 * @returns {JSX.Element} Interface complète de l'application météo
 */
export default function Home() {
  // État local pour gérer le loading pendant la redirection Stripe
  const [isLoading, setIsLoading] = useState(false);

  // Récupération du contexte d'authentification pour vérifier l'utilisateur connecté
  const { user, loading } = useAuth();

  /**
   * Gestionnaire d'achat premium
   *
   * Cette fonction gère le processus complet d'achat premium :
   * 1. Vérification de l'authentification utilisateur
   * 2. Validation de l'état de chargement
   * 3. Appel API pour créer une session de paiement Stripe
   * 4. Redirection vers l'interface de paiement Stripe
   *
   * Sécurité :
   * - Vérification obligatoire de l'authentification
   * - Timeout de 10 secondes pour éviter les blocages
   * - Gestion d'erreurs complète avec messages explicites
   *
   * Workflow :
   * - Si non connecté → redirection vers /auth/signin
   * - Si chargement → attente et message utilisateur
   * - Si connecté → création session Stripe et redirection
   *
   * @async
   * @function handlePurchase
   * @returns {Promise<void>} Promesse de redirection vers Stripe ou gestion d'erreur
   */
  const handlePurchase = async () => {
    // Logs de débogage pour tracer le processus d'achat
    console.log("🚀 Tentative d'achat premium");
    console.log("📊 Loading:", loading);
    console.log("👤 User:", user);

    // Vérification critique : utilisateur connecté requis pour l'achat
    if (!user) {
      console.log("❌ Pas d'utilisateur détecté");
      alert("Vous devez être connecté pour acheter la version premium");
      // Redirection sécurisée vers la page de connexion
      window.location.href = "/auth/signin";
      return;
    }

    // Vérification de l'état de chargement pour éviter les requêtes simultanées
    if (loading) {
      console.log("⏳ Chargement de l'utilisateur en cours");
      alert("Chargement en cours, veuillez patienter...");
      return;
    }

    console.log("✅ Utilisateur valide:", user.email);

    // Activation du loading pour feedback utilisateur pendant la requête
    setIsLoading(true);

    try {
      console.log("🚀 Début de la requête API");

      // Configuration d'un timeout pour éviter les blocages réseau
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      // Appel API pour créer une session de paiement Stripe
      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // ID utilisateur pour l'identification
          userEmail: user.email, // Email pour la facturation Stripe
        }),
        signal: controller.signal, // Signal d'abort pour le timeout
      });

      // Nettoyage du timeout si la requête aboutit
      clearTimeout(timeoutId);
      console.log("📡 Réponse API:", response.status, response.statusText);

      // Vérification du statut de la réponse HTTP
      if (!response.ok) {
        // Tentative de récupération des détails d'erreur depuis l'API
        const errorData = await response
          .json()
          .catch(() => ({ error: "Erreur de réponse" }));
        console.log("❌ Erreur API:", errorData);
        throw new Error(
          `Erreur ${response.status}: ${errorData.error || "Erreur inconnue"}`
        );
      }

      // Traitement de la réponse réussie
      const data = await response.json();
      console.log("✅ Données reçues:", data);

      // Redirection vers l'interface de paiement Stripe
      if (data.url) {
        console.log("🔗 Redirection vers Stripe:", data.url);
        window.location.href = data.url; // Redirection complète vers Stripe
      } else {
        throw new Error("Aucune URL de redirection reçue");
      }
    } catch (error) {
      // Gestion complète des erreurs avec messages utilisateur explicites
      console.error("❌ Erreur complète:", error);

      // Gestion spécifique des timeouts
      if (error.name === "AbortError") {
        alert("La requête a pris trop de temps. Veuillez réessayer.");
      }
      // Gestion des erreurs de connectivité
      else if (error.message.includes("Failed to fetch")) {
        alert(
          "Problème de connexion. Vérifiez votre connexion internet ou désactivez temporairement les extensions du navigateur."
        );
      }
      // Gestion des autres erreurs
      else {
        alert(
          `Erreur lors de la redirection vers le paiement: ${error.message}`
        );
      }
    } finally {
      // Désactivation du loading dans tous les cas (succès ou erreur)
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Configuration SEO et métadonnées de la page */}
      <Head>
        <title>La Météo de Jean-Paul</title>
        <meta
          name="description"
          content="Application météo réalisée par Jean-Paul"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Container principal avec design responsive */}
      <div className="min-h-screen font-sans">
        {/* 
          Layout responsive avec breakpoints :
          - Mobile : w-[350px] (design fixe pour mobile)
          - Tablet : md:w-[98%] md:max-w-[980px] (responsive avec limite)
          - Desktop : lg:w-4/5 lg:max-w-[1200px] (responsive large)
          
          Glassmorphism effect sur desktop avec bg-fond-container
        */}
        <div className="w-[350px] mx-auto p-4 rounded-lg min-h-[98vh] md:w-[98%] md:max-w-[980px] md:my-5 md:p-5 md:bg-fond-container md:rounded-xl md:flex md:flex-col md:gap-5 lg:w-4/5 lg:max-w-[1200px] lg:my-8 lg:p-8 lg:gap-5">
          {/* Composant de navigation et authentification */}
          <Header />

          {/* Interface météo principale avec recherche et favoris */}
          <Hero />

          {/* Affichage du statut premium utilisateur */}
          <PremiumStatus />

          {/* 
            Section d'achat premium avec intégration Stripe
            
            Cette section propose l'upgrade vers la version premium avec :
            - Description des fonctionnalités premium
            - Prix affiché clairement (9,99€)
            - Bouton d'achat avec gestion du loading
            - Design cohérent avec la charte graphique (bleu)
            
            Sécurité :
            - Bouton désactivé pendant le loading pour éviter les doubles clics
            - Vérification d'authentification dans handlePurchase
            - Feedback visuel avec changement de texte pendant la redirection
          */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">
              Version Premium
            </h2>
            <p className="text-blue-600 mb-4">
              Accédez à des fonctionnalités exclusives : prévisions étendues,
              alertes météo personnalisées et plus de favoris !
            </p>
            <div className="flex items-center justify-between">
              {/* Prix affiché de manière proéminente */}
              <span className="text-2xl font-bold text-blue-800">9,99€</span>

              {/* 
                Bouton d'achat avec états multiples :
                - Normal : "Acheter Premium"
                - Loading : "Redirection..." avec désactivation
                - Hover : effet de transition couleur
                - Disabled : style atténué avec curseur interdit
              */}
              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Redirection..." : "Acheter Premium"}
              </button>
            </div>
          </div>

          {/* Composant de pied de page avec informations secondaires */}
          <Footer />
        </div>
      </div>
    </>
  );
}
