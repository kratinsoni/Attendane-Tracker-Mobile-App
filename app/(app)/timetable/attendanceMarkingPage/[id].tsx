import {
  Activity,
  Ban,
  Bell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Code,
  MapPin,
  MoreVertical,
  Plus,
  XCircle,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClassCard } from "@/components/ClassCard";

// Import logic
import { ClassSession, useDailyClasses } from "@/hooks/scheduleLogic";
import { useGetAttendanceForDateByTimetable } from "@/hooks/useGetAttendanceForDateByTimetable";
import { router, useLocalSearchParams } from "expo-router";

const ScheduleScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const id = useLocalSearchParams().id as string;

  // STATE
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  
  const offsetInMs: number = selectedDate.getTimezoneOffset() * 60 * 1000;

// Subtract the offset to "neutralize" the ISO conversion shift
const localISODate: string = new Date(selectedDate.getTime() - offsetInMs)
  .toISOString()
  .split("T")[0];

  // DATA FETCHING
  const { data } = useGetAttendanceForDateByTimetable({
    timetableId: id,
    date: localISODate, 
  });

  // --- DATE LOGIC ---
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  console.log("Selected Date:", selectedDate.toDateString());
  console.log(selectedDate);
  console.log("Fetched Classes:", data?.classes);

  const weekDates = useMemo(() => {
    const startOfWeek = getStartOfWeek(anchorDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [anchorDate]);
  // console.log(weekDates);

  const changeWeek = (direction: "prev" | "next") => {
    const newAnchor = new Date(anchorDate);
    const dayCount = direction === "next" ? 7 : -7;
    newAnchor.setDate(newAnchor.getDate() + dayCount);
    setAnchorDate(newAnchor);
  };

  // --- CLASS DATA PROCESSING ---
  const todaysClasses: ClassSession[] = useDailyClasses(
    data?.classes || [],
  );

  // SPLIT CLASSES: Morning (< 12:00) vs Afternoon (>= 12:00)
  // 1200 represents 12:00 PM in the sortTime integer format
  const morningClasses = todaysClasses.filter((c) => c.sortTime <= 1300);
  const afternoonClasses = todaysClasses.filter((c) => c.sortTime > 1300);

  // Formatting Helpers
  const formatDay = (date: Date): string =>
    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()];
  const formatDateNum = (date: Date): string => date.getDate().toString();
  const formatMonthYear = (date: Date): string =>
    date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const isSameDate = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* HEADER SECTION */}
      <View className="px-4 pt-4 pb-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            Schedule
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <Bell size={22} color="#64748b" />
            </TouchableOpacity>
            <View className="h-9 w-9 ml-3 rounded-full border-2 border-blue-400 p-0.5">
              <Image
                source={{ uri: "https://via.placeholder.com/100" }}
                className="h-full w-full rounded-full"
              />
            </View>
          </View>
        </View>

        {/* WEEK NAVIGATOR */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => changeWeek("prev")} className="p-1">
            <ChevronLeft size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {formatMonthYear(anchorDate)}
          </Text>
          <TouchableOpacity onPress={() => changeWeek("next")} className="p-1">
            <ChevronRight size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* DAY SELECTOR */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {weekDates.map((date, index) => {
            const isActive = isSameDate(date, selectedDate);
            const isToday = isSameDate(date, new Date());
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(date)}
                className={`flex items-center justify-center w-14 py-3 rounded-2xl border ${
                  isActive
                    ? "bg-blue-500 border-blue-500"
                    : isToday
                      ? "bg-white dark:bg-slate-800 border-blue-400"
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${isActive ? "text-blue-100" : "text-slate-400"}`}
                >
                  {formatDay(date)}
                </Text>
                <Text
                  className={`text-lg font-bold ${isActive ? "text-white" : "text-slate-700 dark:text-slate-200"}`}
                >
                  {formatDateNum(date)}
                </Text>
                {!isActive && isToday && (
                  <View className="w-1 h-1 bg-blue-400 rounded-full mt-1" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* OVERVIEW CARD */}
        <View className="bg-blue-600 rounded-2xl p-5 mb-8 shadow-lg shadow-blue-500/20">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-lg font-bold text-white">Overview</Text>
              <Text className="text-blue-100 text-sm">
                {selectedDate.toDateString()}
              </Text>
              <Text className="text-blue-100 text-xs mt-1 opacity-80">
                {todaysClasses.length} classes scheduled
              </Text>
            </View>
            <View className="bg-white/20 px-2 py-1 rounded-lg">
              <Text className="text-white text-[10px] font-bold">
                SPRING 2026
              </Text>
            </View>
          </View>
        </View>

        {/* TIMELINE LIST */}
        <View className="border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-8 pb-24">
          {/* EMPTY STATE */}
          {todaysClasses.length === 0 && (
            <View className="py-10">
              <Text className="text-slate-400 text-center">
                No classes for {formatDay(selectedDate)}.
              </Text>
            </View>
          )}

          {/* 1. MORNING CLASSES */}
          {morningClasses.map((item, index) => (
            <ClassCard key={`morning-${index}`} item={item} timetableId={id} selectedDate={selectedDate.toISOString().split("T")[0]}/>
          ))}

          {/* 2. LUNCH BREAK (Only show if there are actually classes today) */}
          {todaysClasses.length > 0 && (
            <View className="relative my-2">
              <View className="absolute -left-[30px] top-4 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
              <View className="bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 p-3 rounded-xl items-center">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Lunch Break • 01:00 PM - 02:00 PM
                </Text>
              </View>
            </View>
          )}

          {/* 3. AFTERNOON CLASSES */}
          {afternoonClasses.map((item, index) => (
            <ClassCard key={`afternoon-${index}`} item={item} timetableId={id} selectedDate={selectedDate.toISOString().split("T")[0]} />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity className="absolute bottom-8 right-8 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg shadow-blue-500/40" onPress={() => router.push("/dashboard")}>
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};




export default ScheduleScreen;
