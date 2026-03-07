import {
  Activity,
  Ban,
  CheckCircle,
  Code,
  MapPin,
  MoreVertical,
  XCircle,
  Pencil,
  Clock,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Platform,
  Vibration,
  useColorScheme,
  StyleSheet,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { StatusButton } from "./StatusButton";
import { ClassSession } from "@/hooks/scheduleLogic";
import { useCreateAttendance } from "@/hooks/useCreateAttendance";
import { AttendanceEditPopup, AttendanceStatus } from "./AttendanceEditPopup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi, api } from "@/utils/api";

// --- JUICY PHYSICS-BASED ANIMATION OVERLAY ---
const StatusAnimation = ({
  status,
  onComplete,
}: {
  status: string;
  onComplete: () => void;
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Reanimated Shared Values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const bgOpacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Ring/Burst effect shared values
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(1);

  // Dynamic Colors for Light/Dark modes
  const colors: Record<string, string> = {
    PRESENT: isDark ? "#34d399" : "#10b981", // Emerald
    ABSENT: isDark ? "#fb7185" : "#f43f5e", // Rose
    MEDICAL: isDark ? "#fbbf24" : "#f59e0b", // Amber
    CANCELLED: isDark ? "#94a3b8" : "#64748b", // Slate
  };
  const color = colors[status] || colors.PRESENT;

  const Icons: Record<string, any> = {
    PRESENT: CheckCircle,
    ABSENT: XCircle,
    MEDICAL: Activity,
    CANCELLED: Ban,
  };
  const Icon = Icons[status] || CheckCircle;

  useEffect(() => {
    // 1. Fade in the background blur/dim instantly
    bgOpacity.value = withTiming(1, { duration: 150 });

    // 2. Trigger the specific bouncy animation for ALL statuses
    // THE INSTAGRAM POP: Extreme pop with overshoot and a burst ring
    scale.value = withSpring(1, { mass: 1, damping: 5, stiffness: 350 });

    // Ring burst effect
    ringScale.value = withTiming(2, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    ringOpacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.in(Easing.quad),
    });

    // 3. Exit Animation & Cleanup (Reanimated v4 friendly: pure JS timeouts)
    // Start exit animation at 750ms
    const exitTimeout = setTimeout(() => {
      // Shrink back down dynamically (the "reverse pop")
      scale.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.back(2)),
      });
      opacity.value = withTiming(0, { duration: 200 });
      bgOpacity.value = withTiming(0, { duration: 250 });
    }, 750);

    // Completely unmount and trigger the actual mutation at 1000ms
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => {
      clearTimeout(exitTimeout);
      clearTimeout(completeTimeout);
    };
  }, [status]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { justifyContent: "center", alignItems: "center", zIndex: 100 },
      ]}
      pointerEvents="box-none"
    >
      {/* Background Dimming (Subtle overlay) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? "rgba(15, 23, 42, 0.45)"
              : "rgba(255, 255, 255, 0.65)",
            borderRadius: 24,
          },
          useAnimatedStyle(() => ({ opacity: bgOpacity.value })),
        ]}
        pointerEvents="auto"
      />

      {/* Burst Ring (Now active for ALL statuses) */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: 45,
            borderWidth: 4,
            borderColor: color,
          },
          animatedRingStyle,
        ]}
        pointerEvents="none"
      />

      {/* Main Bouncing Icon */}
      <Animated.View
        style={[
          {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            padding: 18,
            borderRadius: 100,
            shadowColor: color,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDark ? 0.8 : 0.4,
            shadowRadius: 15,
            elevation: 12,
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? "rgba(255,255,255,0.05)" : "transparent",
          },
          animatedIconStyle,
        ]}
        pointerEvents="none"
      >
        <Icon size={64} color={color} strokeWidth={2.5} />
      </Animated.View>
    </View>
  );
};
// --- END ANIMATION COMPONENT ---

