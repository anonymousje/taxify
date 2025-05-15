import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';

import Login from 'screens/Login';
import Signup from 'screens/Signup';
import AddIncomeScreen from 'screens/AddIncomeScreens';
import AddExpenseScreen from 'screens/AddExpenseScreen';
import IncomeListScreen from 'screens/IncomeListScreen';
import ExpenseListScreen from 'screens/ExpenseListScreen';
import ReceiptListScreen from 'screens/ReceiptListScreen';
import TaxFormScreen from 'screens/TaxForm';
import ReceiptScreen from 'screens/RecieptScreen';
import ReceiptDetailScreen from 'screens/ReceiptDetailScreen';
import SettingsScreen from 'screens/SettingsScreen';
import NotFoundScreen from 'screens/NotFoundScreen';

import MainTabs from 'screens/MainTabs'; // <-- Import the tab-based navigator

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from 'screens/AuthContext';

import './global.css';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView
        style={{
          flex: 1,
          marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
          backgroundColor: '#fff'
        }}
      >
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            {/* Authentication Screens */}
            <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />

            {/* Main Tab Navigation */}
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

            {/* Detail & Utility Screens */}
            <Stack.Screen name="AddIncomeScreen" component={AddIncomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TaxForm" component={TaxFormScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddExpenseScreen" component={AddExpenseScreen} options={{ headerShown: false }} />
            <Stack.Screen name="IncomeListScreen" component={IncomeListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ExpenseListScreen" component={ExpenseListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ReceiptScreen" component={ReceiptScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ReceiptDetailScreen" component={ReceiptDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}
