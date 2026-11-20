// ============================================
// Configuration de l'API Backend
// ============================================
// Adresse du backend Spring Boot. Sur un téléphone, utilisez l'IP du PC :
//   EXPO_PUBLIC_API_URL=http://192.168.x.x:8080/api npx expo start
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

// Mode démo : données fictives (les mêmes 10 bacs à Fès que le backend en profil "demo"),
// aucune connexion au backend. Désactivez-le avec EXPO_PUBLIC_DEMO_MODE=false.
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';

// Position utilisée en mode démo quand le téléphone ou le navigateur ne donne pas la sienne :
// Place de Florence, centre de Fès.
export const DEMO_LOCATION = { latitude: 34.0421, longitude: -4.9999 };

// Centre de la carte par défaut : Fès.
export const FES_CENTER = { latitude: 34.0331, longitude: -5.0003 };

// ============================================
// Algorithme de recommandation
// Score = (1 - remplissage/100) × WEIGHT_FILL + (1 - distance/maxDistance) × WEIGHT_DISTANCE
// ============================================
export const RECOMMENDATION = {
  WEIGHT_FILL: 0.6,
  WEIGHT_DISTANCE: 0.4,
  MAX_DISTANCE_KM: 10,
};

// ============================================
// Clés AsyncStorage
// ============================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  LAST_REGION: '@last_region',
  USER_DATA: '@user_data',
};
