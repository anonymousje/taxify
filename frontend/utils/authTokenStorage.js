import * as SecureStore from 'expo-secure-store';

export const storeToken = (token) => SecureStore.setItemAsync('accessToken', token);
export const getToken = () => SecureStore.getItemAsync('accessToken');
export const removeToken = () => SecureStore.deleteItemAsync('accessToken');
