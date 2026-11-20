import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { getDailyStatistics, getRegionStatistics } from '../api/statisticsService';
import { getAllContainers, getContainersByRegion } from '../api/containerService';
import { useRegion } from '../context/RegionContext';
import { C, F, R } from '../theme';
import { Panel } from '../components/ui';
import BinGauge from '../components/BinGauge';

/**
 * The district at a glance: every bin as a gauge (fullest first, like the web dashboard),
 * then the day's figures for the district and for the whole city.
 */
export default function StatisticsScreen({ navigation }) {
  const { selectedRegion } = useRegion();
  const [daily, setDaily] = useState(null);
  const [regionStats, setRegionStats] = useState(null);
  const [bins, setBins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, list] = await Promise.all([
        getDailyStatistics(),
        selectedRegion ? getContainersByRegion(selectedRegion.id) : getAllContainers(),
      ]);
      setDaily(d);
      setBins([...list].sort((a, b) => b.fillLevel - a.fillLevel));
      setRegionStats(selectedRegion ? await getRegionStatistics(selectedRegion.id) : null);
    } catch (e) {
      // keep the last values on screen
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedRegion]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.ink} /></View>;
  }

  const due = bins.filter((c) => c.fillLevel >= (c.threshold ?? 80)).length;
  const place = selectedRegion?.name ?? 'Fès';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.ink} colors={[C.ink]} />}
    >
      <Text style={styles.headline}>
        {due === 0 ? `Aucun bac à collecter à ${place}.` : `${due} bac${due > 1 ? 's' : ''} à collecter à ${place}.`}
      </Text>
      <Text style={styles.lede}>Chaque bac est dessiné à son niveau actuel. La ligne pointillée marque son seuil d'alerte.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wall}>
        {bins.map((c) => (
          <Pressable key={c.id} onPress={() => navigation.navigate('ContainerDetail', { container: c })}
                     accessibilityRole="button" accessibilityLabel={`${c.name}, rempli à ${c.fillLevel} %`}
                     style={{ alignItems: 'center', width: 70 }}>
            <BinGauge fill={c.fillLevel} threshold={c.threshold ?? 80} size={56} />
            <Text style={styles.binCode}>{c.code}</Text>
            <Text style={styles.binName} numberOfLines={1}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {regionStats && (
        <Panel style={{ marginTop: 20 }}>
          <Text style={styles.panelTitle}>{selectedRegion.name}</Text>
          <View style={styles.grid}>
            <Figure value={regionStats.totalContainers} label="bacs suivis" />
            <Figure value={`${Math.round(regionStats.averageFillLevel ?? 0)} %`} label="remplissage moyen" />
            <Figure value={regionStats.alerts ?? 0} label="au-dessus du seuil" tone={regionStats.alerts ? C.fullInk : undefined} />
            <Figure value={regionStats.collectionsToday ?? 0} label="collectes aujourd'hui" />
          </View>
        </Panel>
      )}

      {daily && (
        <Panel style={{ marginTop: 16 }}>
          <Text style={styles.panelTitle}>Toute la ville</Text>
          <View style={styles.grid}>
            <Figure value={`${Math.round(daily.averageFillLevel ?? 0)} %`} label="remplissage moyen" />
            <Figure value={daily.fullContainers ?? 0} label="à collecter" tone={daily.fullContainers ? C.fullInk : undefined} />
            <Figure value={daily.activeContainers ?? 0} label="bacs en service" />
            <Figure value={daily.totalCollections ?? 0} label="collectes aujourd'hui" />
          </View>
        </Panel>
      )}
    </ScrollView>
  );
}

function Figure({ value, label, tone }) {
  return (
    <View style={styles.figure}>
      <Text style={[styles.figureValue, tone && { color: tone }]}>{value}</Text>
      <Text style={styles.figureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  headline: { fontFamily: F.display, fontSize: 32, lineHeight: 35, color: C.ink },
  lede: { fontFamily: F.regular, fontSize: 15, lineHeight: 21, color: C.ink2, marginTop: 8 },
  wall: { gap: 10, paddingVertical: 20, paddingRight: 8, alignItems: 'flex-end' },
  binCode: { fontFamily: F.display, fontSize: 14, color: C.ink, marginTop: 8 },
  binName: { fontFamily: F.regular, fontSize: 12, color: C.muted, maxWidth: 70 },
  panelTitle: { fontFamily: F.display, fontSize: 22, color: C.ink, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  figure: { width: '50%', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, paddingRight: 12 },
  figureValue: { fontFamily: F.display, fontSize: 28, color: C.ink, fontVariant: ['tabular-nums'] },
  figureLabel: { fontFamily: F.regular, fontSize: 14, color: C.muted },
});
