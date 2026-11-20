import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getDailyStatistics, getRegionStatistics } from '../api/statisticsService';
import { useRegion } from '../context/RegionContext';
import { COLORS } from '../utils/constants';

export default function StatisticsScreen() {
  const { selectedRegion } = useRegion();
  const [dailyStats, setDailyStats] = useState(null);
  const [regionStats, setRegionStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [selectedRegion]);

  async function loadStatistics() {
    try {
      const daily = await getDailyStatistics();
      setDailyStats(daily);

      if (selectedRegion) {
        const region = await getRegionStatistics(selectedRegion.id);
        setRegionStats(region);
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadStatistics();
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>
          Statistiques {selectedRegion ? `- ${selectedRegion.name}` : 'globales'}
        </Text>
      </View>

      {/* Statistiques journalières */}
      {dailyStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Collectes"
              value={dailyStats.totalCollections ?? '--'}
              icon="🚛"
              color={COLORS.primary}
            />
            <StatCard
              label="Remplissage moyen"
              value={
                dailyStats.averageFillLevel != null
                  ? `${Math.round(dailyStats.averageFillLevel)}%`
                  : '--'
              }
              icon="📊"
              color={COLORS.secondary}
            />
            <StatCard
              label="Conteneurs pleins"
              value={dailyStats.fullContainers ?? '--'}
              icon="🔴"
              color={COLORS.error}
            />
            <StatCard
              label="Conteneurs actifs"
              value={dailyStats.activeContainers ?? '--'}
              icon="✅"
              color={COLORS.success}
            />
          </View>
        </View>
      )}

      {/* Statistiques par région */}
      {regionStats && selectedRegion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Statistiques - {selectedRegion.name}
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Conteneurs"
              value={regionStats.totalContainers ?? '--'}
              icon="🗑️"
              color={COLORS.primary}
            />
            <StatCard
              label="Remplissage moyen"
              value={
                regionStats.averageFillLevel != null
                  ? `${Math.round(regionStats.averageFillLevel)}%`
                  : '--'
              }
              icon="📈"
              color={COLORS.secondary}
            />
            <StatCard
              label="Collectes aujourd'hui"
              value={regionStats.collectionsToday ?? '--'}
              icon="📅"
              color={COLORS.warning}
            />
            <StatCard
              label="Alertes"
              value={regionStats.alerts ?? '--'}
              icon="⚠️"
              color={COLORS.error}
            />
          </View>
        </View>
      )}

      {/* Indicateur de remplissage global */}
      {dailyStats?.averageFillLevel != null && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau de remplissage global</Text>
          <View style={styles.globalGauge}>
            <View style={styles.gaugeBackground}>
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${dailyStats.averageFillLevel}%`,
                    backgroundColor:
                      dailyStats.averageFillLevel < 70
                        ? COLORS.fillLow
                        : dailyStats.averageFillLevel < 90
                        ? COLORS.fillMedium
                        : COLORS.fillHigh,
                  },
                ]}
              />
            </View>
            <Text style={styles.gaugeLabel}>
              {Math.round(dailyStats.averageFillLevel)}% en moyenne
            </Text>
          </View>
        </View>
      )}

      {!dailyStats && !regionStats && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Aucune statistique disponible</Text>
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  globalGauge: {
    alignItems: 'center',
  },
  gaugeBackground: {
    width: '100%',
    height: 20,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 10,
  },
  gaugeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
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
});
