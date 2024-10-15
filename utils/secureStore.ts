import * as SecureStore from 'expo-secure-store';

export const SecureStoreService = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving item from SecureStore: ${error}`);
      return null;
    }
  },

  // Corrected setItem function:
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
      // No need to return anything (implicitly returns Promise<void>)
    } catch (error) {
      console.error(`Error storing item in SecureStore: ${error}`);
      // Handle the error if needed (re-throw or log)
    }
  },

  removeItem: async (key: string): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from SecureStore: ${error}`);
      return false;
    }
  },
};
