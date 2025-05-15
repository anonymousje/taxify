// MainTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import Dashboard from 'screens/DashboardScreen';
import FinancesScreen from 'screens/FinancesScreen';
import ReceiptListScreen from 'screens/ReceiptListScreen';
import SettingsScreen from 'screens/SettingsScreen';
import TaxFormScreen from './TaxForm';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = {
            Dashboard: 'home',
            Finances: 'wallet',
            TaxForm: 'document-text',
            Receipts: 'receipt',
            Settings: 'settings',
          }[route.name];

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5B21B6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { height: 60, paddingBottom: 5 },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Finances" component={FinancesScreen} />
      <Tab.Screen name="TaxForm" component={TaxFormScreen} />
      <Tab.Screen name="Receipts" component={ReceiptListScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
