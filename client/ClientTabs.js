import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ClientMapScreen from './ClientMapScreen';
import ClientOrdersScreen from './ClientOrdersScreen';
import ClientProfileScreen from './ClientProfileScreen';

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === 'Map') icon = 'map';
          if (route.name === 'Orders') icon = 'receipt';
          if (route.name === 'Profile') icon = 'person';

          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Map"
        component={ClientMapScreen}
        options={{ title: 'Pharmacies' }}
      />
      <Tab.Screen
        name="Orders"
        component={ClientOrdersScreen}
        options={{ title: 'Commandes' }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientProfileScreen}
        options={{ title: 'Compte' }}
      />
    </Tab.Navigator>
  );
}
