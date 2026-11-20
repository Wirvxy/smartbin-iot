// ============================================
// Configuration de l'API Backend
// ============================================
// Adresse du backend Spring Boot (PFE-web). Sur un téléphone, utilisez l'IP du PC :
//   EXPO_PUBLIC_API_URL=http://192.168.x.x:8080/api npx expo start
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

// Mode démo : données fictives, aucune connexion au backend.
// Désactivez-le avec EXPO_PUBLIC_DEMO_MODE=false pour utiliser l'API réelle.
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';

// ============================================
// Seuils de remplissage des conteneurs
// ============================================
export const FILL_THRESHOLDS = {
  LOW: 70,    // < 70% = Vert (disponible)
  HIGH: 90,   // 70-90% = Orange (presque plein)
                // > 90% = Rouge (plein)
};

// ============================================
// Couleurs de l'application
// ============================================
export const COLORS = {
  primary: '#2E7D32',       // Vert principal
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  secondary: '#1565C0',     // Bleu
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  error: '#D32F2F',
  warning: '#F57C00',
  success: '#388E3C',
  // Couleurs des niveaux de remplissage
  fillLow: '#4CAF50',       // Vert - < 70%
  fillMedium: '#FF9800',    // Orange - 70-90%
  fillHigh: '#F44336',      // Rouge - > 90%
  white: '#FFFFFF',
  black: '#000000',
  grey: '#9E9E9E',
  lightGrey: '#E0E0E0',
};
// ============================================
// Coefficients de l'algorithme de recommandation
// Score = (1 - fillLevel/100) × WEIGHT_FILL + (1 - distance/maxDistance) × WEIGHT_DISTANCE
// ============================================
export const RECOMMENDATION = {
  WEIGHT_FILL: 0.6,
  WEIGHT_DISTANCE: 0.4,
  MAX_DISTANCE_KM: 10,  // Distance maximale considérée (km)
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