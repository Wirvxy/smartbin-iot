import { RECOMMENDATION } from './constants';

/**
 * Distance entre deux points GPS (formule de Haversine), en kilomètres.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Score de recommandation d'un conteneur, entre 0 et 1.
 * Score = (1 - remplissage/100) × 0.6 + (1 - distance/maxDistance) × 0.4
 * Un bac vide et proche obtient le meilleur score.
 */
export function calculateRecommendationScore(fillLevel, distance) {
  const fillScore = 1 - fillLevel / 100;
  const distScore = 1 - Math.min(distance, RECOMMENDATION.MAX_DISTANCE_KM) / RECOMMENDATION.MAX_DISTANCE_KM;
  return fillScore * RECOMMENDATION.WEIGHT_FILL + distScore * RECOMMENDATION.WEIGHT_DISTANCE;
}

/**
 * Ajoute distance et score à chaque conteneur, meilleur score en premier.
 * Ordre des groupes : bacs disponibles, puis bacs en maintenance ou inactifs,
 * puis bacs pleins (au-dessus de leur seuil). Le score départage dans chaque groupe.
 */
export function getRecommendedContainers(containers, userLat, userLon) {
  const group = (c) => {
    if (c.fillLevel >= (c.threshold ?? 80)) return 2;
    if (c.status === 'MAINTENANCE' || c.status === 'INACTIVE') return 1;
    return 0;
  };
  return containers
    .map((container) => {
      const distance = haversineDistance(userLat, userLon, container.latitude, container.longitude);
      const score = calculateRecommendationScore(container.fillLevel, distance);
      return { ...container, distance, score };
    })
    .sort((a, b) => group(a) - group(b) || b.score - a.score);
}

export function formatDistance(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** "il y a 3 min" style, for the last sensor reading. */
export function formatAgo(isoDate) {
  if (!isoDate) return 'aucune mesure';
  const s = Math.max(0, (Date.now() - new Date(isoDate).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  return formatDate(isoDate);
}

/** Opens turn-by-turn directions to a bin (Google Maps works on every platform). */
export function directionsUrl(container) {
  return `https://www.google.com/maps/dir/?api=1&destination=${container.latitude},${container.longitude}&travelmode=walking`;
}
