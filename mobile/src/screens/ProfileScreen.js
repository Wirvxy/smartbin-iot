import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { COLORS } from '../utils/constants';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { selectedRegion } = useRegion();

  function handleLogout() {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Profil utilisateur */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      {/* Paramètres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('RegionSelect')}
        >
          <Text style={styles.menuIcon}>📍</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Région actuelle</Text>
            <Text style={styles.menuValue}>
              {selectedRegion?.name || 'Non sélectionnée'}
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Informations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>

        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Version</Text>
            <Text style={styles.menuValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>♻️</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Application</Text>
            <Text style={styles.menuValue}>SmartWaste - Gestion IoT</Text>
          </View>
        </View>
      </View>

      {/* Déconnexion */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileCard: {
    backgroundColor: COLORS.primary,
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.grey,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
