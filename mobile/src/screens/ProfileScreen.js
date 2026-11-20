import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useLocation } from '../context/LocationContext';
import { DEMO_MODE } from '../utils/constants';
import { C, F, R } from '../theme';
import { Button } from '../components/ui';

const ROLES = { admin: 'Administrateur', ADMIN: 'Administrateur', manager: 'Gestionnaire', MANAGER: 'Gestionnaire', EMPLOYEE: 'Agent', agent: 'Agent' };

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { selectedRegion } = useRegion();
  const { simulated, refreshLocation } = useLocation();

  function handleLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Se déconnecter de SmartBin ?')) logout();
      return;
    }
    Alert.alert('Se déconnecter', 'Se déconnecter de SmartBin ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.person}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.small}>{[user?.email, ROLES[user?.role]].filter(Boolean).join(', ')}</Text>
        </View>
      </View>

      <View style={styles.list}>
        <Row label="Quartier" value={selectedRegion?.name ?? 'Toute la ville'} onPress={() => navigation.navigate('RegionSelect')} />
        <Row label="Position" value={simulated ? 'Simulée, centre de Fès' : 'GPS du téléphone'} onPress={refreshLocation} action="Actualiser" />
        <Row label="Données" value={DEMO_MODE ? 'Démo, 10 bacs fictifs à Fès' : 'Serveur SmartBin en direct'} />
        <Row label="Version" value="1.1.0" last />
      </View>

      <Button title="Se déconnecter" variant="ghost" onPress={handleLogout} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

function Row({ label, value, onPress, action, last }) {
  const content = (
    <>
      <View style={{ flex: 1 }}>
        <Text style={styles.small}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {onPress && <Text style={styles.action}>{action || 'Changer'}</Text>}
    </>
  );
  const style = [styles.row, !last && styles.rowBorder];
  return onPress
    ? <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [...style, pressed && { backgroundColor: C.surface2 }]}>{content}</Pressable>
    : <View style={style}>{content}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  person: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, paddingHorizontal: 4 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: F.display, fontSize: 26, color: C.white },
  name: { fontFamily: F.display, fontSize: 26, color: C.ink },
  small: { fontFamily: F.regular, fontSize: 14, color: C.muted },
  list: { backgroundColor: C.surface, borderRadius: R.panel, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  value: { fontFamily: F.medium, fontSize: 16, color: C.ink, marginTop: 2 },
  action: { fontFamily: F.medium, fontSize: 15, color: C.ink, textDecorationLine: 'underline' },
});
