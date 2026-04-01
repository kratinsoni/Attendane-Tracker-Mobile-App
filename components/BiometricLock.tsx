// components/BiometricLock.tsx
import { authenticate, getBiometricType } from "@/utils/biometric";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  onSuccess: () => void;
}

export const BiometricLock = ({ onSuccess }: Props) => {
  const [biometricType, setBiometricType] = useState("Biometrics");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getBiometricType().then(setBiometricType);
    triggerAuth(); // auto-prompt on mount
  }, []);

  const triggerAuth = async () => {
    setFailed(false);
    const success = await authenticate();
    if (success) {
      onSuccess();
    } else {
      setFailed(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Locked</Text>
      <Text style={styles.subtitle}>Authenticate to continue</Text>
      {failed && (
        <Text style={styles.error}>Authentication failed. Try again.</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={triggerAuth}>
        <Text style={styles.buttonText}>Use {biometricType}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, color: "gray" },
  error: { color: "red", fontSize: 14 },
  button: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#6366f1",
    borderRadius: 12,
  },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
});
