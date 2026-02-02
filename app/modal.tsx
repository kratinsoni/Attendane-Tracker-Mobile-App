import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg">Close Modal</Text>
    </SafeAreaView>
  );
}
