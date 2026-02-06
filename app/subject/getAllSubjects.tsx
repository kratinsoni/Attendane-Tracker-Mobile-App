import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Bell,
  Book,
  ChevronLeft,
  Filter,
  FlaskConical,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react-native";
import React,{ useCallback, useState} from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "@/components/Loading";
import ErrorScreen from "@/components/ErrorPage";
import { useColorScheme } from "nativewind";
import { CreateSubjectPayload } from "@/types/subjectTypes";
import { SubjectCard } from "@/components/SubjectCard";
import { useGetAllSubjects } from "@/hooks/useGetAllSubjects";

export default function AllSubjectsScreen() {
  const router = useRouter();

  // TanStack Query Hook
  const { data: subjects, isLoading, error } = useQuery<CreateSubjectPayload[]>({
  queryKey: ['subjects'],
  queryFn: useGetAllSubjects, // Ensure this function returns Promise<SubjectCardType[]>
});

  console.log( "subject data is:", subjects)
  const { colorScheme } = useColorScheme();
  

  // State for the pull-to-refresh spinner
    const [refreshing, setRefreshing] = useState(false);
  
    // Function to handle the pull-down action
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        await refetch();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setRefreshing(false);
      }
    }, [refetch]);
  
    // Only show the full-screen loading if we aren't already doing a pull-to-refresh
    if (isLoading && !refreshing) {
      return <LoadingScreen />;
    }
  
    if(error){
      return <ErrorScreen/>
    }

    const isDark = colorScheme === "dark";


  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar
              barStyle={isDark ? "light-content" : "dark-content"}
              backgroundColor={isDark ? "#101622" : "#f6f6f8"}
      />
      {/* Header (Same as before) */}
      <View className="bg-white dark:bg-gray-950 px-4 pt-2 pb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2"
          >
            <ChevronLeft size={24} color="#1152d4" />
            <Text className="text-xl font-bold tracking-tight dark:text-white">
              All Subjects
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2 rounded-full bg-gray-50 dark:bg-gray-800">
            <Bell size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 h-11">
            <Search size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search subjects..."
              placeholderTextColor="#9ca3af"
              className="flex-1 ml-2 text-sm dark:text-white"
            />
          </View>
          <TouchableOpacity className="w-11 h-11 bg-primary/10 items-center justify-center rounded-xl">
            <Filter size={20} color="#1152d4" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logic for Loading, Error, and List */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1152d4" />
            <Text className="mt-2 text-gray-500">Loading courses...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-red-500 text-center mb-4">
              Failed to load subjects. Please check your connection.
            </Text>
            <TouchableOpacity
              // onPress={() => refetch()}
              className="flex-row items-center bg-primary px-4 py-2 rounded-lg"
            >
              <RefreshCcw size={16} color="white" className="mr-2" />
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
          >
            {subjects?.map((item: any, index : number) => {
              // 1. Determine UI logic based on the subject type
              const isLab = item.type === "LAB";

              return (
                <SubjectCard
                  key={item._id || `${item.code}-${index}`}
                  _id={item._id || String(index)}
                  name={item.name}
                  code={item.code}
                  credits={item.credits}
                  type={item.type}
                  Grading={item.Grading}
                  professor={item.professor}
                  slots={item.slots} // Pass the array directly as your card handles the join
                  // 2. Map attendance props to match SubjectCardProps exactly
                  totalClasses={item.totalClasses || 30}
                  attendedClasses={item.attendedClasses || 0}
                  // 3. Pass the missing required UI props
                  // colorClass={
                  //   isLab
                  //     ? "bg-emerald-100 dark:bg-emerald-900/30"
                  //     : "bg-blue-100 dark:bg-blue-900/30"
                  // }
                  // barColor={isLab ? "#10b981" : "#1152d4"}
                  // IconComponent={isLab ? FlaskConical : Book}
                />
              );
            })}
            <View className="h-24" />
          </ScrollView>
        )}
      </View>

      {/* FAB - Navigates to a Create Screen */}
      <TouchableOpacity
        // onPress={() => router.push('/create-subject')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
