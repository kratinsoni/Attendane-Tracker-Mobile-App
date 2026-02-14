import { useMutation } from "@tanstack/react-query";
import { Activity, Ban, CheckCircle, XCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export type AttendanceStatus = "P" | "A" | "M" | "C";

interface AttendanceEditPopupProps {
  scheduleId: string;
  timetableId: string;
  selectedDate: string;
  initialStatus?: AttendanceStatus;
  onSuccessCallback?: (status: AttendanceStatus) => void;
  onClose: () => void;
  // 1. ADD THIS LINE SO THE COMPILER KNOWS WHAT ONSAVE IS
  onSave: (statusName: string) => Promise<void>;
}

// Configuration to handle the dynamic colors and icons for each status
const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    activeCardBorder: string;
    activeCardBg: string;
    radioBorder: string;
    radioFill: string;
  }
> = {
  P: {
    label: "Present",
    icon: CheckCircle,
    iconColor: "#16a34a",
    iconBg: "bg-green-100 dark:bg-green-800/40",
    activeCardBorder: "border-green-200 dark:border-green-800/30",
    activeCardBg: "bg-green-50/50 dark:bg-green-900/20",
    radioBorder: "border-green-600",
    radioFill: "bg-green-600",
  },
  A: {
    label: "Absent",
    icon: XCircle,
    iconColor: "#dc2626",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    activeCardBorder: "border-red-200 dark:border-red-800/30",
    activeCardBg: "bg-red-50/30 dark:bg-red-900/10",
    radioBorder: "border-red-600",
    radioFill: "bg-red-600",
  },
  M: {
    label: "Medical",
    icon: Activity,
    iconColor: "#ca8a04",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    activeCardBorder: "border-yellow-200 dark:border-yellow-800/30",
    activeCardBg: "bg-yellow-50/30 dark:bg-yellow-900/10",
    radioBorder: "border-yellow-500",
    radioFill: "bg-yellow-500",
  },
  C: {
    label: "Cancelled",
    icon: Ban,
    iconColor: "#64748b",
    iconBg: "bg-slate-100 dark:bg-slate-700",
    activeCardBorder: "border-slate-300 dark:border-slate-600",
    activeCardBg: "bg-slate-50 dark:bg-slate-700/50",
    radioBorder: "border-slate-600",
    radioFill: "bg-slate-600",
  },
};

export const AttendanceEditPopup = ({
  scheduleId,
  timetableId,
  selectedDate,
  initialStatus = "P",
  onSuccessCallback,
  onClose,
  onSave, // 2. EXTRACT ONSAVE HERE
}: AttendanceEditPopupProps) => {
  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceStatus>(initialStatus);

  // TanStack Query Mutation inside the Popup
  const updateMutation = useMutation({
    mutationFn: async (newStatus: AttendanceStatus) => {
      // 3. Get the full string based on what the user selected (e.g. "Present")
      // And capitalize it to "PRESENT" to match your backend
      const fullStatusName = STATUS_CONFIG[newStatus].label.toUpperCase();

      console.log(`Sending ${fullStatusName} back to ClassCard...`);

      // 4. Await the API call passed down from ClassCard
      await onSave(fullStatusName);

      return newStatus;
    },
    onSuccess: (updatedStatus) => {
      if (onSuccessCallback) onSuccessCallback(updatedStatus);
      onClose(); // Automatically close modal on success
    },
  });

  const statuses: AttendanceStatus[] = ["P", "A", "M", "C"];

  return (
    <Modal visible={true} transparent animationType="fade">
      {/* ... The rest of your modal UI code stays exactly the same ... */}
      <View className="flex-1 justify-center items-center p-4 bg-slate-900/60">
        <TouchableWithoutFeedback
          onPress={onClose}
          disabled={updateMutation.isPending}
        >
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>

        <View className="w-full max-w-xs bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <View className="p-4 pt-6 gap-3">
            {statuses.map((key) => {
              const config = STATUS_CONFIG[key];
              const isSelected = selectedStatus === key;
              const IconComponent = config.icon;

              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedStatus(key)}
                  disabled={updateMutation.isPending}
                  className={`flex-row items-center justify-between p-3 rounded-xl border  ${
                    isSelected
                      ? `${config.activeCardBorder} ${config.activeCardBg}`
                      : "border-slate-100 dark:border-slate-700"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`items-center justify-center w-8 h-8 rounded-full ${config.iconBg}`}
                    >
                      <IconComponent size={18} color={config.iconColor} />
                    </View>
                    <Text className="font-medium text-slate-900 dark:text-slate-100">
                      {config.label}
                    </Text>
                  </View>

                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? config.radioBorder
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isSelected && (
                      <View
                        className={`w-2.5 h-2.5 rounded-full ${config.radioFill}`}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="p-4 flex-row gap-3 border-t border-slate-100 dark:border-slate-700/50 mt-1">
            <TouchableOpacity
              onPress={onClose}
              disabled={updateMutation.isPending}
              className="flex-1 py-3 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700"
            >
              <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateMutation.mutate(selectedStatus)} // This triggers the mutation above
              disabled={updateMutation.isPending}
              className="flex-1 py-3 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30"
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-sm font-semibold text-white">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
