import { router } from "expo-router";
import AuthLayout from "@/components/AuthLayout";
import { Text, TouchableOpacity,StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { removeToken } from "@/utils/token";
import { useLogout } from "@/hooks/useLogout";

export default function ModalScreen() {

  const { colorScheme } = useColorScheme();

  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  const isDark = colorScheme === "dark";

  return (
    <AuthLayout>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#101622" : "#f6f6f8"}
        />
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

          <TouchableOpacity
            onPress={() => router.push("/profile/profile")}
            className="px-4 py-2 bg-blue-500 rounded-md"
          >
            <Text className="text-xl text-white">Profile Page</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/subject/getAllSubjects")}
            className="px-4 py-2 bg-blue-500 rounded-md"
          >
            <Text className="text-xl text-white">Subject Page</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            className="px-4 py-2 bg-blue-500 rounded-md"
          >
            <Text className="text-xl text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AuthLayout>
  );
}
