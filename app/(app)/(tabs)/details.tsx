import {
  useGetAttendanceStatBySemester,
  useGetAttendanceStatOfAllSubjects,
  useGetAttendanceStatOfAllTimetables,
} from "@/hooks/useDetails";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AttendanceDetails() {
  const [selectedSem, setSelectedSem] = useState<number>(6);
  const [isSemModalVisible, setIsSemModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const availableSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // New States for Search and Expand/Collapse
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [timetableSearchQuery, setTimetableSearchQuery] = useState("");
  const [isSubjectsExpanded, setIsSubjectsExpanded] = useState(false);
  const [isTimetablesExpanded, setIsTimetablesExpanded] = useState(false);

  // Theme detection
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: semesterOverviewData, refetch: refetchSemesterOverview } =
    useGetAttendanceStatBySemester(selectedSem);
  const { data: allSubjectsData, refetch: refetchAllSubjects } =
    useGetAttendanceStatOfAllSubjects();
  const { data: timetablesData, refetch: refetchTimetables } =
    useGetAttendanceStatOfAllTimetables(selectedSem);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSemesterOverview(),
        refetchAllSubjects(),
        refetchTimetables(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSemesterOverview, refetchAllSubjects, refetchTimetables]);

  // Derived Data for Subjects (Search & Slice)
  const filteredSubjects = useMemo(() => {
    const data = allSubjectsData?.finalStatsArray || [];
    if (!subjectSearchQuery) return data;
    return data.filter(
      (subject: any) =>
        subject?.subjectName
          ?.toLowerCase()
          .includes(subjectSearchQuery.toLowerCase()) ||
        subject?.subjectCode
          ?.toLowerCase()
          .includes(subjectSearchQuery.toLowerCase()),
    );
  }, [allSubjectsData, subjectSearchQuery]);

  const displayedSubjects = isSubjectsExpanded
    ? filteredSubjects
    : filteredSubjects.slice(0, 3);

  // Derived Data for Timetables (Search & Slice)
  const filteredTimetables = useMemo(() => {
    const data = timetablesData || [];
    if (!timetableSearchQuery) return data;
    return data.filter(
      (tt: any) =>
        tt?.timetableName
          ?.toLowerCase()
          .includes(timetableSearchQuery.toLowerCase()) ||
        tt?.subtitle
          ?.toLowerCase()
          .includes(timetableSearchQuery.toLowerCase()),
    );
  }, [timetablesData, timetableSearchQuery]);

  const displayedTimetables = isTimetablesExpanded
    ? filteredTimetables
    : filteredTimetables.slice(0, 3);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return "bg-emerald-500";
    if (percentage >= 75) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 85) return "text-emerald-500 dark:text-emerald-400";
    if (percentage >= 75) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  };

  const getSubjectStatus = (
    percentage: number,
    total: number,
    attended: number,
  ) => {
    if (percentage >= 85)
      return {
        text: `Safe margin: ${attended - Math.ceil(total * 0.75)}`,
        color: "text-slate-500 dark:text-slate-400",
      };
    if (percentage >= 75)
      return {
        text: "On Track",
        color: "text-emerald-500 dark:text-emerald-400",
      };
    return { text: "Warning level", color: "text-red-500 dark:text-red-400" };
  };

  const getTimetableStatus = (percentage: number) => {
    if (percentage >= 90)
      return {
        text: "Excellent",
        color: "text-purple-500 dark:text-purple-400",
      };
    if (percentage >= 75)
      return {
        text: "On Track",
        color: "text-emerald-500 dark:text-emerald-400",
      };
    return {
      text: "Needs Attention",
      color: "text-yellow-500 dark:text-yellow-400",
    };
  };

  const miniCharts = {
    present: [30, 40, 60, 40, 80, 50, 70],
    absent: [20, 10, 60, 10, 20, 0, 80],
    medical: [10, 0, 20, 0, 50, 10, 30],
    cancelled: [20, 10, 0, 40, 10, 0, 100],
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#020617" : "#f8fafc"}
      />

      {/* HEADER */}
      <View className="flex-row items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 z-50 shadow-sm">
        <TouchableOpacity className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">
          Attendance Details
        </Text>
        <TouchableOpacity className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <MaterialIcons
            name="more-vert"
            size={24}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
            tintColor="#059669"
          />
        }
      >
        {/* SEMESTER OVERVIEW SECTION */}
        <View className="px-5 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="flex-row items-end justify-between mb-6">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              Semester Overview
            </Text>

            <TouchableOpacity
              className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full"
              onPress={() => setIsSemModalVisible(true)}
            >
              <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mr-1">
                SEM {selectedSem}
              </Text>
              <MaterialIcons
                name="expand-more"
                size={16}
                color={isDark ? "#34d399" : "#059669"}
              />
            </TouchableOpacity>
          </View>

          {/* Total Attendance Card */}
          <View className="bg-emerald-500 dark:bg-emerald-600 p-6 rounded-2xl shadow-lg mb-8 items-center justify-center relative overflow-hidden">
            <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full opacity-50" />
            <View className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full" />

            <Text className="text-emerald-50 text-sm font-medium mb-1 z-10">
              Total Attendance
            </Text>
            <Text className="text-white text-6xl font-bold tracking-tighter mb-2 z-10">
              {semesterOverviewData?.attendancePercentage.toFixed(2) || "0.00"}%
            </Text>
          </View>

          {/* 4 Status Cards */}
          <View className="space-y-4 gap-y-4">
            {/* Present Card */}
            <View className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <View>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                  Present
                </Text>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                  {semesterOverviewData?.attendedClasses || 0} Hours
                </Text>
              </View>
              <View className="w-24 h-8 flex-row items-end space-x-0.5 justify-between">
                {miniCharts.present.map((h, i) => (
                  <View
                    key={i}
                    className="w-2 rounded-t-sm bg-emerald-500 dark:bg-emerald-400"
                    style={{ height: `${h}%`, opacity: h === 80 ? 1 : 0.5 }}
                  />
                ))}
              </View>
            </View>

            {/* Absent Card */}
            <View className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <View>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                  Absent
                </Text>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                  {semesterOverviewData?.absentClasses || 0} Hours
                </Text>
              </View>
              <View className="w-24 h-8 flex-row items-end space-x-0.5 justify-between">
                {miniCharts.absent.map((h, i) => (
                  <View
                    key={i}
                    className="w-2 rounded-t-sm bg-red-500 dark:bg-red-400"
                    style={{ height: `${h}%`, opacity: h === 80 ? 1 : 0.4 }}
                  />
                ))}
              </View>
            </View>

            {/* Medical Card */}
            <View className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <View>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                  Medical
                </Text>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                  {semesterOverviewData?.medicalClasses || 0} Hours
                </Text>
              </View>
              <View className="w-24 h-8 flex-row items-end space-x-0.5 justify-between">
                {miniCharts.medical.map((h, i) => (
                  <View
                    key={i}
                    className="w-2 rounded-t-sm bg-blue-400 dark:bg-blue-500"
                    style={{ height: `${h}%`, opacity: h === 50 ? 1 : 0.4 }}
                  />
                ))}
              </View>
            </View>

            {/* Cancelled Card */}
            <View className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <View>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                  Cancelled
                </Text>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                  {semesterOverviewData?.cancelledClasses || 0} Hours
                </Text>
              </View>
              <View className="w-24 h-8 flex-row items-end space-x-0.5 justify-between">
                {miniCharts.cancelled.map((h, i) => (
                  <View
                    key={i}
                    className="w-2 rounded-t-sm bg-orange-400 dark:bg-orange-500"
                    style={{ height: `${h}%`, opacity: h === 100 ? 1 : 0.4 }}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ALL SUBJECTS SECTION */}
        <View className="px-5 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              All Subjects
            </Text>
            <TouchableOpacity className="w-8 h-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <MaterialIcons
                name="filter-list"
                size={20}
                color={isDark ? "#94a3b8" : "#475569"}
              />
            </TouchableOpacity>
          </View>

          {/* Subject Search Bar */}
          <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 mb-6 border border-slate-200 dark:border-slate-700">
            <MaterialIcons
              name="search"
              size={20}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
            <TextInput
              className="flex-1 ml-2 text-slate-900 dark:text-white py-0 min-h-[40px]"
              placeholder="Search subjects by name or code..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              value={subjectSearchQuery}
              onChangeText={setSubjectSearchQuery}
              textAlignVertical="center"
            />
            {subjectSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSubjectSearchQuery("")}
                className="p-1"
              >
                <MaterialIcons
                  name="close"
                  size={16}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="gap-y-4">
            {displayedSubjects.map((subject: any, index: any) => {
              const status = getSubjectStatus(
                subject?.attendancePercentage,
                subject?.totalClasses,
                subject?.attendedClasses,
              );
              return (
                <View
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 items-center justify-center mr-3">
                        <MaterialIcons
                          name="menu-book"
                          size={20}
                          color={isDark ? "#94a3b8" : "#64748b"}
                        />
                      </View>
                      <View className="flex-1 pr-2">
                        <Text
                          className="font-bold text-slate-900 dark:text-white text-sm"
                          numberOfLines={1}
                        >
                          {subject?.subjectName}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                          {subject?.subjectCode}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text
                        className={`text-lg font-bold ${getTextColor(subject?.attendancePercentage)}`}
                      >
                        {subject?.attendancePercentage.toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden flex-row">
                    <View
                      className={`h-1.5 rounded-full ${getProgressColor(subject?.attendancePercentage)}`}
                      style={{ width: `${subject?.attendancePercentage}%` }}
                    />
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      {subject?.attendedClasses}/{subject?.totalClasses} Classes
                    </Text>
                    <Text className={`text-xs font-medium ${status.color}`}>
                      {status.text}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Show empty state if search yields no results */}
            {displayedSubjects.length === 0 && (
              <Text className="text-center text-slate-500 dark:text-slate-400 py-4">
                No subjects found.
              </Text>
            )}
          </View>

          {/* See More / See Less Button for Subjects */}
          {filteredSubjects.length > 3 && (
            <TouchableOpacity
              className="mt-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl items-center border border-slate-200 dark:border-slate-700"
              onPress={() => setIsSubjectsExpanded(!isSubjectsExpanded)}
            >
              <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {isSubjectsExpanded
                  ? "See Less"
                  : `See More (${filteredSubjects.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TIMETABLE SECTION */}
        <View className="px-5 pt-8 pb-24 bg-white dark:bg-slate-900 mt-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              Timetable
            </Text>
            {/* <TouchableOpacity>
              <Text className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Edit
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* Timetable Search Bar */}
          <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 mb-6 border border-slate-200 dark:border-slate-700">
            <MaterialIcons
              name="search"
              size={20}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
            <TextInput
              className="flex-1 ml-2 text-slate-900 dark:text-white py-0 min-h-[40px]"
              placeholder="Search timetables..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              value={timetableSearchQuery}
              onChangeText={setTimetableSearchQuery}
              textAlignVertical="center"
            />
            {timetableSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setTimetableSearchQuery("")}
                className="p-1"
              >
                <MaterialIcons
                  name="close"
                  size={16}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="gap-y-4">
            {displayedTimetables.map((tt: any, index: any) => {
              const status = getTimetableStatus(tt?.attendancePercentage);

              let iconColor = isDark ? "#34d399" : "#059669";
              let iconBg = "bg-emerald-50 dark:bg-emerald-900/30";
              let barColor = "bg-emerald-500";
              let tColor = "text-emerald-500 dark:text-emerald-400";

              if (index === 1) {
                iconColor = isDark ? "#c084fc" : "#a855f7";
                iconBg = "bg-purple-50 dark:bg-purple-900/30";
                barColor = "bg-purple-500";
                tColor = "text-purple-500 dark:text-purple-400";
              }
              if (index === 2) {
                iconColor = isDark ? "#facc15" : "#eab308";
                iconBg = "bg-yellow-50 dark:bg-yellow-900/30";
                barColor = "bg-yellow-400";
                tColor = "text-yellow-500 dark:text-yellow-400";
              }

              return (
                <View
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-10 h-10 rounded-lg ${iconBg} items-center justify-center mr-3`}
                      >
                        <MaterialIcons
                          name={
                            index === 0
                              ? "calendar-today"
                              : index === 1
                                ? "science"
                                : "groups"
                          }
                          size={20}
                          color={iconColor}
                        />
                      </View>
                      <View className="flex-1 pr-2">
                        <Text
                          className="font-bold text-slate-900 dark:text-white text-sm"
                          numberOfLines={1}
                        >
                          {tt?.timetableName}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                          {tt?.subtitle}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text className={`text-lg font-bold ${tColor}`}>
                        {tt?.attendancePercentage?.toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden flex-row">
                    <View
                      className={`h-1.5 rounded-full ${barColor}`}
                      style={{ width: `${tt?.attendancePercentage}%` }}
                    />
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      {tt?.attendedClasses}/{tt?.totalClasses} Classes
                    </Text>
                    <Text className={`text-xs font-medium ${status.color}`}>
                      {status.text}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Show empty state if search yields no results */}
            {displayedTimetables.length === 0 && (
              <Text className="text-center text-slate-500 dark:text-slate-400 py-4">
                No timetables found.
              </Text>
            )}
          </View>

          {/* See More / See Less Button for Timetables */}
          {filteredTimetables.length > 3 && (
            <TouchableOpacity
              className="mt-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl items-center border border-slate-200 dark:border-slate-700"
              onPress={() => setIsTimetablesExpanded(!isTimetablesExpanded)}
            >
              <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {isTimetablesExpanded
                  ? "See Less"
                  : `See More (${filteredTimetables.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* SEMESTER SELECTOR MODAL */}
      <Modal
        visible={isSemModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSemModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 dark:bg-black/70 justify-center items-center"
          onPress={() => setIsSemModalVisible(false)}
        >
          <View
            className="bg-white dark:bg-slate-800 w-4/5 rounded-2xl p-6 shadow-xl"
            onStartShouldSetResponder={() => true}
          >
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Select Semester
            </Text>

            <View className="flex-row flex-wrap justify-center gap-4">
              {availableSemesters?.map((sem) => (
                <TouchableOpacity
                  key={sem}
                  onPress={() => {
                    setSelectedSem(sem);
                    setIsSemModalVisible(false);
                  }}
                  className={`w-16 h-16 rounded-xl items-center justify-center border-2 ${
                    selectedSem === sem
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600"
                  }`}
                >
                  <Text
                    className={`text-xl font-bold ${
                      selectedSem === sem
                        ? "text-white"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {sem}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