export const ClassCard = ({
  item,
  timetableId,
  selectedDate,
}: {
  item: ClassSession;
  timetableId: string;
  selectedDate: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [pendingAnimation, setPendingAnimation] = useState<string | null>(null);

  // NEW: Add optimistic state for immediate UI feedback
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate } = useCreateAttendance({ timetableId, date: selectedDate });

  // NEW: Clear optimistic status when the real API data updates
  useEffect(() => {
    if (item.status !== "UNMARKED") {
      setOptimisticStatus(null);
    }
  }, [item.status]);

  const editMutation = useMutation({
    mutationFn: async (type: string) => {
      return await attendanceApi.editAttendanceStatus(
        api,
        item.attendanceId as any,
        type,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      console.error("Failed to update attendance:", error);
    },
  });

  const handleMarkAttendance = (status: string) => {
    if (Platform.OS === "android") {
      Vibration.vibrate(40);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }

    // 1. Instantly update UI
    setOptimisticStatus(status);

    // 2. Trigger animation
    setPendingAnimation(status);

    // 3. Execute mutation with error handling
    console.log(item)
    mutate(
      {
        subjectId: item.subjectId,
        day: item.day,
        type: status,
        timeSlot: item.timeSlot,
        date: selectedDate,
        semester: item.semester,
      },
      {
        // --- THE ROLLBACK ---
        onError: (error) => {
          console.error("Attendance mutation failed:", error);

          // Revert the optimistic state so the buttons show up again
          setOptimisticStatus(null);

          // Let the user know it failed so they can try again
          Alert.alert(
            "Update Failed",
            "We couldn't save your attendance. Please check your connection and try again.",
          );
        },
        onSuccess: () => {
          // Optional: You can trigger a background refetch here if your
          // useCreateAttendance hook doesn't already do it.
          // queryClient.invalidateQueries({ queryKey: ["attendance"] });
        },
      },
    );
  };

  // --- Replaced executeAttendanceMutation with immediate execution above ---

  const mapStatusForEditor = (status: string): AttendanceStatus | undefined => {
    switch (status.toUpperCase()) {
      case "PRESENT":
        return "P";
      case "ABSENT":
        return "A";
      case "MEDICAL":
        return "M";
      case "CANCELLED":
        return "C";
      default:
        return undefined;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          text: "text-emerald-700 dark:text-emerald-400",
        };
      case "ABSENT":
        return {
          bg: "bg-rose-50 dark:bg-rose-500/10",
          text: "text-rose-700 dark:text-rose-400",
        };
      case "MEDICAL":
        return {
          bg: "bg-amber-50 dark:bg-amber-500/10",
          text: "text-amber-700 dark:text-amber-400",
        };
      case "CANCELLED":
        return {
          bg: "bg-slate-50 dark:bg-slate-700/40",
          text: "text-slate-600 dark:text-slate-300",
        };
      default:
        return {
          bg: "bg-green-500/10",
          text: "text-green-600 dark:text-green-400",
        };
    }
  };

  // NEW: Determine which status to display (Optimistic overrides real until real catches up)
  const displayStatus = optimisticStatus || item.status;
  const statusColors = getStatusColors(displayStatus);

  return (
    <View className="relative mb-6 ml-2">
      <View className="absolute -left-[26px] top-4 bottom-[-24px] w-[2px] bg-slate-200 dark:bg-slate-800" />
      <View className="absolute -left-[32px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-blue-500/50" />

      <View className="flex-row justify-between mb-3 items-center">
        <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
          <Clock size={12} color="#3b82f6" />
          <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 ml-1.5">
            {item.time}
          </Text>
        </View>
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {item.slots.length > 1 ? "DOUBLE SLOT" : "SINGLE SLOT"}
        </Text>
      </View>

      <View
        className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-700/50 relative overflow-hidden"
        style={{ elevation: 4 }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mb-1">
              {item.subjectCode}
            </Text>
            <Text className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">
              {item.subjectName}
            </Text>

            <View className="flex-row items-center mt-3 opacity-70">
              <View className="flex-row items-center mr-4">
                <MapPin size={14} color="#64748b" strokeWidth={2.5} />
                <Text className="text-slate-600 dark:text-slate-400 text-xs font-semibold ml-1">
                  {item.location}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Code size={14} color="#64748b" strokeWidth={2.5} />
                <Text className="text-slate-600 dark:text-slate-400 text-xs font-semibold ml-1">
                  Semester {item.semester}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="p-2 -mr-2"
            onPress={() => {
              // Ensure we use displayStatus so they can edit optimistic updates too
              if (displayStatus !== "UNMARKED") setIsEditing(true);
            }}
          >
            {isEditing ? (
              <Pencil size={20} color="#94a3b8" />
            ) : (
              <MoreVertical size={20} color="#cbd5e1" />
            )}
          </TouchableOpacity>
        </View>

        {/* NEW: Use displayStatus instead of item.status */}
        {displayStatus === "UNMARKED" ? (
          <View className="flex-row justify-between mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/50">
            <StatusButton
              icon={CheckCircle}
              color="#10b981"
              bg="bg-emerald-50 dark:bg-emerald-500/10"
              text="PRESENT"
              textColor="text-emerald-700 dark:text-emerald-400"
              onSubmit={handleMarkAttendance}
            />
            <StatusButton
              icon={XCircle}
              color="#f43f5e"
              bg="bg-rose-50 dark:bg-rose-500/10"
              text="ABSENT"
              textColor="text-rose-700 dark:text-rose-400"
              onSubmit={handleMarkAttendance}
            />
            <StatusButton
              icon={Activity}
              color="#f59e0b"
              bg="bg-amber-50 dark:bg-amber-500/10"
              text="MEDICAL"
              textColor="text-amber-700 dark:text-amber-400"
              onSubmit={handleMarkAttendance}
            />
            <StatusButton
              icon={Ban}
              color="#94a3b8"
              bg="bg-slate-50 dark:bg-slate-700/40"
              text="CANCELLED"
              textColor="text-slate-600 dark:text-slate-300"
              onSubmit={handleMarkAttendance}
            />
          </View>
        ) : (
          <View className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex-row items-center justify-between">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Attendance Logged
            </Text>
            <View className={`px-3 py-1 rounded-full ${statusColors.bg}`}>
              <Text
                className={`text-xs font-black uppercase ${statusColors.text}`}
              >
                {displayStatus}
              </Text>
            </View>
          </View>
        )}

        {/* NEW: onComplete now just clears the animation overlay */}
        {pendingAnimation && (
          <StatusAnimation
            status={pendingAnimation}
            onComplete={() => setPendingAnimation(null)}
          />
        )}
      </View>

      {isEditing && (
        <AttendanceEditPopup
          scheduleId={item.subjectId}
          timetableId={timetableId}
          selectedDate={selectedDate}
          initialStatus={mapStatusForEditor(displayStatus)}
          onClose={() => setIsEditing(false)}
          onSave={async (statusName) => {
            if (Platform.OS === "android") {
              Vibration.vibrate(40);
            } else {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            }
            await editMutation.mutateAsync(statusName);
          }}
          onSuccessCallback={(status) => {
            console.log("Updated successfully to:", status);
          }}
        />
      )}
    </View>
  );
};
