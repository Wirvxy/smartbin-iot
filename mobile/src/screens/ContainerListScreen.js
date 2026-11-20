import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import { useRegion } from '../context/RegionContext';
import { useLocation } from '../context/LocationContext';
import { getContainersByRegion, getAllContainers } from '../api/containerService';
import { formatDistance, getRecommendedContainers, directionsUrl } from '../utils/helpers';
import { C, F, R, STATE, fillState } from '../theme';
import { Button, Panel } from '../components/ui';
import BinGauge from '../components/BinGauge';

/**
 * Bins near you, best recommendation first (emptiest and closest; full bins last).
 * The first bin with room is shown big, with a button to get there.
 */
export default function ContainerListScreen({ navigation }) {
  const { selectedRegion } = useRegion();
  const { location, simulated } = useLocation();
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      let data = selectedRegion ? await getContainersByRegion(selectedRegion.id) : await getAllContainers();
      if (location) data = getRecommendedContainers(data, location.latitude, location.longitude);
      setContainers(data);
      setFailed(false);
    } catch (e) {
      setFailed(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedRegion, location]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.ink} /></View>;
  }

  const best = containers.find((c) => fillState(c.fillLevel, c.threshold ?? 80) !== 'full' && c.status !== 'MAINTENANCE');
  const rest = containers.filter((c) => c !== best);

  const header = (
    <View>
      <View style={styles.where}>
        <View style={{ flex: 1 }}>
          <Text style={styles.whereLabel}>Quartier</Text>
          <Text style={styles.whereName}>{selectedRegion?.name ?? 'Toute la ville'}</Text>
        </View>
        <Button title="Changer" variant="ghost" small onPress={() => navigation.navigate('RegionSelect')} />
      </View>

      {failed && (
        <Panel style={{ marginBottom: 16, backgroundColor: C.fullSoft, borderColor: C.fullSoft }}>
          <Text style={[styles.body, { color: C.fullInk }]}>Impossible de charger les bacs. Tirez vers le bas pour réessayer.</Text>
        </Panel>
      )}

      {best ? (
        <Panel style={styles.hero}>
          <Text style={styles.heroLabel}>{location ? 'Le plus proche avec de la place' : 'Un bac avec de la place'}</Text>
          <View style={styles.heroRow}>
            <BinGauge fill={best.fillLevel} threshold={best.threshold ?? 80} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{best.name}</Text>
              <Text style={styles.small}>{best.address}</Text>
              {best.distance != null && (
                <Text style={styles.heroDistance}>{formatDistance(best.distance)}{simulated ? ' depuis le centre de Fès' : ' à pied'}</Text>
              )}
            </View>
          </View>
          <View style={styles.heroActions}>
            <Button title="Itinéraire" onPress={() => Linking.openURL(directionsUrl(best))} style={{ flex: 1 }} />
            <Button title="Détails" variant="ghost" onPress={() => navigation.navigate('ContainerDetail', { container: best })} style={{ flex: 1 }} />
          </View>
        </Panel>
      ) : (!failed && (
        <Panel style={styles.hero}>
          <Text style={styles.heroName}>Tous les bacs du quartier sont pleins.</Text>
          <Text style={[styles.small, { marginTop: 4 }]}>Essayez un autre quartier, ou revenez après la prochaine collecte.</Text>
        </Panel>
      ))}

      {rest.length > 0 && (
        <Text style={styles.sectionTitle}>
          {location ? 'Autres bacs, du plus pratique au moins pratique' : 'Autres bacs'}
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={rest}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={header}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.ink} colors={[C.ink]} />}
      renderItem={({ item, index }) => {
        const state = fillState(item.fillLevel, item.threshold ?? 80);
        return (
          <Pressable
            onPress={() => navigation.navigate('ContainerDetail', { container: item })}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, rempli à ${item.fillLevel} %`}
            style={({ pressed }) => [
              styles.row,
              index === 0 && styles.rowFirst,
              index === rest.length - 1 && styles.rowLast,
              pressed && { backgroundColor: C.surface2 },
            ]}
          >
            <BinGauge fill={item.fillLevel} threshold={item.threshold ?? 80} size={22} showPct={false} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.small}>
                {item.code}
                {item.distance != null ? `, ${formatDistance(item.distance)}` : ''}
                {item.status === 'MAINTENANCE' ? ', en maintenance' : ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rowPct, { color: state === 'full' ? STATE.full.ink : C.ink }]}>{item.fillLevel}%</Text>
              <Text style={[styles.rowState, { color: STATE[state].ink }]}>{STATE[state].label}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  body: { fontFamily: F.regular, fontSize: 15, lineHeight: 21, color: C.ink },
  small: { fontFamily: F.regular, fontSize: 14, lineHeight: 20, color: C.muted },
  where: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  whereLabel: { fontFamily: F.regular, fontSize: 14, color: C.muted },
  whereName: { fontFamily: F.display, fontSize: 28, color: C.ink },
  hero: { marginBottom: 24 },
  heroLabel: { fontFamily: F.medium, fontSize: 15, color: C.ok, marginBottom: 14 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 18 },
  heroName: { fontFamily: F.display, fontSize: 26, lineHeight: 29, color: C.ink },
  heroDistance: { fontFamily: F.semibold, fontSize: 16, color: C.ink, marginTop: 8 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  sectionTitle: { fontFamily: F.medium, fontSize: 15, color: C.muted, marginBottom: 8, paddingHorizontal: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: C.surface, borderColor: C.line, borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1,
  },
  rowFirst: { borderTopLeftRadius: R.panel, borderTopRightRadius: R.panel },
  rowLast: { borderBottomWidth: 1, borderBottomLeftRadius: R.panel, borderBottomRightRadius: R.panel },
  rowName: { fontFamily: F.semibold, fontSize: 16, color: C.ink },
  rowPct: { fontFamily: F.display, fontSize: 22, fontVariant: ['tabular-nums'] },
  rowState: { fontFamily: F.medium, fontSize: 12 },
});
