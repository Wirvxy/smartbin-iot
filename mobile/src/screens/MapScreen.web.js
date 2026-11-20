import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useMapContainers from '../hooks/useMapContainers';
import { useLocation } from '../context/LocationContext';
import { FES_CENTER } from '../utils/constants';
import { directionsUrl } from '../utils/helpers';
import { C, F, STATE, fillState } from '../theme';

/**
 * Web version of the map (react-native-maps doesn't run in a browser): Leaflet, centred on Fès.
 * Light CARTO tiles, falling back to standard OpenStreetMap tiles if CARTO can't be reached.
 */
export default function MapScreen({ route, navigation }) {
  const { containers, isLoading, failed, selectedRegion } = useMapContainers();
  const { location, simulated } = useLocation();
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const markers = useRef(new Map());
  const focusId = route?.params?.focusId;

  // Create the map once.
  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, {
      maxBounds: L.latLngBounds([20.5, -17.6], [36.2, -0.9]), maxBoundsViscosity: 1,
      minZoom: 5, maxZoom: 19, zoomControl: true,
    }).setView([FES_CENTER.latitude, FES_CENTER.longitude], 13);
    addTiles(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    // The tab may have been hidden when the map was created: re-measure once visible.
    setTimeout(() => m.invalidateSize(), 50);
    return () => { m.remove(); map.current = null; };
  }, []);

  // Re-measure when the tab comes back into view.
  useEffect(() => navigation.addListener('focus', () => setTimeout(() => map.current?.invalidateSize(), 50)), [navigation]);

  // Draw the bins (and the user's position) whenever they change.
  useEffect(() => {
    const m = map.current;
    if (!m || !layer.current) return;
    layer.current.clearLayers();
    markers.current.clear();
    const pts = [];
    containers.forEach((c) => {
      if (c.latitude == null || c.longitude == null) return;
      const s = STATE[fillState(c.fillLevel, c.threshold ?? 80)];
      const marker = L.marker([c.latitude, c.longitude], {
        title: c.name,
        icon: L.divIcon({
          className: '', iconSize: [18, 18],
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${s.color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(23,32,27,.35)"></div>`,
        }),
      }).bindPopup(
        `<div style="font-family:Barlow_500Medium,system-ui,sans-serif;min-width:160px">
           <div style="font-family:BarlowCondensed_600SemiBold,system-ui;font-size:19px;color:${C.ink}">${esc(c.name)}</div>
           <div style="color:${s.ink};margin:2px 0 6px">${c.fillLevel} %, ${s.label.toLowerCase()}</div>
           <a href="${directionsUrl(c)}" target="_blank" rel="noopener" style="color:${C.ink}">Itinéraire à pied</a>
         </div>`
      );
      marker.addTo(layer.current);
      markers.current.set(c.id, marker);
      pts.push([c.latitude, c.longitude]);
    });
    if (location) {
      L.circleMarker([location.latitude, location.longitude], {
        radius: 7, color: '#ffffff', weight: 3, fillColor: C.ink, fillOpacity: 1,
      }).bindTooltip(simulated ? 'Position simulée (démo)' : 'Vous êtes ici').addTo(layer.current);
    }
    const focused = focusId != null && markers.current.get(focusId);
    if (focused) {
      m.setView(focused.getLatLng(), 16);
      focused.openPopup();
    } else if (pts.length > 1) {
      m.fitBounds(pts, { padding: [32, 32], maxZoom: 16 });
    } else if (pts.length === 1) {
      m.setView(pts[0], 16);
    }
  }, [containers, location, simulated, focusId]);

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
        <View ref={el} style={styles.map} accessibilityLabel="Carte des conteneurs" />
        {isLoading && (
          <View style={styles.loading}><ActivityIndicator color={C.ink} /></View>
        )}
      </View>
      <View style={styles.legend}>
        {['ok', 'soon', 'full'].map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: STATE[k].color }]} />
            <Text style={styles.legendText}>{STATE[k].label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function addTiles(m) {
  const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19,
  });
  let errors = 0, loaded = 0, switched = false;
  carto.on('tileload', () => { loaded++; });
  carto.on('tileerror', () => {
    errors++;
    if (switched || loaded > 0 || errors < 3) return;
    switched = true;
    m.removeLayer(carto);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(m);
  });
  carto.addTo(m);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  bar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line },
  barTitle: { fontFamily: F.display, fontSize: 22, color: C.ink },
  barMeta: { fontFamily: F.regular, fontSize: 14, color: C.muted },
  map: { flex: 1, backgroundColor: '#dfe4de' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 10, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: F.medium, fontSize: 13, color: C.ink2 },
});
