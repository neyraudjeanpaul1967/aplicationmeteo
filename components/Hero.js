/**
 * COMPOSANT HERO - COMPOSANT PRINCIPAL DE L'APPLICATION MÉTÉO
 *
 * Ce composant centralise toute la logique météorologique de l'application.
 * Il gère l'affichage des données météo, la recherche de villes,
 * le carousel des jours et l'intégration avec les favoris.
 *
 * Fonctionnalités principales:
 * - Recherche de villes avec autocomplétion
 * - Affichage des données météo (matin, après-midi, soir)
 * - Carousel interactif des jours de la semaine
 * - Intégration avec le système de favoris
 * - Gestion de la géolocalisation
 * - API OpenWeatherMap pour les données météo
 * - Design responsive avec vidéo de fond
 */

import { useState, useEffect } from "react";
import FavorisManager from "./FavorisManager";

// Configuration des images des jours de la semaine pour le carousel
const jours = [
  { src: "/assets/img/lundi.png", alt: "lundi" },
  { src: "/assets/img/mardi.png", alt: "mardi" },
  { src: "/assets/img/mercredi.png", alt: "mercredi" },
  { src: "/assets/img/jeudi.png", alt: "jeudi" },
  { src: "/assets/img/vendredi.png", alt: "vendredi" },
  { src: "/assets/img/samedi.png", alt: "samedi" },
  { src: "/assets/img/dimanche.png", alt: "dimanche" },
];

