import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRegion } from '../context/RegionContext';
import { useLocation } from '../context/LocationContext';
import { getContainersByRegion, getAllContainers } from '../api/containerService';
import { getFillColor, getFillLabel, formatDistance, haversineDistance } from '../utils/helpers';
import { COLORS } from '../utils/constants';

export default function MapScreen({ navigation }) {
  const { selectedRegion } = useRegion();
  const { location } = useLocation();
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    loadContainers();
  }, [selectedRegion]);

  async function loadContainers() {
    try {
      let data;
      if (selectedRegion) {
        data = await getContainersByRegion(selectedRegion.id);
      } else {
        data = await getAllContainers();
      }
      setContainers(data);

      // Ajuster la vue de la carte pour afficher tous les marqueurs
      if (data.length > 0 && mapRef.current) {
        const coords = data.map((c) => ({
          latitude: c.latitude,
          longitude: c.longitude,
        }));
        if (location) {
          coords.push(location);
        }
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      console.error('Erreur chargement conteneurs:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function openNavigation(container) {
    const url = Platform.select({
      ios: `maps:0,0?q=${container.latitude},${container.longitude}`,
      android: `google.navigation:q=${container.latitude},${container.longitude}`,
    });
    Linking.openURL(url).catch(() => {
      // Fallback vers Google Maps web
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${container.latitude},${container.longitude}`
      );
    });
  }

  function getMarkerColor(fillLevel) {
    return getFillColor(fillLevel);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        // Position par défaut (Fès, Maroc)
        latitude: 34.0331,
        longitude: -5.0003,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {containers.map((container) => {
          const color = getMarkerColor(container.fillLevel);
          const distance =
            location
              ? haversineDistance(
                  location.latitude,
                  location.longitude,
                  container.latitude,
                  container.longitude
                )
              : null;

          return (
            <Marker
              key={String(container.id)}
              coordinate={{
                latitude: container.latitude,
                longitude: container.longitude,
              }}
              pinColor={color}
            >
              <Callout onPress={() => openNavigation(container)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    Conteneur #{container.id}
                  </Text>
                  <View style={styles.calloutRow}>
                    <View
                      style={[styles.calloutDot, { backgroundColor: color }]}
                    />
                    <Text style={styles.calloutText}>
                      {getFillLabel(container.fillLevel)} ({container.fillLevel}%)
                    </Text>
                  </View>
                  {distance != null && (
                    <Text style={styles.calloutDistance}>
                      📍 {formatDistance(distance)}
                    </Text>
                  )}
                  <Text style={styles.calloutNav}>
                    Appuyez pour naviguer →
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fillLow }]} />
          <Text style={styles.legendText}>&lt; 70%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fillMedium }]} />
          <Text style={styles.legendText}>70-90%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fillHigh }]} />
          <Text style={styles.legendText}>&gt; 90%</Text>
        </View>
      </View>

      {/* Bouton de rafraîchissement */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => {
          setIsLoading(true);
          loadContainers();
        }}
      >
        <Text style={styles.refreshText}>↻</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  callout: {
    minWidth: 160,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  calloutDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  calloutText: {
    fontSize: 13,
    color: COLORS.text,
  },
  calloutDistance: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  calloutNav: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 6,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  refreshText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
