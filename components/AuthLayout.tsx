// components/AuthLayout.tsx
import { isBiometricEnabled } from "@/utils/biometric";
import { getToken } from "@/utils/token";
import { useMe } from "@/hooks/useMe";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import LoadingScreen from "./Loading";
import { authenticate} from "@/utils/biometric";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [biometricRequired, setBiometricRequired] = useState<boolean | null>(
    null,
  );
  const [biometricPassed, setBiometricPassed] = useState(false);

  const { data, isLoading, isError } = useMe();

  useEffect(() => {
    Promise.all([
      getToken().then((token) => setHasToken(!!token)),
      isBiometricEnabled().then(setBiometricRequired),
    ]).catch(() => {
      setHasToken(false);
      setBiometricRequired(false);
    });
  }, []);

  // Trigger biometric prompt as soon as we know it's required
  // The native dialog appears on top of the loading screen automatically
  useEffect(() => {
    if (biometricRequired === true && !biometricPassed) {
      authenticate().then((success) => {
        if (success) {
          setBiometricPassed(true);
        } else {
          // Auth failed or cancelled — log them out
          router.replace("/(auth)/login");
        }
      });
    }
  }, [biometricRequired]);

  useEffect(() => {
    if (hasToken === false || (!isLoading && (isError || !data))) {
      router.replace("/(auth)/login");
    }
  }, [hasToken, isLoading, isError, data]);

  if (hasToken === null || biometricRequired === null || isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) return null;

  // Block rendering until biometric passes
  if (biometricRequired && !biometricPassed) {
    return <LoadingScreen />;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};