export default function Hero() {
  // === ÉTATS LOCAUX ===

  // Index pour le carousel des jours (0 = lundi, 6 = dimanche)
  const [index, setIndex] = useState(0);

  // Données de prévision météo complètes de l'API
  const [forecastData, setForecastData] = useState(null);

  // Nom de la ville actuellement affichée
  const [cityName, setCityName] = useState("météo ville");

  // Requête de recherche tapée par l'utilisateur
  const [searchQuery, setSearchQuery] = useState("");

  // Liste d'autocomplétion pour la recherche de villes
  const [autocompleteList, setAutocompleteList] = useState([]);

  // Données météo formatées pour les 3 moments de la journée
  const [weatherData, setWeatherData] = useState({
    matin: null, // Données du matin (6h-12h)
    apres: null, // Données de l'après-midi (12h-18h)
    soir: null, // Données du soir (18h-24h)
  });

  // === CONFIGURATION API ===

  // Clé API OpenWeatherMap (depuis les variables d'environnement)
  const API_KEY =
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
    "07999b6dee5f40e19ea66fc271a547d0";

  // URL de base de l'API OpenWeatherMap pour les prévisions
  const API_URL = "https://api.openweathermap.org/data/2.5/forecast";

  // === FONCTIONS DE GESTION DU CAROUSEL ===

  /**
   * Fonction pour mettre à jour le carousel des jours
   * @param {number} newIndex - Nouvel index du jour à afficher (0-6)
   */
  const updateCarousel = (newIndex) => {
    setIndex(newIndex);
    displayMeteoForDay(newIndex);
  };

  /**
   * Gestionnaire pour le bouton "Précédent" du carousel
   * Utilise le modulo pour faire une rotation circulaire
   */
  const handlePrev = () => {
    const newIndex = (index - 1 + jours.length) % jours.length;
    updateCarousel(newIndex);
  };

  /**
   * Gestionnaire pour le bouton "Suivant" du carousel
   * Utilise le modulo pour faire une rotation circulaire
   */
  const handleNext = () => {
    const newIndex = (index + 1) % jours.length;
    updateCarousel(newIndex);
  };

  // === FONCTIONS DE RECHERCHE ET MÉTÉO ===

  /**
   * Gestionnaire pour la recherche de ville via le formulaire
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleCitySearch = async (e) => {
    e.preventDefault();
    const ville = searchQuery.trim();
    if (!ville) return;

    await searchAndDisplayWeather(ville);
  };

  // Fonction pour changer de ville depuis les favoris
  const handleVilleChange = async (ville) => {
    setSearchQuery(ville);
    await searchAndDisplayWeather(ville);
  };

  // Fonction commune pour rechercher et afficher la météo
  const searchAndDisplayWeather = async (ville) => {
    setCityName("Chargement...");

    try {
      const url = `${API_URL}?q=${encodeURIComponent(
        ville
      )},fr&appid=${API_KEY}&units=metric&lang=fr`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Ville non trouvée");
      const data = await response.json();

      setCityName(data.city.name);
      setForecastData(data);
      const now = new Date();
      const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
      displayMeteoForDay(currentDay);
    } catch (err) {
      setCityName("Ville non trouvée");
      setWeatherData({ matin: null, apres: null, soir: null });
    }
  };

  // Fonction pour afficher la météo d'un jour donné
  const displayMeteoForDay = (dayIndex) => {
    if (!forecastData) return;

    const list = forecastData.list;
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const diff = dayIndex - currentDay;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    const forecasts = list.filter((item) => {
      const d = new Date(item.dt_txt);
      return (
        d.getDate() === targetDate.getDate() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getFullYear() === targetDate.getFullYear()
      );
    });

    if (forecasts.length === 0) return;

    const getClosest = (hour) => {
      return forecasts.reduce((prev, curr) => {
        const currHour = new Date(curr.dt_txt).getHours();
        return Math.abs(currHour - hour) <
          Math.abs(new Date(prev.dt_txt).getHours() - hour)
          ? curr
          : prev;
      }, forecasts[0]);
    };

    const matin = getClosest(9);
    const apres = getClosest(15);
    const soir = getClosest(21);

    setWeatherData({ matin, apres, soir });
  };

  // Fonction pour rechercher les communes
  const fetchCommunes = async (query) => {
    if (query.length < 2) {
      setAutocompleteList([]);
      return;
    }
    try {
      const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(
        query
      )}&fields=nom&boost=population&limit=7`;
      const res = await fetch(url);
      const data = await res.json();
      setAutocompleteList(data);
    } catch (error) {
      setAutocompleteList([]);
    }
  };

  // Gestion de l'input de recherche
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchCommunes(value);
  };

  // Sélection d'une commune dans l'autocomplétion
  const selectCommune = (commune) => {
    setSearchQuery(commune.nom);
    setAutocompleteList([]);
  };

  // Initialisation au montage du composant
  useEffect(() => {
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
    setIndex(currentDay);
  }, []);

  return (
    <main className="w-full max-w-[350px] md:max-w-[980px] lg:max-w-[1200px] mx-auto">
      <div className="md:flex md:gap-5 lg:flex lg:gap-8">
        {/* Colonne de gauche */}
        <div className="flex-1 md:flex-[2] lg:flex-[2]">
          {/* Formulaire de recherche */}
          <form
            onSubmit={handleCitySearch}
            className="relative flex gap-5 md:gap-3 lg:gap-5"
          >
            <input
              type="search"
              placeholder="Tapez votre ville"
              value={searchQuery}
              onChange={handleInputChange}
              className="flex-1 p-3 my-5 text-lg rounded-md border-none bg-[#b4d9e2] md:my-4 md:text-base md:rounded-full lg:text-lg"
              autoComplete="off"
            />
            <button
              type="submit"
              className="w-[30%] p-3 my-5 text-lg rounded-md border-none bg-[#b4d9e2] hover:bg-[#9bc7d1] transition-colors md:my-4 md:text-base md:h-10 lg:text-lg lg:h-12"
            >
              Valider
            </button>

            {/* Liste d'autocomplétion */}
            {autocompleteList.length > 0 && (
              <ul className="absolute top-16 left-0 w-[70%] bg-white border border-gray-300 rounded-b-md max-h-44 overflow-y-auto z-10 list-none">
                {autocompleteList.map((commune, idx) => (
                  <li
                    key={idx}
                    onClick={() => selectCommune(commune)}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                  >
                    {commune.nom}
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Gestionnaire de favoris */}
          <FavorisManager
            villeActuelle={
              cityName !== "météo ville" &&
              cityName !== "Chargement..." &&
              cityName !== "Ville non trouvée"
                ? cityName
                : null
            }
            onVilleChange={handleVilleChange}
          />

          {/* Bloc ville */}
          <div className="bg-gray-200 rounded-lg p-3 mb-4 text-center">
            <div className="text-meteo-title font-bold mb-1 border-b border-gray-400 pb-1">
              {cityName}
            </div>
            <div className="w-full h-10 mb-2">
              <img
                src="/assets/img/images.jpg"
                alt="photo ville"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          </div>

          {/* Bloc bulletin */}
          <div className="bg-[#63bed4] rounded-lg p-3 mb-4 text-center">
            <div className="mt-1 text-sm">
              <p>Bulletin de la Journée</p>
              {weatherData.matin && weatherData.apres && weatherData.soir && (
                <div className="flex justify-between mt-1">
                  <p>
                    Min:{" "}
                    {Math.round(
                      Math.min(
                        weatherData.matin.main.temp,
                        weatherData.apres.main.temp,
                        weatherData.soir.main.temp
                      )
                    )}
                    °C
                  </p>
                  <p>
                    Max:{" "}
                    {Math.round(
                      Math.max(
                        weatherData.matin.main.temp,
                        weatherData.apres.main.temp,
                        weatherData.soir.main.temp
                      )
                    )}
                    °C
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Périodes météo */}
          <div className="flex justify-between mb-4 gap-2 md:flex-row lg:flex-row">
            {/* Matin */}
            <div className="flex-1 h-52 flex flex-col items-center justify-center rounded-lg bg-meteo-morning text-gray-800 font-bold text-center gap-3 shadow-[-8px_6px_0px_0px_#c7a272] lg:flex-row lg:h-24 lg:gap-5 lg:text-left lg:p-3">
              <p className="lg:order-3 lg:ml-auto lg:font-bold">Matin</p>
              {weatherData.matin && (
                <>
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.matin.weather[0].icon}.png`}
                    alt="météo matin"
                    width="48"
                    height="48"
                    className="lg:order-1 lg:mr-3"
                  />
                  <div className="lg:order-2">
                    <div>{Math.round(weatherData.matin.main.temp)}°C</div>
                    <small>{weatherData.matin.weather[0].description}</small>
                  </div>
                </>
              )}
            </div>

            {/* Après-midi */}
            <div className="flex-1 h-52 flex flex-col items-center justify-center rounded-lg bg-meteo-afternoon text-gray-800 font-bold text-center gap-3 shadow-[0px_6px_0px_0px_#a3bf46] lg:flex-row lg:h-24 lg:gap-5 lg:text-left lg:p-3">
              <p className="lg:order-3 lg:ml-auto lg:font-bold">Après-midi</p>
              {weatherData.apres && (
                <>
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.apres.weather[0].icon}.png`}
                    alt="météo après-midi"
                    width="48"
                    height="48"
                    className="lg:order-1 lg:mr-3"
                  />
                  <div className="lg:order-2">
                    <div>{Math.round(weatherData.apres.main.temp)}°C</div>
                    <small>{weatherData.apres.weather[0].description}</small>
                  </div>
                </>
              )}
            </div>

            {/* Soir */}
            <div className="flex-1 h-52 flex flex-col items-center justify-center rounded-lg bg-meteo-evening text-gray-800 font-bold text-center gap-3 shadow-[8px_6px_0px_0px_#cf6666] lg:flex-row lg:h-24 lg:gap-5 lg:text-left lg:p-3">
              <p className="lg:order-3 lg:ml-auto lg:font-bold">Soir</p>
              {weatherData.soir && (
                <>
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.soir.weather[0].icon}.png`}
                    alt="météo soir"
                    width="48"
                    height="48"
                    className="lg:order-1 lg:mr-3"
                  />
                  <div className="lg:order-2">
                    <div>{Math.round(weatherData.soir.main.temp)}°C</div>
                    <small>{weatherData.soir.weather[0].description}</small>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite - Carrousel */}
        <div className="md:flex-[2] lg:flex-[2]">
          <div className="relative overflow-hidden bg-gray-300 h-52 rounded-lg mb-4 flex items-center justify-center text-gray-700 text-lg border border-gray-400 gap-3 p-0 md:w-1/2 md:h-1/2 md:ml-16 md:p-20 lg:w-full lg:h-88 lg:ml-0 lg:p-0">
            {/* Vidéo YouTube en arrière-plan */}
            <iframe
              src="https://www.youtube.com/embed/Sl6DbRoX9X4?autoplay=1&mute=1&controls=0&loop=1&playlist=Sl6DbRoX9X4"
              title="Midnight Sun in the Arctic (Time-Lapse)"
              className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none object-cover"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />

            {/* Image du jour */}
            <img
              src={jours[index].src}
              alt={jours[index].alt}
              width="120"
              height="120"
              className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[2] w-32 h-32 object-cover rounded-lg bg-white object-center shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            />

            {/* Bouton précédent */}
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-5 transform -translate-y-1/2 z-[3] bg-meteo-title text-white border-none rounded-full w-9 h-9 text-2xl cursor-pointer flex items-center justify-center opacity-90 hover:opacity-100"
            >
              ←
            </button>

            {/* Bouton suivant */}
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-5 transform -translate-y-1/2 z-[3] bg-meteo-title text-white border-none rounded-full w-9 h-9 text-2xl cursor-pointer flex items-center justify-center opacity-90 hover:opacity-100"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
