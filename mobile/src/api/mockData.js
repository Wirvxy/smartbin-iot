// ============================================
// Données fictives pour le mode démo.
// Ce sont les mêmes 10 bacs que le backend crée en profil "demo"
// (backend/.../config/DataInitializer.java) : de vrais lieux de Fès,
// regroupés par arrondissement.
// ============================================

export const MOCK_USER = {
  id: 1,
  name: 'Compte démo',
  email: 'demo@smartbin.ma',
  role: 'agent',
};

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const MOCK_CONTAINERS = [
  { id: 1, code: 'BIN-0001', name: 'SmartBin EST Fès', address: "Route d'Imouzzer, EST Fès", region: 'Saïss', latitude: 34.0042, longitude: -4.9918, fillLevel: 35, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(0) },
  { id: 2, code: 'BIN-0002', name: 'Bab Boujloud', address: 'Place Bab Boujloud, Fès Médina', region: 'Fès-Médina', latitude: 34.0617, longitude: -4.9840, fillLevel: 82, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(4) },
  { id: 3, code: 'BIN-0003', name: 'Avenue Hassan II', address: 'Avenue Hassan II, Ville Nouvelle', region: 'Agdal', latitude: 34.0394, longitude: -5.0014, fillLevel: 47, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(2) },
  { id: 4, code: 'BIN-0004', name: "Place R'cif", address: "Place R'cif, Fès Médina", region: 'Fès-Médina', latitude: 34.0627, longitude: -4.9726, fillLevel: 91, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(7) },
  { id: 5, code: 'BIN-0005', name: 'Gare de Fès', address: 'Rue Lalla Asmaa, Agdal', region: 'Agdal', latitude: 34.0454, longitude: -5.0043, fillLevel: 23, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(3) },
  { id: 6, code: 'BIN-0006', name: 'Bab Semmarine', address: 'Grande Rue de Fès Jdid', region: 'Fès Jdid', latitude: 34.0543, longitude: -4.9900, fillLevel: 64, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(5) },
  { id: 7, code: 'BIN-0007', name: 'Complexe sportif', address: 'Route du Parc, Fès Shore', region: 'Saïss', latitude: 34.0026, longitude: -4.9701, fillLevel: 76, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(9) },
  { id: 8, code: 'BIN-0008', name: 'Bab Ftouh', address: 'Rue Sidi Ali Boughaleb, Fès Médina', region: 'Fès-Médina', latitude: 34.0599, longitude: -4.9653, fillLevel: 15, threshold: 80, status: 'MAINTENANCE', lastUpdate: minutesAgo(41) },
  { id: 9, code: 'BIN-0009', name: 'Borj Fez', address: 'Boulevard Allal El Fassi, Agdal', region: 'Agdal', latitude: 34.0459, longitude: -4.9948, fillLevel: 97, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(1) },
  { id: 10, code: 'BIN-0010', name: 'Jardin Jnan Sbil', address: 'Avenue Moulay Hassan, Fès Jdid', region: 'Fès Jdid', latitude: 34.0599, longitude: -4.9881, fillLevel: 54, threshold: 80, status: 'ACTIVE', lastUpdate: minutesAgo(6) },
];

// Same shape as GET /api/mobile/regions: one entry per arrondissement.
export const MOCK_REGIONS = Object.entries(
  MOCK_CONTAINERS.reduce((acc, c) => ({ ...acc, [c.region]: (acc[c.region] || 0) + 1 }), {})
)
  .sort(([a], [b]) => a.localeCompare(b, 'fr'))
  .map(([name, count]) => ({ id: name, name, containerCount: count }));

const isDue = (c) => c.fillLevel >= c.threshold;
const avg = (list) => (list.length ? list.reduce((s, c) => s + c.fillLevel, 0) / list.length : 0);

export const MOCK_DAILY_STATS = {
  totalCollections: 6,
  averageFillLevel: avg(MOCK_CONTAINERS),
  fullContainers: MOCK_CONTAINERS.filter(isDue).length,
  activeContainers: MOCK_CONTAINERS.filter((c) => c.status === 'ACTIVE').length,
};

export function getMockRegionStats(regionId) {
  const inRegion = MOCK_CONTAINERS.filter((c) => c.region === regionId);
  return {
    totalContainers: inRegion.length,
    averageFillLevel: avg(inRegion),
    collectionsToday: inRegion.length ? 2 : 0,
    alerts: inRegion.filter(isDue).length,
  };
}
