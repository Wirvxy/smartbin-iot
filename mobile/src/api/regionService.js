import apiClient from './client';
import { DEMO_MODE } from '../utils/constants';
import { MOCK_REGIONS } from './mockData';

/**
 * GET /api/mobile/regions
 * Récupère la liste de toutes les régions
 */
export async function getAllRegions() {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...MOCK_REGIONS];
  }
  const response = await apiClient.get('/mobile/regions');
  return response.data;
}
