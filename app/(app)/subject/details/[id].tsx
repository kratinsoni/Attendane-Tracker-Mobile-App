import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, isToday, isFuture } from 'date-fns';
import { clsx } from 'clsx';
import { 
  Check, 
  X, 
  Activity, 
  Ban, 
  MoreVertical, 
  MapPin, 
  User,
  Pencil,
  ChevronRight
} from 'lucide-react-native';

// Hooks & Types
import { useGetSubjectById } from '@/hooks/useGetSubjectById';
import { useGetAttendanceBySubject } from '@/hooks/useGetAttendanceBySubject';
import { useCreateAttendance } from '@/hooks/useCreateAttendance';
import { useUpdateAttendance } from '@/hooks/useUpdateAttendance';
import { AttendanceStatus } from '@/types/attendanceTypes';

// --- Types & Helpers ---

const getStatusColor = (status: string) => {
  switch (status) {
    case AttendanceStatus.PRESENT: return "text-green-500";
    case AttendanceStatus.ABSENT: return "text-red-500";
    case AttendanceStatus.MEDICAL: return "text-yellow-500";
    case AttendanceStatus.CANCELLED: return "text-slate-400";
    default: return "text-slate-400";
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case AttendanceStatus.PRESENT: 
      return <View className="bg-green-500 h-6 w-6 rounded-full items-center justify-center"><Check size={14} color="white" strokeWidth={3} /></View>;
    case AttendanceStatus.ABSENT: 
      return <View className="bg-red-500 h-6 w-6 rounded-full items-center justify-center"><X size={14} color="white" strokeWidth={3} /></View>;
    case AttendanceStatus.MEDICAL: 
      return <View className="bg-yellow-500 h-6 w-6 rounded-full items-center justify-center"><Activity size={14} color="white" strokeWidth={3} /></View>;
    case AttendanceStatus.CANCELLED: 
      return <View className="bg-slate-400 h-6 w-6 rounded-full items-center justify-center"><Ban size={14} color="white" strokeWidth={3} /></View>;
    default: // Unmarked / Future
      return <View className="bg-white dark:bg-slate-900 border-2 border-green-500 h-4 w-4 rounded-full" />;
  }
};

// --- Components ---

/**
 * Modal for editing PAST attendance records
 */
const AttendanceEditModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  currentStatus,
  isLoading 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSelect: (status: string) => void;
  currentStatus: string;
  isLoading: boolean;
}) => {
  if (!visible) return null;

  const options = [
    { label: "Present", value: AttendanceStatus.PRESENT, color: "text-green-500", icon: Check },
    { label: "Absent", value: AttendanceStatus.ABSENT, color: "text-red-500", icon: X },
    { label: "Medical", value: AttendanceStatus.MEDICAL, color: "text-yellow-500", icon: Activity },
    { label: "Cancelled", value: AttendanceStatus.CANCELLED, color: "text-slate-400", icon: Ban },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end sm:justify-center items-center" onPress={onClose}>
        <Pressable className="bg-white dark:bg-[#1C1C1E] w-full sm:w-80 rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 gap-4" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Edit Status</Text>
            {isLoading && <ActivityIndicator size="small" />}
          </View>
          
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                disabled={isLoading}
                className={clsx(
                  "w-[48%] items-center justify-center p-4 rounded-2xl border-2",
                  currentStatus === opt.value 
                    ? "bg-slate-50 dark:bg-slate-800 border-indigo-500" 
                    : "bg-slate-50 dark:bg-slate-800 border-transparent"
                )}
              >
                <opt.icon size={28} className={opt.color} />
                <Text className={clsx("mt-2 font-semibold", currentStatus === opt.value ? "text-indigo-500" : "text-slate-600 dark:text-slate-300")}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default function SubjectDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // --- Data Fetching ---
  const { data: subject, isLoading: isSubjectLoading } = useGetSubjectById(id);
  const { data: attendanceData, isLoading: isAttendanceLoading } = useGetAttendanceBySubject(id);

  // --- Mutations ---
  const createMutation = useCreateAttendance({ timetableId: id, date: new Date().toISOString() });
  const updateMutation = useUpdateAttendance();

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    if (!attendanceData) return { percentage: 0, attended: 0, total: 0 };
    
    // Total classes = Present + Absent + Medical (excluding cancelled/unmarked for denominator usually, 
    // but based on UI "12/15", it implies Unmarked might count as "Total" but not "Attended")
    // Let's assume Total = All records that are not Cancelled.
    const validRecords = attendanceData.filter((r: any) => r.type !== AttendanceStatus.CANCELLED);
    
    // Attended = Present + Medical
    const attended = validRecords.filter((r: any) => 
      r.type === AttendanceStatus.PRESENT || r.type === AttendanceStatus.MEDICAL
    ).length;
    
    // In many systems, "Unmarked" counts towards total (lowering percentage until marked).
    // If you want "Unmarked" to NOT count yet, filter them out of 'validRecords'.
    // Here we include them in total to match standard strict attendance policies.
    const total = validRecords.length;
    
    return {
      attended,
      total,
      percentage: total > 0 ? Math.round((attended / total) * 100) : 0
    };
  }, [attendanceData]);

  // --- Handlers ---

  const handleCreateAttendance = (item: any, status: string) => {
    console.log(item);
    createMutation.mutate({
      subjectId: item.subject || id,
      day: item.day,
      type: status,
      timeSlot: item.timeSlot,
      date: item.date,
      semester: item.semester || subject?.semester || 0,
    });
  };

  const handleEditPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedItem) return;
    updateMutation.mutate({
      attendanceId: selectedItem._id,
      type: newStatus,
      subjectId: id,
    }, {
      onSuccess: () => setModalVisible(false)
    });
  };

  // --- Sorting ---
  const sortedAttendance = useMemo(() => {
    if (!attendanceData) return [];
    // Sort descending by date
    return [...attendanceData].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [attendanceData]);

  if (isSubjectLoading || isAttendanceLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#0f172a]">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-[#0f172a]">
      <Stack.Screen options={{ 
        headerTitle: "Subject Details", 
        headerStyle: { backgroundColor: isDark ? '#0f172a' : '#F5F7FA' },
        headerTintColor: isDark ? '#fff' : '#000',
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: 'bold' }
      }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* ================= HEADER CARD ================= */}
        <View className="mx-4 mt-2 bg-white dark:bg-[#151F32] rounded-3xl p-5 shadow-sm shadow-slate-200 dark:shadow-none">
          {/* Title Row */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {subject?.name || "Subject Name"}
              </Text>
              <View className="flex-row items-center gap-2 mb-4">
                <View className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase">THEORY</Text>
                </View>
                <Text className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  {subject?.code || "CODE123"}
                </Text>
              </View>
            </View>
          </View>

          {/* Details Grid */}
          <View className="flex-row mb-6">
            <View className="mr-8">
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">GRADING</Text>
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">Relative</Text>
            </View>
            <View className="mr-8">
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">CREDITS</Text>
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{subject?.credits || 4}</Text>
            </View>
            <View>
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">VENUE</Text>
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{subject?.venue || "NR212"}</Text>
            </View>
          </View>

          {/* Professors */}
          <View className="mb-6">
            <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">PROFESSORS</Text>
            {subject?.professors?.map((prof: string, idx: number) => (
              <View key={idx} className="flex-row items-center mb-2">
                 <View className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-2">
                    <User size={14} className="text-indigo-600 dark:text-indigo-300" />
                 </View>
                 <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">{prof.startsWith('Dr.') || prof.startsWith('Prof.') ? prof : `Prof. ${prof}`}</Text>
              </View>
            )) || (
              <Text className="text-sm text-slate-400">No professors assigned</Text>
            )}
             <Text className="text-xs text-green-500 font-medium mt-1">Show more...</Text>
          </View>

          {/* Attendance Stats */}
          <View className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <View className="flex-row justify-between items-end mb-2">
              <View>
                 <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">ATTENDANCE</Text>
                 <Text className="text-4xl font-black text-slate-900 dark:text-white">{stats.percentage}%</Text>
              </View>
              <View className="items-end mb-1">
                 <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">CLASSES</Text>
                 <Text className="text-xl font-bold text-slate-700 dark:text-slate-300">
                    {stats.attended} <Text className="text-slate-400 text-base">/ {stats.total}</Text>
                 </Text>
              </View>
            </View>
            {/* Progress Bar */}
            <View className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
               <View 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${stats.percentage}%` }}
               />
            </View>
          </View>
        </View>

        {/* ================= HISTORY SECTION ================= */}
        <View className="px-6 mt-8 mb-4 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Attendance History</Text>
          <View className="flex-row items-center">
             <Text className="text-xs text-slate-500 dark:text-slate-400 mr-1">All Classes</Text>
             {/* Filter icon could go here */}
          </View>
        </View>

        <View className="px-4">
          {sortedAttendance.map((item: any, index: number) => {
            const date = parseISO(item.date);
            const isUnmarked = item.type === 'UNMARKED';
            const isLast = index === sortedAttendance.length - 1;

            // Generate a Lecture Title since API doesn't have it (Simulated)
            const lectureNumber = attendanceData.length - index;
            // Basic logic: If Unmarked, assume it's the current/next class
            const title = isUnmarked 
              ? `Lecture ${lectureNumber}: Current Session` 
              : `Lecture ${lectureNumber}: Class Session`; 

            const dateString = isToday(date) ? `Today, ${item.timeSlot?.split('_')[1] || '10:00 AM'}` : format(date, 'EEEE, dd MMM');

            return (
              <View key={item._id} className="flex-row">
                
                {/* Timeline Column */}
                <View className="w-8 items-center mr-3">
                  {/* Vertical Line */}
                  <View className={clsx(
                    "absolute top-0 bottom-0 w-[2px]",
                    isLast ? "h-6" : "h-full", // Cut line short for last item
                    index === 0 && isUnmarked ? "bg-green-200 dark:bg-green-900" : "bg-slate-200 dark:bg-slate-700",
                    index === 0 && !isUnmarked ? "mt-4" : "" // Adjust top for first item
                  )} />
                  
                  {/* Dot */}
                  <View className="mt-1 relative z-10">
                    {getStatusDot(item.type)}
                  </View>
                </View>

                {/* Content Column */}
                <View className="flex-1 pb-6">
                  
                  {/* Case 1: UNMARKED (Active Card with Buttons) */}
                  {isUnmarked ? (
                    <View>
                      <View className="flex-row justify-between items-start">
                         <View>
                            <Text className="text-base font-bold text-slate-800 dark:text-white mb-0.5">
                               {title}
                            </Text>
                            <Text className="text-xs text-slate-400 font-medium mb-3">{dateString}</Text>
                         </View>
                         <View className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                             <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Unmarked</Text>
                         </View>
                      </View>

                      {/* Action Buttons Row */}
                      <View className="flex-row justify-between mt-1">
                        {[
                          { label: 'PRESENT', icon: Check, status: 'PRESENT', color: 'text-green-500' },
                          { label: 'ABSENT', icon: X, status: 'ABSENT', color: 'text-red-500' },
                          { label: 'MEDICAL', icon: Activity, status: 'MEDICAL', color: 'text-yellow-500' },
                          { label: 'CANCEL', icon: Ban, status: 'CANCELLED', color: 'text-slate-400' },
                        ].map((btn) => (
                          <TouchableOpacity 
                            key={btn.status}
                            onPress={() => handleCreateAttendance(item, btn.status)}
                            disabled={createMutation.isPending}
                            className="items-center bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-slate-700 rounded-xl p-2 w-[23%] shadow-sm"
                          >
                            <View className={clsx("w-8 h-8 rounded-full items-center justify-center mb-1", 
                              btn.status === 'PRESENT' && "bg-green-100 dark:bg-green-900/30",
                              btn.status === 'ABSENT' && "bg-red-100 dark:bg-red-900/30",
                              btn.status === 'MEDICAL' && "bg-yellow-100 dark:bg-yellow-900/30",
                              btn.status === 'CANCELLED' && "bg-slate-100 dark:bg-slate-800",
                            )}>
                              <btn.icon size={16} className={btn.color} strokeWidth={2.5} />
                            </View>
                            <Text className={clsx("text-[9px] font-bold uppercase", btn.color)}>
                              {btn.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : (
                    // Case 2: HISTORY (Past Record)
                    <View className="flex-row items-center justify-between">
                       <View>
                          <Text className="text-base font-bold text-slate-800 dark:text-white">
                             {title}
                          </Text>
                          <View className="flex-row items-center mt-1">
                             <Text className="text-xs text-slate-500 dark:text-slate-400 mr-2">{dateString}</Text>
                             <View className="flex-row items-center">
                                <View className={clsx("w-1.5 h-1.5 rounded-full mr-1", 
                                  item.type === 'PRESENT' ? "bg-green-500" : 
                                  item.type === 'ABSENT' ? "bg-red-500" : "bg-slate-400"
                                )} />
                                <Text className={clsx("text-xs font-semibold capitalize", getStatusColor(item.type))}>
                                   {item.type.toLowerCase()}
                                </Text>
                             </View>
                          </View>
                       </View>
                       
                       <TouchableOpacity 
                          onPress={() => handleEditPress(item)}
                          className="p-2"
                       >
                          <Pencil size={16} className="text-slate-300 dark:text-slate-600" />
                       </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* --- Action Modal (For Editing) --- */}
      <AttendanceEditModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onSelect={handleUpdateStatus}
        currentStatus={selectedItem?.type}
        isLoading={updateMutation.isPending}
      />
    </SafeAreaView>
  );
}