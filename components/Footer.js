/**
 * COMPOSANT FOOTER - PIED DE PAGE DE L'APPLICATION
 *
 * Composant simple qui affiche le pied de page avec les informations
 * de copyright et l'attribution du site météo.
 *
 * Fonctionnalités:
 * - Affichage des crédits et copyright
 * - Design responsive (mobile/tablet/desktop)
 * - Style cohérent avec le thème de l'application
 * - Couleur cyan pour correspondre au thème météo
 */

export default function Footer() {
  return (
    <footer className="bg-cyan-400 rounded-lg p-4 flex items-center justify-center text-gray-800 text-lg border border-gray-400 text-center mx-3 my-8 md:w-[98%] md:mx-auto md:text-base lg:w-[97%] lg:text-lg lg:p-4">
      {/* Message de copyright avec l'année actuelle */}
      <p>Site météo réalisé par Jean-Paul — Tous droits réservés © 2025</p>
    </footer>
  );
}
