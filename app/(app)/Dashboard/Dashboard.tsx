import {
  useGetLeastAttendance,
  useGetTopAttendance,
} from "@/hooks/useDashboardAttendanceStat";
import { useMe } from "@/hooks/useMe";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. Setup Icons for NativeWind
const Icon = ({ name, size = 24, color, className }: any) => (
  <MaterialIcons name={name} size={size} color={color} className={className} />
);

export default function Dashboard() {
  
  const { data } = useMe();
  const { data: topAttendance } = useGetTopAttendance();
  const { data: leastAttendance } = useGetLeastAttendance();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const today = new Date();

  // 'en-US' means English. 'long' gives you "Monday", 'short' gives you "Mon".
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    today,
  );
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    today,
  );
  const dateNumber = today.getDate();
  const shortMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(today);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="pt-4 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {dayName}, {shortMonth} {dateNumber}
            </Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Hello, {data.firstName} {data.lastName}
            </Text>
          </View>
          <TouchableOpacity
            className="relative"
            onPress={() => router.push("/profile/profile")}
          >
            <Image
              source={{ uri: `https://picsum.photos/seed/${data._id}/400/200` }}
              className="w-12 h-12 rounded-full border-2 border-primary"
            />
            <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-background-dark rounded-full" />
          </TouchableOpacity>
        </View>
        {/* Stats Grid (Top Attendance & Needs Focus) */}
        <View className="flex-col gap-4 mb-6">
          {/* Card 1: Top Attendance */}
          <View className="bg-white dark:bg-[#151c2b] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-2 mb-4">
              <Icon name="trending-up" size={20} color="#22c55e" />
              <Text className="text-base font-semibold text-slate-800 dark:text-white">
                Top Attendance
              </Text>
            </View>

            <View className="gap-3">
              {topAttendance?.map((item: any, index: any) => {
                const barOpacity =
                  index === 0
                    ? "bg-primary"
                    : index === 1
                      ? "bg-primary/60"
                      : "bg-primary/40";
                const isTopTwo = index < 2;

                // Truncate long names to prevent layout breaking
                const safeSubjectName =
                  item.subjectName?.length > 18
                    ? `${item.subjectName.substring(0, 18)}...`
                    : item.subjectName;

                return (
                  <StatRow
                    key={index}
                    label={safeSubjectName}
                    color={barOpacity}
                    score={`${Math.round(item.attendancePercentage)}%`}
                    scoreColor={
                      isTopTwo
                        ? "text-green-700 dark:text-green-400"
                        : "text-blue-700 dark:text-blue-400"
                    }
                    scoreBg={
                      isTopTwo
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    }
                  />
                );
              })}

              {topAttendance?.length === 0 && (
                <Text className="text-slate-400 text-center py-2">
                  No attendance data available
                </Text>
              )}
            </View>
          </View>

          {/* Card 2: Needs Focus (Cleaned up the double-nesting) */}
          <View className="bg-white dark:bg-[#151c2b] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-2 mb-4">
              <Icon name="trending-down" size={20} color="#ef4444" />
              <Text className="text-base font-semibold text-slate-800 dark:text-white">
                Needs Focus
              </Text>
            </View>

            <View className="gap-3">
              {leastAttendance?.map((item: any, index: any) => {
                const isLowest = index === 0;
                const barColor = isLowest
                  ? "bg-red-400"
                  : index === 1
                    ? "bg-orange-400"
                    : "bg-orange-300";

                // Truncate long names to prevent layout breaking
                const safeSubjectName =
                  item.subjectName?.length > 18
                    ? `${item.subjectName.substring(0, 18)}...`
                    : item.subjectName;

                return (
                  <StatRow
                    key={index}
                    label={safeSubjectName}
                    color={barColor}
                    score={`${Math.round(item.attendancePercentage)}%`}
                    scoreColor={
                      isLowest
                        ? "text-red-700 dark:text-red-400"
                        : "text-orange-700 dark:text-orange-400"
                    }
                    scoreBg={
                      isLowest
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-orange-100 dark:bg-orange-900/30"
                    }
                  />
                );
              })}

              {leastAttendance?.length === 0 && (
                <Text className="text-slate-400 text-center py-2">
                  No attendance data available
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Blue Schedule Card */}
        <View className="bg-primary rounded-xl shadow-lg shadow-primary/20 overflow-hidden relative mb-6">
          {/* Background Decorative Circles */}
          <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <View className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8" />

          <View className="p-5 z-10">
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center gap-2">
                <Icon name="schedule" size={20} color="rgba(255,255,255,0.8)" />
                <Text className="text-lg font-semibold text-white">
                  Schedule at a Glance
                </Text>
              </View>
              <TouchableOpacity className="bg-white/20 px-3 py-1.5 rounded-lg active:bg-white/30">
                <Text className="text-xs font-medium text-white">
                  View Full
                </Text>
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <ScheduleItem
                time="10:00"
                ampm="AM"
                subject="Mathematics"
                room="Room 302, Building A"
              />
              <ScheduleItem
                time="12:00"
                ampm="PM"
                subject="History"
                room="Room 101, Main Hall"
              />
            </View>
          </View>
        </View>

        {/* Horizontal Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row pb-2 mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          <TabButton title="Exams" active />
          <TabButton title="Assignments" />
          <TabButton title="Tests" />
          <TabButton title="Events" />
        </ScrollView>

        {/* Exam List Items */}
        <View className="gap-3 mt-2">
          <ExamCard
            date="30"
            month="OCT"
            title="Midterm: Physics"
            detail="Written Exam • 2 hours"
            color="bg-red-50 dark:bg-red-900/20"
            textColor="text-red-500"
          />
          <ExamCard
            date="05"
            month="NOV"
            title="Final: Literature"
            detail="Essay • Online Submission"
            color="bg-indigo-50 dark:bg-indigo-900/20"
            textColor="text-indigo-500"
          />
          <ExamCard
            date="12"
            month="NOV"
            title="Review: Algebra II"
            detail="Practice Test • 45 mins"
            color="bg-amber-50 dark:bg-amber-900/20"
            textColor="text-amber-500"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Helper Components ---

const StatRow = ({ label, color, score, scoreColor, scoreBg }: any) => (
  <View className="flex-row items-center justify-between">
    <View className="flex-row items-center gap-3">
      <View className={`w-2 h-2 rounded-full ${color}`} />
      <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </Text>
    </View>
    <View className={`px-2 py-1 rounded-lg ${scoreBg}`}>
      <Text className={`text-xs font-bold ${scoreColor}`}>{score}</Text>
    </View>
  </View>
);

const ScheduleItem = ({ time, ampm, subject, room }: any) => (
  <View className="flex-row items-start gap-4">
    <View className="flex-col items-center w-10 pt-1">
      <Text className="text-sm font-bold text-white/90">{time}</Text>
      <Text className="text-xs text-white/60">{ampm}</Text>
      <View className="h-8 w-[1px] bg-white/20 mt-2" />
    </View>
    <View className="bg-white/10 p-3 rounded-lg flex-1 border border-white/10">
      <Text className="font-bold text-sm text-white">{subject}</Text>
      <View className="flex-row items-center gap-1 mt-1">
        <Icon name="location-on" size={10} color="rgba(255,255,255,0.7)" />
        <Text className="text-xs text-white/70">{room}</Text>
      </View>
    </View>
  </View>
);

const TabButton = ({ title, active }: any) => (
  <TouchableOpacity
    className={`px-5 py-2.5 rounded-full border ${
      active
        ? "bg-primary border-primary shadow-sm"
        : "bg-white dark:bg-[#151c2b] border-slate-200 dark:border-slate-700"
    }`}
  >
    <Text
      className={`text-sm font-medium ${active ? "text-white" : "text-slate-600 dark:text-slate-300"}`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const ExamCard = ({ date, month, title, detail, color, textColor }: any) => (
  <TouchableOpacity className="bg-white dark:bg-[#151c2b] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
    <View className="flex-row items-center gap-4">
      <View
        className={`w-12 h-12 rounded-lg ${color} items-center justify-center flex-col`}
      >
        <Text className={`text-[10px] font-bold ${textColor}`}>{month}</Text>
        <Text className={`text-lg font-bold leading-none ${textColor}`}>
          {date}
        </Text>
      </View>
      <View>
        <Text className="font-semibold text-slate-800 dark:text-white">
          {title}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {detail}
        </Text>
      </View>
    </View>
    <View className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
      <Icon name="chevron-right" size={18} className="text-slate-400" />
    </View>
  </TouchableOpacity>
);
