import AddIncomeScreen from 'screens/AddIncomeScreens';
import AddExpenseScreen from 'screens/AddExpenseScreen';
import Login from 'screens/Login';
import Signup from 'screens/Signup';
import Dashboard from 'screens/DashboardScreen';


import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from 'screens/AuthContext';


import './global.css';
const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="UserDashboard" component={Dashboard} options={{ headerShown: false }} />
          <Stack.Screen name="AddIncomeScreen" component={AddIncomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddExpenseScreen" component={AddExpenseScreen} options={{ headerShown: false }} />
          {/* <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
