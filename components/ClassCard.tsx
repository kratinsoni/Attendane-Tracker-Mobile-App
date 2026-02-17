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
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StatusButton } from "./StatusButton";
import { ClassSession } from "@/hooks/scheduleLogic";
import { useCreateAttendance } from "@/hooks/useCreateAttendance";
import { AttendanceEditPopup, AttendanceStatus } from "./AttendanceEditPopup"; // ADDED IMPORT
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi, api } from "@/utils/api";

export const ClassCard = ({
  item,
  timetableId,
  selectedDate,
}: {
  item: ClassSession;
  timetableId: string;
  selectedDate: string;
}) => {
  // 1. Add state to toggle the edit UI
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { mutate } = useCreateAttendance({ timetableId, date: selectedDate });

  const editMutation = useMutation({
    // We only need the string 'type' (e.g., "PRESENT") from the popup
    mutationFn: async (type: string) => {
      // Call your exact API function here
      return await attendanceApi.editAttendanceStatus(api, item.attendanceId as any, type);
    },
    onSuccess: () => {
      // Refresh the attendance list so the UI updates instantly
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      console.error("Failed to update attendance:", error);
    }
  });

  const handleMarkAttendance = (status: string) => {
    mutate({
      subjectId: item.subjectId,
      day: item.day,
      type: status,
      timeSlot: item.timeSlot,
      date: selectedDate,
      semester: item.semester,
    });
  };

  // Helper function to safely map backend string status to the modal's expected AttendanceStatus type
  const mapStatusForEditor = (status: string): AttendanceStatus | undefined => {
    switch (status.toUpperCase()) {
      case "PRESENT": return "P";
      case "ABSENT": return "A";
      case "MEDICAL": return "M";
      case "CANCELLED": return "C";
      default: return undefined;
    }
  };

  // Helper function to get dynamic colors for logged attendance
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
        // Fallback colors
        return {
          bg: "bg-green-500/10",
          text: "text-green-600 dark:text-green-400",
        };
    }
  };

  // Call it to get the colors for the current item
  const statusColors = getStatusColors(item.status);

  return (
    <View className="relative mb-6 ml-2">
      {/* TIMELINE CONNECTOR (Vertical Line) */}
      <View className="absolute -left-[26px] top-4 bottom-[-24px] w-[2px] bg-slate-200 dark:bg-slate-800" />

      {/* TIMELINE DOT (Glow Effect) */}
      <View className="absolute -left-[32px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-blue-500/50" />

      {/* HEADER INFO */}
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

      {/* CARD BODY */}
      <View
        className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-700/50"
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
                  Section {item.semester}
                </Text>
              </View>
            </View>
          </View>

          {/* EDIT BUTTON TOGGLE */}
          <TouchableOpacity
            className="p-2 -mr-2"
            onPress={() => {if(item.status !== "UNMARKED")setIsEditing(true)}} // <-- ADDED ONPRESS
          >
            {isEditing? (
              // Active State: Shows Pencil, made it slightly darker to look "active"
              <Pencil size={20} color="#94a3b8" /> 
            ) : (
              // Default State: Shows MoreVertical
              <MoreVertical size={20} color="#cbd5e1" /> 
            )}
          </TouchableOpacity>
        </View>

        {/* ACTIONS / STATUS LOGGED */}
        {item.status === "UNMARKED" ? (
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
              <Text className={`text-xs font-black uppercase ${statusColors.text}`}>
                {item.status}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 3. CONDITIONALLY RENDER THE MODAL POPUP */}
      {isEditing && (
        <AttendanceEditPopup
          scheduleId={item.subjectId} 
          timetableId={timetableId}
          selectedDate={selectedDate}
          initialStatus={mapStatusForEditor(item.status)} 
          onClose={() => setIsEditing(false)} 

          // 1. ADD THIS MISSING PROP (This is what the compiler is complaining about)
          onSave={async (statusName) => {
            // statusName will be "PRESENT", "ABSENT", etc.
            await editMutation.mutateAsync(statusName);
          }}

          // 2. (Optional) Just a simple callback for when it finishes successfully
          onSuccessCallback={(status) => {
            console.log("Updated successfully to:", status);
          }}
        />
      )}
    </View>
  );
};