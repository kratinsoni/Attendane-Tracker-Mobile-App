// utils/token.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// In-memory cache — eliminates repeated disk reads
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const saveToken = async (token: string, refreshToken?: string) => {
  _accessToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  if (refreshToken) {
    _refreshToken = refreshToken;
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getToken = async (): Promise<string | null> => {
  if (_accessToken) return _accessToken; // instant, no disk I/O
  _accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return _accessToken;
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (_refreshToken) return _refreshToken;
  _refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  return _refreshToken;
};

export const removeToken = async () => {
  _accessToken = null;
  _refreshToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};