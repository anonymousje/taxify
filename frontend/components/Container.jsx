import { SafeAreaView } from 'react-native';

export const Container = ({ children }) => {
  return <SafeAreaView className="flex flex-1 m-6">{children}</SafeAreaView>;
};
