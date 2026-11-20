import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRegion } from '../context/RegionContext';
import { getAllContainers } from '../api/containerService';
import { C, F, R } from '../theme';
import BinGauge from '../components/BinGauge';

/**
 * District picker. Each row shows the district's bins as small gauges,
 * so you can see at a glance where there is still room.
 */
export default function RegionSelectScreen({ navigation }) {
  const { regions, selectedRegion, selectRegion, isLoading } = useRegion();
  const [containers, setContainers] = useState([]);

  useEffect(() => {
    getAllContainers().then(setContainers).catch(() => setContainers([]));
  }, []);

  async function choose(region) {
    await selectRegion(region);
    navigation.navigate('MainTabs', { screen: 'Bacs' });
  }

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={C.ink} /></View>;
  }

  const rows = [{ id: null, name: 'Toute la ville', all: true }, ...regions];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.intro}>Choisissez où vous êtes. Vous pourrez changer de quartier à tout moment.</Text>
      <View style={styles.list}>
        {rows.map((r, i) => {
          const bins = r.all ? containers : containers.filter((c) => c.region === r.id || c.region === r.name);
          const due = bins.filter((c) => c.fillLevel >= (c.threshold ?? 80)).length;
          const count = r.all ? containers.length : (r.containerCount ?? bins.length);
          const active = r.all ? !selectedRegion : selectedRegion?.id === r.id;
          return (
            <Pressable
              key={String(r.id)}
              onPress={() => choose(r.all ? null : r)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { backgroundColor: C.surface2 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={styles.meta}>
                  {count} bac{count > 1 ? 's' : ''}
                  {due > 0 ? `, ${due} à collecter` : ''}
                  {active ? ', sélectionné' : ''}
                </Text>
              </View>
              <View style={styles.minis} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                {bins.slice(0, 6).map((c) => (
                  <BinGauge key={c.id} fill={c.fillLevel} threshold={c.threshold ?? 80} size={14} showPct={false} />
                ))}
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  intro: { fontFamily: F.regular, fontSize: 16, lineHeight: 23, color: C.ink2, marginBottom: 16, paddingHorizontal: 4 },
  list: { backgroundColor: C.surface, borderRadius: R.panel, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.line },
  name: { fontFamily: F.display, fontSize: 22, color: C.ink },
  meta: { fontFamily: F.regular, fontSize: 14, color: C.muted, marginTop: 2 },
  minis: { flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  chevron: { fontFamily: F.regular, fontSize: 26, color: C.muted, marginLeft: 4 },
});
