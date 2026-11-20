import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from '../utils/constants';

// Screens
import ContainerListScreen from '../screens/ContainerListScreen';
import MapScreen from '../screens/MapScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegionSelectScreen from '../screens/RegionSelectScreen';
import ContainerDetailScreen from '../screens/ContainerDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Conteneurs: focused ? '🗑️' : '🗑️',
    Carte: focused ? '🗺️' : '🗺️',
    Statistiques: focused ? '📊' : '📊',
    Profil: focused ? '👤' : '👤',
  };
  return <Text style={{ fontSize: 22 }}>{icons[label] || '•'}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGrey,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="Conteneurs"
        component={ContainerListScreen}
        options={{ title: 'Conteneurs' }}
      />
      <Tab.Screen
        name="Carte"
        component={MapScreen}
        options={{ title: 'Carte' }}
      />
      <Tab.Screen
        name="Statistiques"
        component={StatisticsScreen}
        options={{ title: 'Statistiques' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="RegionSelect"
        component={RegionSelectScreen}
        options={{ title: 'Sélection de région' }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContainerDetail"
        component={ContainerDetailScreen}
        options={{ title: 'Détails du conteneur' }}
      />
    </Stack.Navigator>
  );
}
