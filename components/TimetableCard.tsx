import { TimetableCardType } from "@/types/timetableTypes";
import { router } from "expo-router";
import { Calendar, Edit2 } from "lucide-react-native";
import React, { useMemo } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

// const getRandomGradient = () => {
//   const gradients = [
//     "bg-blue-500",
//     "bg-emerald-500",
//     "bg-amber-500",
//     "bg-rose-500",
//     "bg-violet-500",
//     "bg-cyan-500",
//     "bg-fuchsia-500",
//   ];
//   return gradients[Math.floor(Math.random() * gradients.length)];
// };

export const TimetableCard = ({
  _id,
  name,
  semester,
  student: { _id: studentId, firstName, lastName },
  createdAt,
  updatedAt,
}: TimetableCardType) => {
  // const randomColor = React.useMemo(() => getRandomGradient(), []);

  const imageUrl = useMemo(() => {
    return `https://picsum.photos/seed/${_id}/400/200`;
  }, [_id]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`mb-4 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm`}
      onPress={() =>
        router.push({
          pathname: "/timetable/attendanceMarkingPage/[id]",
          params: { id: _id },
        })
      }
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        className="h-32 w-full justify-end"
        resizeMode="cover"
      >
        {/* Optional: Add a subtle overlay to make text/icons pop if needed */}
        <View className="absolute inset-0 bg-black/10" />
      </ImageBackground>

      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Last Modified:{" "}
              {updatedAt ? new Date(updatedAt).toLocaleString() : "N/A"}
            </Text>
            <Text className="mt-1 text-lg font-bold text-black dark:text-white ">
              {name}
            </Text>
          </View>
          <TouchableOpacity
            className="p-1"
            onPress={() =>
              router.push({
                pathname: "/timetable/editTimetable/[id]",
                params: { id: _id },
              })
            }
          >
            <Edit2 size={18} color="#616f89" />
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          {/* Left Side: Semester Info */}
          <View className="flex-row items-center">
            <Calendar size={16} color="#616f89" />
            <Text className="ml-2 text-sm text-slate-500 dark:text-slate-400">
              Semester: {semester}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              activeOpacity={0.8}
              className="rounded-lg bg-blue-600 px-5 py-2 shadow-sm active:bg-blue-700"
              onPress={() =>
                router.push({
                  pathname: "/timetable/editTimetable/[id]",
                  params: { id: _id },
                })
              }
            >
              <Text className="text-sm font-semibold text-white">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              className="rounded-lg bg-blue-600 px-5 py-2 shadow-sm active:bg-blue-700"
              onPress={() =>
                router.push({
                  pathname: "/timetable/[id]",
                  params: { id: _id },
                })
              }
            >
              <Text className="text-sm font-semibold text-white">View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
