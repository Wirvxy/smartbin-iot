import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { DEMO_MODE, DEMO_LOCATION, FES_CENTER } from '../utils/constants';
import { haversineDistance } from '../utils/helpers';

const LocationContext = createContext(null);

/**
 * User position, used to sort bins by distance.
 * In demo mode, if the phone or browser gives no position (refused, or no GPS),
 * or the user is far from Fès (the demo bins are all in Fès), a fixed point in central Fès is
 * used so distances still make sense; `simulated` says so.
 */
export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [simulated, setSimulated] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestLocation();
  }, []);

  function fallback(message) {
    setErrorMsg(message);
    if (DEMO_MODE) {
      setLocation(DEMO_LOCATION);
      setSimulated(true);
    }
  }

  async function requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        fallback('Permission de localisation refusée');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const here = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      if (DEMO_MODE && haversineDistance(here.latitude, here.longitude, FES_CENTER.latitude, FES_CENTER.longitude) > 30) {
        fallback(null);
        return;
      }
      setLocation(here);
      setSimulated(false);
      setErrorMsg(null);
    } catch (error) {
      fallback('Impossible de récupérer la position');
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshLocation() {
    setIsLoading(true);
    await requestLocation();
  }

  return (
    <LocationContext.Provider value={{ location, simulated, errorMsg, isLoading, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation doit être utilisé dans un LocationProvider');
  }
  return context;
}
