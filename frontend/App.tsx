import  AddIncomeScreen from 'screens/AddIncomeScreens';
import AddExpenseScreen from 'screens/AddExpenseScreen';
import { StatusBar } from 'expo-status-bar';

import './global.css';

export default function App() {
  return (
    <>
      <AddExpenseScreen />
      <StatusBar style="auto" />
    </>
  );
}
