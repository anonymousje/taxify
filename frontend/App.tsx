import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import AddIncomeScreen from 'screens/AddIncomeScreens';
import AddExpenseScreen from 'screens/AddExpenseScreen';
import Login from 'screens/Login';
import Signup from 'screens/Signup';
import Dashboard from 'screens/DashboardScreen';
import IncomeListScreen from 'screens/IncomeListScreen';
import ExpenseListScreen from 'screens/ExpenseListScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from 'screens/AuthContext';

import './global.css';
import ReceiptListScreen from 'screens/ReceiptListScreen';
import SettingsScreen from 'screens/SettingsScreen';

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
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserDashboard"
              component={Dashboard}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddIncomeScreen"
              component={AddIncomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddExpenseScreen"
              component={AddExpenseScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="IncomeListScreen"
              component={IncomeListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ExpenseListScreen"
              component={ExpenseListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ReceiptListScreen"
              component={ReceiptListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}
