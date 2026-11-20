import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllRegions } from '../api/regionService';
import { STORAGE_KEYS } from '../utils/constants';

const RegionContext = createContext(null);

export function RegionProvider({ children }) {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRegions();
  }, []);

  async function loadRegions() {
    try {
      const data = await getAllRegions();
      setRegions(data);

      // Restaurer la dernière région sélectionnée
      const lastRegionId = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REGION);
      if (lastRegionId) {
        const region = data.find((r) => r.id === lastRegionId || r.id === Number(lastRegionId));
        if (region) {
          setSelectedRegion(region);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des régions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function selectRegion(region) {
    setSelectedRegion(region);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_REGION, String(region.id));
  }

  return (
    <RegionContext.Provider value={{ regions, selectedRegion, selectRegion, isLoading }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion doit être utilisé dans un RegionProvider');
  }
  return context;
}
