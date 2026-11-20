import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRegion } from '../context/RegionContext';
import { COLORS } from '../utils/constants';

export default function RegionSelectScreen({ navigation }) {
  const { regions, selectedRegion, selectRegion, isLoading } = useRegion();
  const [search, setSearch] = useState('');

  // Filtrer les régions selon la recherche
  const filteredRegions = useMemo(() => {
    if (!search.trim()) return regions;
    const query = search.toLowerCase();
    return regions.filter((region) =>
      region.name.toLowerCase().includes(query)
    );
  }, [regions, search]);

  function handleSelectRegion(region) {
    selectRegion(region);
    navigation.navigate('MainTabs');
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des régions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sélectionner une région</Text>
        <Text style={styles.subtitle}>
          Choisissez votre zone pour voir les conteneurs disponibles
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une région..."
          placeholderTextColor={COLORS.grey}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredRegions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.regionCard,
              selectedRegion?.id === item.id && styles.regionCardSelected,
            ]}
            onPress={() => handleSelectRegion(item)}
          >
            <View style={styles.regionInfo}>
              <Text
                style={[
                  styles.regionName,
                  selectedRegion?.id === item.id && styles.regionNameSelected,
                ]}
              >
                {item.name}
              </Text>
              {item.containerCount != null && (
                <Text style={styles.regionDetail}>
                  {item.containerCount} conteneur{item.containerCount > 1 ? 's' : ''}
                </Text>
              )}
            </View>
            {selectedRegion?.id === item.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune région trouvée</Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  regionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  regionCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  regionNameSelected: {
    color: COLORS.primary,
  },
  regionDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
