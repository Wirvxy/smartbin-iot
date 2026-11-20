import apiClient from './client';
import { DEMO_MODE } from '../utils/constants';
import { MOCK_DAILY_STATS, getMockRegionStats } from './mockData';

/**
 * GET /api/statistics/daily
 * Récupère les statistiques journalières
 */
export async function getDailyStatistics() {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ...MOCK_DAILY_STATS };
  }
  const response = await apiClient.get('/mobile/statistics/daily');
  return response.data;
}

/**
 * GET /api/statistics/region/:id
 * Récupère les statistiques d'une région
 */
export async function getRegionStatistics(regionId) {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getMockRegionStats(regionId);
  }
  const response = await apiClient.get(`/mobile/statistics/region/${encodeURIComponent(regionId)}`);
  return response.data;
}
