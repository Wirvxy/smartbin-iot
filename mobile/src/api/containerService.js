import apiClient from './client';
import { DEMO_MODE } from '../utils/constants';
import { MOCK_CONTAINERS } from './mockData';

/**
 * Convertit un ContainerDTO du backend vers le format utilisé par les écrans.
 */
export function toAppContainer(dto) {
  return {
    id: dto.id,
    code: dto.containerId,
    name: dto.name,
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    fillLevel: Math.round(dto.fillPercentage ?? 0),
    threshold: dto.alertThreshold ?? 80,
    region: dto.region,
    status: dto.status,
    lastUpdate: dto.lastUpdate,
  };
}

/**
 * GET /api/mobile/containers
 */
export async function getAllContainers() {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...MOCK_CONTAINERS];
  }
  const response = await apiClient.get('/mobile/containers');
  return response.data.map(toAppContainer);
}

/**
 * GET /api/mobile/containers/:id
 */
export async function getContainerStatus(containerId) {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const container = MOCK_CONTAINERS.find((c) => c.id === containerId);
    if (container) {
      return { ...container };
    }
    throw new Error('Conteneur non trouvé');
  }
  const response = await apiClient.get(`/mobile/containers/${containerId}`);
  return toAppContainer(response.data);
}

/**
 * GET /api/mobile/containers/region/:region
 */
export async function getContainersByRegion(regionId) {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_CONTAINERS.filter((c) => c.region === regionId);
  }
  const response = await apiClient.get(`/mobile/containers/region/${encodeURIComponent(regionId)}`);
  return response.data.map(toAppContainer);
}
