import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { getContainerStatus } from '../api/containerService';
import { useLocation } from '../context/LocationContext';
import { useRegion } from '../context/RegionContext';
import { getFillColor, getFillLabel, formatDistance, haversineDistance, formatDate } from '../utils/helpers';
import { COLORS } from '../utils/constants';

export default function ContainerDetailScreen({ route }) {
  const { regions } = useRegion();
  const { container: initialContainer } = route.params;
  const { location } = useLocation();
  const [container, setContainer] = useState(initialContainer);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, []);

  async function refreshStatus() {
    setIsLoading(true);
    try {
      const status = await getContainerStatus(initialContainer.id);
      setContainer((prev) => ({ ...prev, ...status }));
    } catch (error) {
      console.error('Erreur statut conteneur:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function openNavigation() {
    const url = Platform.select({
      ios: `maps:0,0?q=${container.latitude},${container.longitude}`,
      android: `google.navigation:q=${container.latitude},${container.longitude}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${container.latitude},${container.longitude}`
      );
    });
  }

  const fillColor = getFillColor(container.fillLevel);
  const fillLabel = getFillLabel(container.fillLevel);
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
    <ScrollView style={styles.container}>
      {/* En-tête avec jauge de remplissage */}
      <View style={styles.header}>
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeBackground}>
            <View
              style={[
                styles.gaugeFill,
                {
                  width: `${container.fillLevel}%`,
                  backgroundColor: fillColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.gaugeText, { color: fillColor }]}>
            {container.fillLevel}%
          </Text>
        </View>
        <Text style={styles.headerTitle}>{container.name || `Conteneur #${container.id}`}</Text>
        <View style={[styles.statusBadge, { backgroundColor: fillColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: fillColor }]} />
          <Text style={[styles.statusText, { color: fillColor }]}>
            {fillLabel}
          </Text>
        </View>
      </View>

      {/* Informations */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informations</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Niveau de remplissage</Text>
          <Text style={[styles.infoValue, { color: fillColor }]}>
            {container.fillLevel}%
          </Text>
        </View>

        {distance != null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{formatDistance(distance)}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Coordonnées</Text>
          <Text style={styles.infoValue}>
            {container.latitude?.toFixed(4)}, {container.longitude?.toFixed(4)}
          </Text>
        </View>

        {container.region && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Région</Text>
            <Text style={styles.infoValue}>
              {typeof container.region === 'object'
                ? container.region.name
                : regions.find((r) => String(r.id) === String(container.region))?.name ?? container.region}
            </Text>
          </View>
        )}

        {container.lastUpdate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dernière mise à jour</Text>
            <Text style={styles.infoValue}>
              {formatDate(container.lastUpdate)}
            </Text>
          </View>
        )}

        {container.score != null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Score de recommandation</Text>
            <Text style={[styles.infoValue, { color: COLORS.primary }]}>
              {(container.score * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.navButton} onPress={openNavigation}>
          <Text style={styles.navButtonText}>🧭 Naviguer vers ce conteneur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshStatus}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.refreshButtonText}>↻ Rafraîchir le statut</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gaugeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  gaugeBackground: {
    width: '100%',
    height: 16,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 8,
  },
  gaugeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  navButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  navButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
