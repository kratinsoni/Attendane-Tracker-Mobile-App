// src/utils/token.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken"; // 1. Added key for refresh token

export const saveToken = async (token: string, refreshToken?: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  // 2. Conditionally save refresh token if provided (useful during login)
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// 3. Added getter specifically for the refresh token
export const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY); // 4. Ensure we wipe both tokens on logout
};
