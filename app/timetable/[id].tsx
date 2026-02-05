import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  MoreHorizontal,
  Terminal,
  FlaskConical,
  FunctionSquare,
  Brain,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SubjectCard } from "@/components/TimetableViewPageSubjectCard";
import { useGetTimetableById } from "@/hooks/useGetTimetableById";
import { SubjectCardType } from "@/types/timetableTypes";


export default function TimetableDetailScreen() {

  const { id } = useLocalSearchParams();

  const { data, isLoading, error } = useGetTimetableById(id as string);

  console.log("Timetable data:", data);

  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">
          Timetable Details
        </Text>
        <TouchableOpacity className="h-10 w-10 items-center justify-center">
          <MoreHorizontal size={24} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="mb-2 bg-white p-6 items-center dark:bg-slate-900">
          <Image
            source={{ uri: "https://picsum.photos/seed/student/200" }}
            className="mb-4 h-24 w-24 rounded-full ring-4 ring-blue-500/10"
          />
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {data?.name}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Semester {data?.semester} • {data?.semesterType} • {data?.student?.firstName}
          </Text>
          <Text className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
            {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Unknown Date"}
          </Text>

          {/* Stats Grid */}
          <View className="mt-8 w-full flex-row border-t border-slate-100 pt-6 dark:border-slate-800">
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-blue-600">Not Available</Text>
              <Text className="text-[10px] font-semibold uppercase text-slate-500">
                Attendance
              </Text>
            </View>
            <View className="flex-1 items-center border-x border-slate-100 dark:border-slate-800">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                {
                  data?.subjects ? data.subjects.length : 0
                }
              </Text>
              <Text className="text-[10px] font-semibold uppercase text-slate-500">
                Courses
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                {
                  data?.subjects ? data.subjects.reduce((total: number, subj: SubjectCardType) => total + (subj.credits || 0), 0) : 0
                }
              </Text>
              <Text className="text-[10px] font-semibold uppercase text-slate-500">
                Credits
              </Text>
            </View>
          </View>
        </View>

        {/* Subjects List */}
        <View className="px-4 py-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              Enrolled Subjects
            </Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-blue-600">
                Weekly View
              </Text>
            </TouchableOpacity>
          </View>

          {data && data?.subjects?.length > 0 ? (
            data.subjects.map((subject: SubjectCardType) => {
              const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"];
              const icons = [Terminal, FlaskConical, FunctionSquare, Brain];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const randomIcon = icons[Math.floor(Math.random() * icons.length)];
              return (
                <SubjectCard key={subject._id} {...subject} barColor={randomColor} colorClass="" IconComponent={randomIcon} />
              );
            })
          ) : (
            <View className="items-center justify-center py-10">
              <Terminal size={48} color={isDark ? "#fff" : "#000"} />
              <Text className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No subjects enrolled yet.
              </Text>
            </View>
          )}
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
