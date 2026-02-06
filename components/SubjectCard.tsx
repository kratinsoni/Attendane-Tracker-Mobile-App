import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Calendar, ArrowRight } from 'lucide-react-native';
import { CreateSubjectPayload } from '../types/subjectTypes';

// We extend the interface for UI-specific needs like attendance 
// that might not be in the "Create" payload but are in the "View"
interface SubjectCardProps extends CreateSubjectPayload {
  attendedClasses?: number;
  totalClasses?: number;
}

export const SubjectCard = ({
  _id,
  name,
  code,
  credits,
  type,
  Grading,
  professor,
  slots,
  attendedClasses = 0, // Default fallback
  totalClasses = 0,
}: SubjectCardProps) => {
  
  // Logic for dynamic styling based on your Tailwind config
  const isLab = type === 'LAB';
  const isCritical = attendedClasses < 75 && attendedClasses > 0;

  return (
    <View className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4 shadow-sm">
      {/* Header Section */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row gap-2 mb-1">
            <View className={`${isLab ? 'bg-emerald-50' : 'bg-primary/10'} px-2 py-0.5 rounded`}>
              <Text className={`text-[10px] font-bold tracking-widest uppercase ${isLab ? 'text-emerald-600' : 'text-primary'}`}>
                {type}
              </Text>
            </View>
            <View className="bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded">
              <Text className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
                {Grading}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white mt-1 leading-tight">
            {name}
          </Text>
          <Text className="text-xs text-gray-500 font-medium">
            {code} • {credits} Credits
          </Text>
        </View>

        {/* Progress Circle (Simplified for Native) */}
        <View className="items-end">
          <View className={`w-14 h-14 rounded-full border-4 items-center justify-center ${isCritical ? 'border-red-500' : 'border-primary'}`}>
            <Text className={`text-[11px] font-bold ${isCritical ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {attendedClasses}%
            </Text>
          </View>
          <Text className={`text-[10px] mt-1 italic ${isCritical ? 'text-red-400' : 'text-gray-400'}`}>
            {isCritical ? 'Critical' : 'Good Standing'}
          </Text>
        </View>
      </View>

      {/* Details Grid */}
      <View className="flex-row py-3 border-y border-gray-50 dark:border-gray-800 my-3">
        <View className="flex-1 flex-row items-center gap-2">
          <User size={16} color="#9ca3af" />
          <View className="flex-1">
            <Text className="text-[10px] text-gray-400 leading-none">Professor</Text>
            <Text className="text-xs font-medium dark:text-gray-200" numberOfLines={1}>
              {professor}
            </Text>
          </View>
        </View>
        <View className="flex-1 flex-row items-center gap-2">
          <Calendar size={16} color="#9ca3af" />
          <View className="flex-1">
            <Text className="text-[10px] text-gray-400 leading-none">Slots</Text>
            <Text className="text-xs font-medium dark:text-gray-200" numberOfLines={1}>
              {slots.join(', ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer / Actions */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 items-center justify-center z-10">
            <Text className="text-[9px] font-bold">{professor.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-primary/20 -ml-2 items-center justify-center">
            <Text className="text-[9px] font-bold text-primary">{code.substring(0, 2)}</Text>
          </View>
        </View>
        
        <TouchableOpacity className="flex-row items-center gap-1 active:opacity-60">
          <Text className="text-primary text-sm font-semibold">View Logs</Text>
          <ArrowRight size={14} color="#1152d4" />
        </TouchableOpacity>
      </View>
    </View>
  );
};