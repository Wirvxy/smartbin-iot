import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { C, F } from '../theme';
import { TabIcon } from '../components/ui';

import ContainerListScreen from '../screens/ContainerListScreen';
import MapScreen from '../screens/MapScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegionSelectScreen from '../screens/RegionSelectScreen';
import ContainerDetailScreen from '../screens/ContainerDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Ink header, like the dashboard's top bar.
const header = {
  headerStyle: { backgroundColor: C.ink },
  headerTintColor: C.white,
  headerTitleStyle: { fontFamily: F.display, fontSize: 22 },
  headerShadowVisible: false,
};

const TAB_ICONS = { Bacs: 'bins', Carte: 'map', Statistiques: 'stats', Profil: 'profile' };

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...header,
        tabBarIcon: ({ color }) => <TabIcon name={TAB_ICONS[route.name]} color={color} />,
        tabBarActiveTintColor: C.ink,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopWidth: 1,
          borderTopColor: C.line,
          height: 68,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontFamily: F.medium, fontSize: 12 },
      })}
    >
      <Tab.Screen name="Bacs" component={ContainerListScreen} options={{ title: 'Bacs à proximité', tabBarLabel: 'Bacs' }} />
      <Tab.Screen name="Carte" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen name="Statistiques" component={StatisticsScreen} options={{ title: 'Statistiques' }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={header}>
      <Stack.Screen name="RegionSelect" component={RegionSelectScreen} options={{ title: 'Votre quartier' }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ContainerDetail" component={ContainerDetailScreen} options={{ title: 'Conteneur', headerBackTitle: 'Retour' }} />
    </Stack.Navigator>
  );
}
