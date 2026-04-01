// utils/biometric.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const BIOMETRIC_ENABLED_KEY = "biometric_enabled";

export const isBiometricAvailable = async (): Promise<boolean> => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
};

export const getBiometricType = async (): Promise<string> => {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))
    return "Fingerprint";
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION))
    return "Face ID";
  return "Biometrics";
};

export const authenticate = async (): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Verify your identity",
    fallbackLabel: "Use passcode",
    cancelLabel: "Cancel",
    disableDeviceFallback: false, // allows PIN fallback if biometric fails
  });
  return result.success;
};

export const setBiometricEnabled = async (enabled: boolean) => {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(enabled));
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return val ? JSON.parse(val) : false;
};
