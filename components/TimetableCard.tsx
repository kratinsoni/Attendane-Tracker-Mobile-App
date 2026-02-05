import { Archive, Calendar, Edit2 } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

export const TimetableCard = ({
  title,
  date,
  semester,
  gradientColor,
  isArchived = false,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className={`mb-4 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm ${isArchived ? "opacity-80" : ""}`}
  >
    {/* Decorative Header Area */}
    <View className={`h-32 w-full ${gradientColor} opacity-20`} />

    <View className="p-4">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Last Modified: {date}
          </Text>
          <Text
            className={`mt-1 text-lg font-bold ${isArchived ? "text-slate-500" : "text-slate-900 dark:text-white"}`}
          >
            {title}
          </Text>
        </View>
        <TouchableOpacity className="p-1">
          <Edit2 size={18} color="#616f89" />
        </TouchableOpacity>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {isArchived ? (
            <Archive size={16} color="#616f89" />
          ) : (
            <Calendar size={16} color="#616f89" />
          )}
          <Text className="ml-2 text-sm text-slate-500 dark:text-slate-400">
            {isArchived ? "Archived" : `Semester: ${semester}`}
          </Text>
        </View>

        <View
          className={`rounded-lg px-5 py-2 ${isArchived ? "bg-slate-200 dark:bg-slate-700" : "bg-blue-600"}`}
        >
          <Text
            className={`text-sm font-semibold ${isArchived ? "text-slate-600 dark:text-slate-300" : "text-white"}`}
          >
            View
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
