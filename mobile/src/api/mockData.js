// ============================================
// Données fictives pour le mode démo
// ============================================

export const MOCK_USER = {
  id: 1,
  name: 'Monssif EL Haouari',
  email: 'monssif@smartwaste.ma',
  role: 'admin',
};

export const MOCK_REGIONS = [
  { id: 1, name: 'Fès - Médina', containerCount: 8 },
  { id: 2, name: 'Fès - Ville Nouvelle', containerCount: 6 },
  { id: 3, name: 'Meknès - Centre', containerCount: 7 },
  { id: 4, name: 'Casablanca - Maârif', containerCount: 8 },
  { id: 5, name: 'Casablanca - Aïn Diab', containerCount: 5 },
  { id: 6, name: 'Rabat - Agdal', containerCount: 7 },
  { id: 7, name: 'Rabat - Hassan', containerCount: 6 },
];

export const MOCK_CONTAINERS = [
  // Fès - Médina (region 1) - autour de Bab Boujloud
  { id: 1, latitude: 34.0633, longitude: -4.9823, fillLevel: 25, region: 1, lastUpdate: '2026-02-25T08:30:00Z' },
  { id: 2, latitude: 34.0645, longitude: -4.9780, fillLevel: 68, region: 1, lastUpdate: '2026-02-25T09:15:00Z' },
  { id: 3, latitude: 34.0620, longitude: -4.9850, fillLevel: 82, region: 1, lastUpdate: '2026-02-25T07:45:00Z' },
  { id: 4, latitude: 34.0660, longitude: -4.9760, fillLevel: 95, region: 1, lastUpdate: '2026-02-25T10:00:00Z' },
  { id: 5, latitude: 34.0610, longitude: -4.9810, fillLevel: 42, region: 1, lastUpdate: '2026-02-25T08:00:00Z' },
  { id: 6, latitude: 34.0655, longitude: -4.9840, fillLevel: 15, region: 1, lastUpdate: '2026-02-25T09:30:00Z' },
  { id: 7, latitude: 34.0628, longitude: -4.9795, fillLevel: 73, region: 1, lastUpdate: '2026-02-25T06:20:00Z' },
  { id: 8, latitude: 34.0640, longitude: -4.9770, fillLevel: 91, region: 1, lastUpdate: '2026-02-25T10:10:00Z' },

  // Fès - Ville Nouvelle (region 2) - autour de Avenue Hassan II
  { id: 9,  latitude: 34.0370, longitude: -5.0050, fillLevel: 35, region: 2, lastUpdate: '2026-02-25T08:00:00Z' },
  { id: 10, latitude: 34.0385, longitude: -5.0020, fillLevel: 58, region: 2, lastUpdate: '2026-02-25T09:00:00Z' },
  { id: 11, latitude: 34.0355, longitude: -5.0080, fillLevel: 77, region: 2, lastUpdate: '2026-02-25T07:30:00Z' },
  { id: 12, latitude: 34.0400, longitude: -5.0000, fillLevel: 92, region: 2, lastUpdate: '2026-02-25T10:05:00Z' },
  { id: 13, latitude: 34.0345, longitude: -5.0060, fillLevel: 12, region: 2, lastUpdate: '2026-02-25T08:45:00Z' },
  { id: 14, latitude: 34.0390, longitude: -5.0035, fillLevel: 64, region: 2, lastUpdate: '2026-02-25T09:50:00Z' },

  // Meknès - Centre (region 3) - autour de Place El Hedim
  { id: 15, latitude: 33.8935, longitude: -5.5545, fillLevel: 45, region: 3, lastUpdate: '2026-02-25T07:00:00Z' },
  { id: 16, latitude: 33.8950, longitude: -5.5520, fillLevel: 88, region: 3, lastUpdate: '2026-02-25T09:20:00Z' },
  { id: 17, latitude: 33.8920, longitude: -5.5570, fillLevel: 30, region: 3, lastUpdate: '2026-02-25T08:10:00Z' },
  { id: 18, latitude: 33.8960, longitude: -5.5500, fillLevel: 71, region: 3, lastUpdate: '2026-02-25T06:50:00Z' },
  { id: 19, latitude: 33.8940, longitude: -5.5535, fillLevel: 55, region: 3, lastUpdate: '2026-02-25T10:15:00Z' },
  { id: 20, latitude: 33.8910, longitude: -5.5560, fillLevel: 20, region: 3, lastUpdate: '2026-02-25T08:30:00Z' },
  { id: 21, latitude: 33.8970, longitude: -5.5510, fillLevel: 96, region: 3, lastUpdate: '2026-02-25T10:20:00Z' },

  // Casablanca - Maârif (region 4) - autour du Twin Center
  { id: 22, latitude: 33.5880, longitude: -7.6320, fillLevel: 20, region: 4, lastUpdate: '2026-02-25T08:30:00Z' },
  { id: 23, latitude: 33.5895, longitude: -7.6290, fillLevel: 50, region: 4, lastUpdate: '2026-02-25T09:00:00Z' },
  { id: 24, latitude: 33.5870, longitude: -7.6350, fillLevel: 85, region: 4, lastUpdate: '2026-02-25T07:15:00Z' },
  { id: 25, latitude: 33.5905, longitude: -7.6270, fillLevel: 97, region: 4, lastUpdate: '2026-02-25T10:20:00Z' },
  { id: 26, latitude: 33.5860, longitude: -7.6340, fillLevel: 38, region: 4, lastUpdate: '2026-02-25T08:50:00Z' },
  { id: 27, latitude: 33.5910, longitude: -7.6300, fillLevel: 62, region: 4, lastUpdate: '2026-02-25T09:40:00Z' },
  { id: 28, latitude: 33.5885, longitude: -7.6310, fillLevel: 10, region: 4, lastUpdate: '2026-02-25T06:30:00Z' },
  { id: 29, latitude: 33.5900, longitude: -7.6280, fillLevel: 74, region: 4, lastUpdate: '2026-02-25T10:00:00Z' },

  // Casablanca - Aïn Diab (region 5) - corniche
  { id: 30, latitude: 33.5930, longitude: -7.6700, fillLevel: 48, region: 5, lastUpdate: '2026-02-25T07:45:00Z' },
  { id: 31, latitude: 33.5945, longitude: -7.6670, fillLevel: 76, region: 5, lastUpdate: '2026-02-25T09:10:00Z' },
  { id: 32, latitude: 33.5920, longitude: -7.6730, fillLevel: 33, region: 5, lastUpdate: '2026-02-25T08:20:00Z' },
  { id: 33, latitude: 33.5955, longitude: -7.6650, fillLevel: 93, region: 5, lastUpdate: '2026-02-25T10:30:00Z' },
  { id: 34, latitude: 33.5935, longitude: -7.6690, fillLevel: 18, region: 5, lastUpdate: '2026-02-25T08:00:00Z' },

  // Rabat - Agdal (region 6) - autour de l'Avenue de France
  { id: 35, latitude: 33.9920, longitude: -6.8560, fillLevel: 22, region: 6, lastUpdate: '2026-02-25T08:00:00Z' },
  { id: 36, latitude: 33.9935, longitude: -6.8530, fillLevel: 60, region: 6, lastUpdate: '2026-02-25T09:30:00Z' },
  { id: 37, latitude: 33.9910, longitude: -6.8590, fillLevel: 85, region: 6, lastUpdate: '2026-02-25T07:00:00Z' },
  { id: 38, latitude: 33.9945, longitude: -6.8510, fillLevel: 40, region: 6, lastUpdate: '2026-02-25T10:00:00Z' },
  { id: 39, latitude: 33.9900, longitude: -6.8570, fillLevel: 72, region: 6, lastUpdate: '2026-02-25T06:45:00Z' },
  { id: 40, latitude: 33.9950, longitude: -6.8540, fillLevel: 96, region: 6, lastUpdate: '2026-02-25T10:25:00Z' },
  { id: 41, latitude: 33.9925, longitude: -6.8550, fillLevel: 55, region: 6, lastUpdate: '2026-02-25T09:00:00Z' },

  // Rabat - Hassan (region 7) - autour de la Tour Hassan
  { id: 42, latitude: 34.0240, longitude: -6.8230, fillLevel: 28, region: 7, lastUpdate: '2026-02-25T08:15:00Z' },
  { id: 43, latitude: 34.0255, longitude: -6.8200, fillLevel: 65, region: 7, lastUpdate: '2026-02-25T09:20:00Z' },
  { id: 44, latitude: 34.0230, longitude: -6.8260, fillLevel: 80, region: 7, lastUpdate: '2026-02-25T07:30:00Z' },
  { id: 45, latitude: 34.0265, longitude: -6.8180, fillLevel: 94, region: 7, lastUpdate: '2026-02-25T10:10:00Z' },
  { id: 46, latitude: 34.0220, longitude: -6.8245, fillLevel: 15, region: 7, lastUpdate: '2026-02-25T08:40:00Z' },
  { id: 47, latitude: 34.0260, longitude: -6.8210, fillLevel: 52, region: 7, lastUpdate: '2026-02-25T09:50:00Z' },
];

export const MOCK_DAILY_STATS = {
  totalCollections: 32,
  averageFillLevel: 55.8,
  fullContainers: 8,
  activeContainers: 47,
};

export function getMockRegionStats(regionId) {
  const regionContainers = MOCK_CONTAINERS.filter((c) => c.region === regionId);
  const avgFill =
    regionContainers.reduce((sum, c) => sum + c.fillLevel, 0) / regionContainers.length;
  const fullCount = regionContainers.filter((c) => c.fillLevel >= 90).length;

  return {
    totalContainers: regionContainers.length,
    averageFillLevel: avgFill,
    collectionsToday: Math.floor(Math.random() * 8) + 2,
    alerts: fullCount,
  };
}
