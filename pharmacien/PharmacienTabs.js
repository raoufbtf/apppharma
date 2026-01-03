import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PharmacienOrdersScreen from './PharmacienOrdersScreen';
import PharmacienMedicinesScreen from './PharmacienMedicinesScreen';
import PharmacienProfileScreen from './PharmacienProfileScreen';

const Tab = createBottomTabNavigator();

export default function PharmacienTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === 'Orders') icon = 'receipt';
          if (route.name === 'Medicines') icon = 'medkit';
          if (route.name === 'Profile') icon = 'business';
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28A745',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Orders" component={PharmacienOrdersScreen} options={{ title: 'Commandes' }} />
      <Tab.Screen name="Medicines" component={PharmacienMedicinesScreen} options={{ title: 'Médicaments' }} />
      <Tab.Screen name="Profile" component={PharmacienProfileScreen} options={{ title: 'Ma pharmacie' }} />
    </Tab.Navigator>
  );
}
