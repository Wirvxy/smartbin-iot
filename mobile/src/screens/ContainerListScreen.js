import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRegion } from '../context/RegionContext';
import { useLocation } from '../context/LocationContext';
import { getContainersByRegion, getAllContainers } from '../api/containerService';
import { getFillColor, getFillLabel, formatDistance, getRecommendedContainers } from '../utils/helpers';
import { COLORS } from '../utils/constants';

export default function ContainerListScreen({ navigation }) {
  const { selectedRegion } = useRegion();
  const { location } = useLocation();
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContainers = useCallback(async () => {
    try {
      let data;
      if (selectedRegion) {
        data = await getContainersByRegion(selectedRegion.id);
      } else {
        data = await getAllContainers();
      }

      // Si on a la position, calculer les distances et trier par recommandation
      if (location) {
        data = getRecommendedContainers(data, location.latitude, location.longitude);
      }

      setContainers(data);
    } catch (error) {
      console.error('Erreur chargement conteneurs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedRegion, location]);

  useEffect(() => {
    loadContainers();
  }, [loadContainers]);

  function onRefresh() {
    setRefreshing(true);
    loadContainers();
  }

  function handleContainerPress(container) {
    navigation.navigate('ContainerDetail', { container });
  }

  function renderContainer({ item }) {
    const fillColor = getFillColor(item.fillLevel);
    const fillLabel = getFillLabel(item.fillLevel);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleContainerPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          {/* Barre de niveau de remplissage */}
          <View style={styles.fillBarContainer}>
            <View
              style={[
                styles.fillBar,
                { height: `${item.fillLevel}%`, backgroundColor: fillColor },
              ]}
            />
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.containerName}>
            {item.name || `Conteneur #${item.id}`}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: fillColor + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: fillColor }]} />
              <Text style={[styles.statusText, { color: fillColor }]}>
                {fillLabel}
              </Text>
            </View>
            <Text style={styles.fillPercent}>{item.fillLevel}%</Text>
          </View>

          {item.distance != null && (
            <Text style={styles.distance}>
              📍 {formatDistance(item.distance)}
            </Text>
          )}

          {item.score != null && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score recommandation:</Text>
              <Text style={styles.scoreValue}>{(item.score * 100).toFixed(0)}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des conteneurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedRegion && (
        <View style={styles.regionBanner}>
          <Text style={styles.regionBannerText}>
            Région: {selectedRegion.name}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegionSelect')}>
            <Text style={styles.changeRegion}>Changer</Text>
          </TouchableOpacity>
        </View>
      )}

      {containers.length > 0 && containers[0].score != null && (
        <View style={styles.recommendationBanner}>
          <Text style={styles.recommendationText}>
            ⭐ Conteneur recommandé: #{containers[0].id} ({formatDistance(containers[0].distance)}, {containers[0].fillLevel}% rempli)
          </Text>
        </View>
      )}

      <FlatList
        data={containers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderContainer}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗑️</Text>
            <Text style={styles.emptyText}>Aucun conteneur trouvé</Text>
            <Text style={styles.emptySubtext}>
              {selectedRegion
                ? 'Aucun conteneur dans cette région'
                : 'Sélectionnez une région pour commencer'}
            </Text>
          </View>
        }
      />
    </View>
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
  regionBanner: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  regionBannerText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  changeRegion: {
    color: COLORS.white,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  recommendationBanner: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  recommendationText: {
    fontSize: 13,
    color: '#F57F17',
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardLeft: {
    width: 40,
    padding: 8,
    justifyContent: 'flex-end',
  },
  fillBarContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fillBar: {
    borderRadius: 6,
    minHeight: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  containerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fillPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  distance: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
