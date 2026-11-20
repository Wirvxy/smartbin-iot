import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import useMapContainers from '../hooks/useMapContainers';
import { useLocation } from '../context/LocationContext';
import { FES_CENTER } from '../utils/constants';
import { directionsUrl } from '../utils/helpers';
import { C, F, R, STATE, fillState } from '../theme';

/**
 * Native map (Android / iOS), centred on Fès. Tap a bin, then its bubble, for walking directions.
 * The web build uses MapScreen.web.js (Leaflet) instead.
 */
export default function MapScreen({ route }) {
  const { containers, isLoading, failed, selectedRegion } = useMapContainers();
  const { location, simulated } = useLocation();
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const focusId = route?.params?.focusId;

  // Frame the bins once they're loaded, or zoom on the one we came from.
  useEffect(() => {
    if (!mapRef.current || containers.length === 0) return;
    const focused = containers.find((c) => c.id === focusId);
    if (focused) {
      mapRef.current.animateToRegion({ latitude: focused.latitude, longitude: focused.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 400);
      setTimeout(() => markerRefs.current[focused.id]?.showCallout(), 500);
      return;
    }
    mapRef.current.fitToCoordinates(
      containers.map((c) => ({ latitude: c.latitude, longitude: c.longitude })),
      { edgePadding: { top: 60, right: 40, bottom: 60, left: 40 }, animated: false },
    );
  }, [containers, focusId]);

  const due = containers.filter((c) => c.fillLevel >= (c.threshold ?? 80)).length;

  return (
    <View style={styles.screen}>
      <View style={styles.bar}>
        <Text style={styles.barTitle}>{selectedRegion?.name ?? 'Toute la ville'}</Text>
        <Text style={styles.barMeta}>
          {failed ? 'Impossible de charger les bacs.' : `${containers.length} bacs, ${due} à collecter`}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ ...FES_CENTER, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
          showsUserLocation={!simulated}
          showsMyLocationButton
        >
          {containers.map((c) => {
            const s = STATE[fillState(c.fillLevel, c.threshold ?? 80)];
            return (
              <Marker
                key={String(c.id)}
                ref={(r) => { markerRefs.current[c.id] = r; }}
                coordinate={{ latitude: c.latitude, longitude: c.longitude }}
                tracksViewChanges={false}
              >
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Callout onPress={() => Linking.openURL(directionsUrl(c))}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{c.name}</Text>
                    <Text style={[styles.calloutMeta, { color: s.ink }]}>{c.fillLevel} %, {s.label.toLowerCase()}</Text>
                    <Text style={styles.calloutLink}>Itinéraire à pied</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
          {simulated && location && (
            <Marker coordinate={location} title="Position simulée (démo)" tracksViewChanges={false}>
              <View style={styles.me} />
            </Marker>
          )}
        </MapView>
        {isLoading && (
          <View style={styles.loading}><ActivityIndicator color={C.ink} /></View>
        )}
      </View>

      <View style={styles.legend}>
        {['ok', 'soon', 'full'].map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATE[k].color }]} />
            <Text style={styles.legendText}>{STATE[k].label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  bar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line },
  barTitle: { fontFamily: F.display, fontSize: 22, color: C.ink },
  barMeta: { fontFamily: F.regular, fontSize: 14, color: C.muted },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.white },
  me: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.ink, borderWidth: 3, borderColor: C.white },
  callout: { minWidth: 160, padding: 4 },
  calloutTitle: { fontFamily: F.display, fontSize: 18, color: C.ink },
  calloutMeta: { fontFamily: F.medium, fontSize: 14, marginTop: 2 },
  calloutLink: { fontFamily: F.medium, fontSize: 14, color: C.ink, textDecorationLine: 'underline', marginTop: 6 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 10, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: F.medium, fontSize: 13, color: C.ink2 },
});
