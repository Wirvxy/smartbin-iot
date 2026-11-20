import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, RefreshControl } from 'react-native';
import { getContainerStatus } from '../api/containerService';
import { useLocation } from '../context/LocationContext';
import { formatDistance, haversineDistance, formatAgo, directionsUrl } from '../utils/helpers';
import { C, F, R } from '../theme';
import { Button, Panel, StatePill } from '../components/ui';
import BinGauge from '../components/BinGauge';

export default function ContainerDetailScreen({ route, navigation }) {
  const { container: initial } = route.params;
  const { location, simulated } = useLocation();
  const [container, setContainer] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: initial.code || 'Conteneur' });
    refresh();
  }, []);

  async function refresh() {
    try {
      const status = await getContainerStatus(initial.id);
      setContainer((prev) => ({ ...prev, ...status }));
    } catch (e) {
      // keep showing the last known values
    } finally {
      setRefreshing(false);
    }
  }

  const threshold = container.threshold ?? 80;
  const distance = location && container.latitude != null
    ? haversineDistance(location.latitude, location.longitude, container.latitude, container.longitude)
    : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} tintColor={C.ink} colors={[C.ink]} />}
    >
      <Text style={styles.name}>{container.name}</Text>
      <Text style={styles.address}>
        {container.address && container.region && !container.address.includes(container.region)
          ? `${container.address}, ${container.region}`
          : container.address || container.region}
      </Text>

      <Panel style={{ marginTop: 18 }}>
        <View style={styles.top}>
          <BinGauge fill={container.fillLevel} threshold={threshold} size={104} />
          <View style={{ flex: 1, gap: 14 }}>
            <StatePill fill={container.fillLevel} threshold={threshold} />
            {container.status === 'MAINTENANCE' && (
              <Text style={styles.warn}>Ce bac est en maintenance, il peut ne pas être vidé à temps.</Text>
            )}
            <Fact label="Seuil d'alerte" value={`${Math.round(threshold)} %`} />
            {distance != null && (
              <Fact label={simulated ? 'Depuis le centre de Fès' : 'Distance'} value={formatDistance(distance)} />
            )}
            <Fact label="Dernière mesure" value={formatAgo(container.lastUpdate)} text />
          </View>
        </View>
        <Text style={styles.note}>La ligne pointillée marque le seuil : au-delà, une équipe est prévenue pour le vider.</Text>
      </Panel>

      <View style={styles.actions}>
        <Button title="Itinéraire à pied" onPress={() => Linking.openURL(directionsUrl(container))} />
        <Button title="Voir sur la carte" variant="ghost" onPress={() => navigation.navigate('MainTabs', { screen: 'Carte', params: { focusId: container.id } })} />
      </View>

      <Text style={styles.coords}>
        {container.code}, GPS {container.latitude?.toFixed(5)}, {container.longitude?.toFixed(5)}
      </Text>
    </ScrollView>
  );
}

function Fact({ label, value, text }) {
  return (
    <View>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={text ? styles.factText : styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  name: { fontFamily: F.display, fontSize: 32, lineHeight: 35, color: C.ink, marginTop: 4 },
  address: { fontFamily: F.regular, fontSize: 15, color: C.muted, marginTop: 4 },
  top: { flexDirection: 'row', alignItems: 'flex-end', gap: 22 },
  warn: { fontFamily: F.regular, fontSize: 14, lineHeight: 19, color: C.soonInk },
  factLabel: { fontFamily: F.regular, fontSize: 13, color: C.muted },
  factValue: { fontFamily: F.display, fontSize: 22, color: C.ink, fontVariant: ['tabular-nums'] },
  factText: { fontFamily: F.medium, fontSize: 16, color: C.ink, marginTop: 2 },
  note: { fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: C.muted, marginTop: 18 },
  actions: { gap: 10, marginTop: 20 },
  coords: { fontFamily: F.regular, fontSize: 13, color: C.muted, marginTop: 20, textAlign: 'center' },
});
