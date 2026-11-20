import { FILL_THRESHOLDS, COLORS, RECOMMENDATION } from './constants';

/**
 * Calcule la distance entre deux points GPS avec la formule de Haversine
 * @param {number} lat1 - Latitude du point 1
 * @param {number} lon1 - Longitude du point 1
 * @param {number} lat2 - Latitude du point 2
 * @param {number} lon2 - Longitude du point 2
 * @returns {number} Distance en kilomètres
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Retourne la couleur correspondant au niveau de remplissage
 * @param {number} fillLevel - Pourcentage de remplissage (0-100)
 * @returns {string} Code couleur hexadécimal
 */
export function getFillColor(fillLevel) {
  if (fillLevel < FILL_THRESHOLDS.LOW) return COLORS.fillLow;
  if (fillLevel < FILL_THRESHOLDS.HIGH) return COLORS.fillMedium;
  return COLORS.fillHigh;
}

/**
 * Retourne le label du statut de remplissage
 * @param {number} fillLevel
 * @returns {string}
 */
export function getFillLabel(fillLevel) {
  if (fillLevel < FILL_THRESHOLDS.LOW) return 'Disponible';
  if (fillLevel < FILL_THRESHOLDS.HIGH) return 'Presque plein';
  return 'Plein';
}

/**
 * Calcule le score de recommandation d'un conteneur
 * Score = (1 - fillLevel/100) × 0.6 + (1 - distance/maxDistance) × 0.4
 * @param {number} fillLevel - Pourcentage de remplissage
 * @param {number} distance - Distance en km
 * @returns {number} Score entre 0 et 1
 */
export function calculateRecommendationScore(fillLevel, distance) {
  const fillScore = 1 - fillLevel / 100;
  const distScore = 1 - Math.min(distance, RECOMMENDATION.MAX_DISTANCE_KM) / RECOMMENDATION.MAX_DISTANCE_KM;
  return fillScore * RECOMMENDATION.WEIGHT_FILL + distScore * RECOMMENDATION.WEIGHT_DISTANCE;
}

/**
 * Trie et retourne les conteneurs recommandés (meilleur score en premier)
 * @param {Array} containers - Liste des conteneurs
 * @param {number} userLat - Latitude de l'utilisateur
 * @param {number} userLon - Longitude de l'utilisateur
 * @returns {Array} Conteneurs triés par score décroissant
 */
export function getRecommendedContainers(containers, userLat, userLon) {
  return containers
    .map((container) => {
      const distance = haversineDistance(
        userLat, userLon,
        container.latitude, container.longitude
      );
      const score = calculateRecommendationScore(container.fillLevel, distance);
      return { ...container, distance, score };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Formate la distance pour l'affichage
 * @param {number} distanceKm - Distance en kilomètres
 * @returns {string}
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Formate une date ISO pour l'affichage
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
