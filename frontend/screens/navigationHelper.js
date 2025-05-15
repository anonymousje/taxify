import { CommonActions } from "@react-navigation/native";

const availableScreens = [
    "Signup",
    "Login",
    "UserDashboard",
    "AddIncomeScreen",
    "AddExpenseScreen",
    "IncomeListScreen",
    "ExpenseListScreen",
    "ReceiptListScreen",
    "Settings",
    "FinancesScreen",
    "MainTabs",
    "TaxForm"
];

export const handleNavigation = (navigation, screenName) => {
    if (availableScreens.includes(screenName)) {
      navigation.dispatch(
        CommonActions.navigate({
          name: screenName,
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.navigate({
          name: "NotFound",
        })
      );
    }
  };