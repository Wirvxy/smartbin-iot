import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { useRegion } from '../context/RegionContext';
import { useLocation } from '../context/LocationContext';
import { getContainersByRegion, getAllContainers } from '../api/containerService';
import { getFillColor, getFillLabel, formatDistance, haversineDistance } from '../utils/helpers';
import { COLORS } from '../utils/constants';

/**
 * Version Web de MapScreen
 * Utilise un iframe OpenStreetMap + liste des conteneurs
 * (react-native-maps ne fonctionne pas sur le web)
 */
export default function MapScreen({ navigation }) {
  const { selectedRegion } = useRegion();
  const { location } = useLocation();
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error('Erreur chargement conteneurs:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function openNavigation(container) {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${container.latitude},${container.longitude}`
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  // Centre de la carte (position utilisateur ou défaut Fès, Maroc)
  const centerLat = location?.latitude ?? 34.0331;
  const centerLon = location?.longitude ?? -5.0003;

  // Construire l'URL OpenStreetMap avec marqueurs
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLon - 0.05}%2C${centerLat - 0.05}%2C${centerLon + 0.05}%2C${centerLat + 0.05}&layer=mapnik&marker=${centerLat}%2C${centerLon}`;

  return (
    <ScrollView style={styles.container}>
      {/* Carte embarquée OpenStreetMap */}
      <View style={styles.mapContainer}>
        <iframe
          src={mapUrl}
          style={{ width: '100%', height: 350, border: 'none', borderRadius: 12 }}
          title="Carte des conteneurs"
        />
      </View>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fillLow }]} />
          <Text style={styles.legendText}>&lt; 70% Disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fillMedium }]} />
          <Text style={styles.legendText}>70-90% Presque plein</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fillHigh }]} />
          <Text style={styles.legendText}>&gt; 90% Plein</Text>
        </View>
      </View>

      {/* Liste des conteneurs sur la carte */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          Conteneurs ({containers.length})
        </Text>
        {containers.map((container) => {
          const color = getFillColor(container.fillLevel);
          const distance = location
            ? haversineDistance(
                location.latitude, location.longitude,
                container.latitude, container.longitude
              )
            : null;

          return (
            <TouchableOpacity
              key={String(container.id)}
              style={styles.card}
              onPress={() => openNavigation(container)}
            >
              <View style={[styles.colorBar, { backgroundColor: color }]} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{container.name || `Conteneur #${container.id}`}</Text>
                <View style={styles.cardRow}>
                  <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.badgeText, { color }]}>
                      {getFillLabel(container.fillLevel)} ({container.fillLevel}%)
                    </Text>
                  </View>
                  {distance != null && (
                    <Text style={styles.distanceText}>
                      📍 {formatDistance(distance)}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.navIcon}>🧭</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  mapContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text,
  },
  listSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  colorBar: {
    width: 6,
    height: '100%',
    minHeight: 60,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  navIcon: {
    fontSize: 20,
    paddingRight: 14,
  },
});
