import { router } from "expo-router";
import AuthLayout from "@/components/AuthLayout";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModalScreen() {
  return (
    <AuthLayout>
      <SafeAreaView className="flex-1 bg-white">
        <View>
          <Text> HOME </Text>
          <TouchableOpacity
            onPress={() => router.push("/timetable/createTimetablePage")}
            className="px-4 py-2 bg-blue-500 rounded-md"
          >
            <Text className="text-xl text-white">Create Timetable</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/timetable/TimetableHomePage")}
            className="px-4 py-2 bg-blue-500 rounded-md"
          >
            <Text className="text-xl text-white">Timetable Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/timetable/attendanceMarkingPage")}
            className="px-4 py-2 bg-blue-500 rounded-md"
          >
            <Text className="text-xl text-white">Timetable Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AuthLayout>
  );
}
