import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync('accessToken');
      if (storedToken) setTokenState(storedToken);
    };
    loadToken();
  }, []);

  const setToken = async (newToken) => {
    if (newToken) {
      await SecureStore.setItemAsync('accessToken', newToken);
    } else {
      await SecureStore.deleteItemAsync('accessToken');
    }
    setTokenState(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
