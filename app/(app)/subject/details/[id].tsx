import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { 
  Check, 
  X, 
  Activity, 
  Ban, 
  User,
  Pencil,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Edit,
} from 'lucide-react-native';

// Hooks & Types
import { useGetSubjectById } from '@/hooks/useGetSubjectById';
import { useGetAttendanceBySubject } from '@/hooks/useGetAttendanceBySubject';
import { useCreateAttendanceForSubjectPage } from '@/hooks/useCreateAttendance';
import { useUpdateAttendance } from '@/hooks/useUpdateAttendance';
import { AttendanceStatus } from '@/types/attendanceTypes';
import { useQueryClient } from '@tanstack/react-query';

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
    case 'MIXED': // Used when a grouped item has partial/mixed attendance
      return <View className="bg-slate-200 dark:bg-slate-700 h-6 w-6 rounded-full items-center justify-center"><View className="bg-slate-400 dark:bg-slate-500 h-2 w-2 rounded-full" /></View>;
    default: // Unmarked / Future
      return <View className="bg-white dark:bg-slate-900 border-2 border-green-500 h-4 w-4 rounded-full" />;
  }
};

const formatGroupTime = (group: any[]) => {
  if (!group || group.length === 0) return { timeString: '', hours: 0 };
  const startSlot = group[0].timeSlot.split('_')[1].split('-')[0];
  const endSlot = group[group.length - 1].timeSlot.split('_')[1].split('-')[1];
  return {
    timeString: `${startSlot} - ${endSlot}`,
    hours: group.length
  };
};

// --- Components ---

/**
 * Modal for editing PAST attendance records (Handles Group Bulk & Partial Edits)
 */
const AttendanceEditModal = ({ 
  visible, 
  onClose, 
  selectedGroup,
  onUpdateBulk,
  onUpdateSingle,
  isLoading 
}: { 
  visible: boolean; 
  onClose: () => void; 
  selectedGroup: any[] | null;
  onUpdateBulk: (group: any[], status: string) => void;
  onUpdateSingle: (item: any, status: string) => void;
  isLoading: boolean;
}) => {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset internal expand state whenever group changes
  useEffect(() => {
    if (!visible) {
      setIsExpanded(false);
    }
  }, [visible]);

  if (!visible || !selectedGroup) return null;

  const isGroup = selectedGroup.length > 1;
  const allTypes = selectedGroup.map(item => item.type);
  const isUniform = allTypes.every(t => t === allTypes[0]);
  const parentStatus = isUniform ? allTypes[0] : 'MIXED';

  const options = [
    { label: "Present", value: AttendanceStatus.PRESENT, color: "text-green-500", icon: Check },
    { label: "Absent", value: AttendanceStatus.ABSENT, color: "text-red-500", icon: X },
    { label: "Medical", value: AttendanceStatus.MEDICAL, color: "text-yellow-500", icon: Activity },
    { label: "Cancelled", value: AttendanceStatus.CANCELLED, color: "text-slate-400", icon: Ban },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end sm:justify-center items-center" onPress={onClose}>
        <Pressable className="bg-white dark:bg-[#1C1C1E] w-full sm:w-80 rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 gap-4 max-h-[90%]" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              Edit Status {isGroup && `(${selectedGroup.length} Slots)`}
            </Text>
            {isLoading && <ActivityIndicator size="small" />}
          </View>

          {/* Bulk Update Controls (Parent Level) */}
          <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
            {isGroup ? "Apply to all slots:" : "Select status:"}
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-4 mb-2">
            {options.map((opt) => (
              <TouchableOpacity
                key={`bulk-${opt.value}`}
                onPress={() => onUpdateBulk(selectedGroup, opt.value)}
                disabled={isLoading}
                className={clsx(
                  "w-[48%] items-center justify-center p-4 rounded-2xl border-2",
                  parentStatus === opt.value 
                    ? "bg-slate-50 dark:bg-slate-800 border-indigo-500" 
                    : "bg-slate-50 dark:bg-slate-800 border-transparent"
                )}
              >
                <opt.icon size={28} color={iconColor} />
                <Text className={clsx("mt-2 font-semibold", parentStatus === opt.value ? "text-indigo-500" : "text-slate-600 dark:text-slate-300")}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Expand for Partial Editing */}
          {isGroup && (
            <View className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
              <TouchableOpacity 
                onPress={() => setIsExpanded(!isExpanded)}
                className="flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl"
              >
                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Edit Slots Individually
                </Text>
                {isExpanded ? <ChevronUp size={18} color={iconColor} /> : <ChevronDown size={18} color={iconColor} />}
              </TouchableOpacity>

              {isExpanded && (
                <ScrollView className="mt-4 max-h-60" showsVerticalScrollIndicator={false}>
                  {selectedGroup.map((item, index) => (
                    <View key={index} className="mb-4">
                      <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        {item.timeSlot.split('_')[1]}
                      </Text>
                      <View className="flex-row flex-wrap justify-between gap-y-2">
                        {options.map((opt) => (
                          <TouchableOpacity
                            key={`${item._id}-${opt.value}`}
                            onPress={() => onUpdateSingle(item, opt.value)}
                            disabled={isLoading}
                            className={clsx(
                              "w-[23%] items-center justify-center p-2 rounded-xl border-2",
                              item.type === opt.value 
                                ? "bg-slate-100 dark:bg-slate-700 border-indigo-500" 
                                : "bg-white dark:bg-[#151F32] border-transparent"
                            )}
                          >
                            <opt.icon size={16} color={iconColor} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};


/**
 * Modal for selecting Semester
 */
const SemesterFilterModal = ({ visible, onClose, onSelect, semesters, currentSemester }: any) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end sm:justify-center items-center" onPress={onClose}>
        <Pressable className="bg-white dark:bg-[#1C1C1E] w-full sm:w-80 rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 gap-4" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Select Semester</Text>
          </View>
          <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {semesters.map((sem: number) => (
                <TouchableOpacity
                  key={sem}
                  onPress={() => { onSelect(sem); onClose(); }}
                  className={clsx(
                    "w-[48%] items-center justify-center p-3 rounded-xl border-2",
                    currentSemester === sem
                      ? "bg-slate-50 dark:bg-slate-800 border-indigo-500"
                      : "bg-slate-50 dark:bg-slate-800 border-transparent"
                  )}
                >
                  <Text className={clsx("font-semibold", currentSemester === sem ? "text-indigo-500" : "text-slate-600 dark:text-slate-300")}>
                    Semester {sem}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default function SubjectDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  const [modalVisible, setModalVisible] = useState(false);
  const [semesterModalVisible, setSemesterModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any[] | null>(null);
  const [expandedTimelineGroups, setExpandedTimelineGroups] = useState<Record<number, boolean>>({});
  const [isShowMore, setIsShowMore] = useState(false);
  const [semester, setSemester] = useState<number>(0);

  // --- Data Fetching ---
  const { data: subject, isLoading: isSubjectLoading } = useGetSubjectById(id);
  const { data: semesters, isLoading: isSemestersLoading } = useGetAttendanceBySubject(id, -1);
  const { data: attendanceDataGrouped, isLoading: isAttendanceLoading, refetch: refetchAttendance } = useGetAttendanceBySubject(id, semester);

  // --- Mutations ---
  const {mutate: createAttendance, isPending: isCreatePending} = useCreateAttendanceForSubjectPage({ date: new Date().toISOString() });
  const updateMutation = useUpdateAttendance();

  const queryClient = useQueryClient();
  
  // --- Flatten Data for logic & stats ---
  const flatAttendance = useMemo(() => {
    return attendanceDataGrouped?.flat() || [];
  }, [attendanceDataGrouped]);

  useEffect(() => {
    if (semesters?.length > 0) {
      setSemester(semesters.at(-1));
    }
  }, [semesters]);

  const stats = useMemo(() => {
    if (flatAttendance.length === 0) return { percentage: 0, attended: 0, total: 0 };

    const validRecords = flatAttendance.filter((r: any) => (r.type !== AttendanceStatus.CANCELLED && r.type !== AttendanceStatus.UNMARKED));
    const attended = validRecords.filter((r: any) => r.type === AttendanceStatus.PRESENT || r.type === AttendanceStatus.MEDICAL)?.length;
    const total = validRecords?.length;
    
    return {
      attended,
      total,
      percentage: total > 0 ? Math.round((attended / total) * 100) : 0
    };
  }, [flatAttendance]);

  const filteredProfessors = useMemo(() => {
    if (isShowMore) return subject?.professors;  
    else return subject?.professors?.slice(0, 2);
  }, [isShowMore, subject?.professors]);

  // --- Handlers ---
  const toggleTimelineExpand = (index: number) => {
    setExpandedTimelineGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCreateAttendanceBulk = (group: any[], status: string) => {
    group.forEach(item => {
      createAttendance({
        subjectId: item.subject || id,
        day: item.day,
        type: status,
        timeSlot: item.timeSlot,
        date: item.date,
        semester: item.semester || subject?.semester || 0,
      });
    });
    setTimeout(() => refetchAttendance(), 300); // Trigger refetch after loop finishes
  };

  const handleCreateAttendanceSingle = (item: any, status: string) => {
    createAttendance({
      subjectId: item.subject || id,
      day: item.day,
      type: status,
      timeSlot: item.timeSlot,
      date: item.date,
      semester: item.semester || subject?.semester || 0,
    });
    setTimeout(() => refetchAttendance(), 300);
  };

  const handleEditGroupPress = (group: any[]) => {
    setSelectedGroup(group);
    setModalVisible(true);
  };

  const handleUpdateStatusBulk = (group: any[], newStatus: string) => {
    group.forEach(item => {
      updateMutation.mutate({
        attendanceId: item._id,
        type: newStatus,
        subjectId: id,
      });
    });
    setModalVisible(false);
  };

  const handleUpdateStatusSingle = (item: any, newStatus: string) => {
    setSelectedGroup((prevGroup) => {
      if (!prevGroup) return null;
      return prevGroup.map((g) => 
        g._id === item._id ? { ...g, type: newStatus } : g
      );
    });
    
    updateMutation.mutate({
      attendanceId: item._id,
      type: newStatus,
      subjectId: id,
    }, {
      onSuccess: () => {
        setModalVisible(false)
        queryClient.invalidateQueries({ queryKey: ["attendanceStats"]})
      }
    });
    // Let user stay in modal to edit others if expanded
  };

  // --- Sorting / Loading ---
  if (isSubjectLoading || isAttendanceLoading || isSemestersLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F7FA] dark:bg-[#09101f]">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-[#09101f]">

      {/* ================= TOP ACTION BUTTONS ================= */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#151F32] items-center justify-center shadow-sm shadow-slate-200 dark:shadow-none"
        >
          <ChevronLeft size={24} color={iconColor} className="mr-0.5" />
        </TouchableOpacity>
        
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
            Subject Details
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push(`/subject/update/${id}`)}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#151F32] items-center justify-center shadow-sm shadow-slate-200 dark:shadow-none"
        >
          <Edit size={22} color={iconColor} className="ml-0.5" />
        </TouchableOpacity>
      </View>

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
            {filteredProfessors?.map((prof: string, idx: number) => (
              <View key={idx} className="flex-row items-center mb-2">
                 <View className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-2">
                    <User size={14} className="text-indigo-600 dark:text-indigo-300" />
                 </View>
                 <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">{prof.startsWith('Dr.') || prof.startsWith('Prof.') ? prof : `Prof. ${prof}`}</Text>
              </View>
            )) || (
              <Text className="text-sm text-slate-400">No professors assigned</Text>
            )}
              {
                (subject?.professors && subject?.professors?.length > 2) && (
                  <TouchableOpacity onPress={() => setIsShowMore(!isShowMore)}>
                    <Text className="text-xs text-green-500 font-medium mt-1">
                      {isShowMore ? "Show less...": "Show more..."}
                    </Text>
                  </TouchableOpacity>
                )
              }
          </View>

          {/* Attendance Stats */}
           <View className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-6">
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
             <View className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <View className="h-full bg-green-500 rounded-full" style={{ width: `${stats.percentage}%` }}/>
             </View>
           </View>
        </View>

        {/* ================= HISTORY SECTION ================= */}
        <View className="px-6 mt-8 mb-4 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Attendance History</Text>
          {semester !== 0 && (
            <TouchableOpacity onPress={() => setSemesterModalVisible(true)} className="flex-row items-center bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
             <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">Semester {semester}</Text>
             <ChevronDown size={14} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {semester === 0 ? (
          <View className="px-6 py-8 items-center justify-center">
            <Text className="text-base text-slate-500 dark:text-slate-400 font-medium text-center">This subject is not added to any timetables yet.</Text>
          </View>
        ) : !attendanceDataGrouped || attendanceDataGrouped.length === 0 ? (
          <View className="px-6 py-8 items-center justify-center">
            <Text className="text-base text-slate-500 dark:text-slate-400 font-medium text-center">No attendance marked yet.</Text>
          </View>
        ) : (
          <View className="px-4">
            {attendanceDataGrouped?.map((group: any[], groupIndex: number) => {
              
              const isLastGroup = groupIndex === attendanceDataGrouped.length - 1;
              const firstItem = group[0];
              const date = parseISO(firstItem.date);
              
              // Group Evaluations
              const allTypes = group.map(g => g.type);
              const isUniform = allTypes.every(t => t === allTypes[0]);
              const overallType = isUniform ? allTypes[0] : 'MIXED';
              const isUnmarked = overallType === 'UNMARKED';

              const { timeString, hours } = formatGroupTime(group);
              const lectureNumber = attendanceDataGrouped.length - groupIndex;
              const title = `Class ${lectureNumber}`; 
              const dateString = isToday(date) ? `Today` : format(date, 'EEEE, dd MMM');
              const isTimelineExpanded = expandedTimelineGroups[groupIndex] || overallType === 'MIXED';

              return (
                <View key={groupIndex} className="flex-row">
                  
                  {/* Timeline Column */}
                  <View className="w-8 items-center mr-3">
                    <View className={clsx(
                      "absolute top-0 bottom-0 w-[2px]",
                      isLastGroup ? "h-6" : "h-full", 
                      groupIndex === 0 && isUnmarked ? "bg-green-200 dark:bg-green-900" : "bg-slate-200 dark:bg-slate-700",
                      groupIndex === 0 && !isUnmarked ? "mt-4" : "" 
                    )} />
                    
                    {/* Dot Parent: Show dot only if Uniform (Not MIXED). If Mixed, show neutral grouping indicator */}
                    <View className="mt-1 relative z-10">
                      {getStatusDot(overallType)}
                    </View>
                  </View>

                  {/* Content Column */}
                  <View className="flex-1 pb-6">
                    
                    {/* --- PARENT HEADER --- */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                          <Text className="text-base font-bold text-slate-800 dark:text-white mb-0.5">
                            {title}
                          </Text>
                          <View className="flex-row items-center mt-1 mb-2">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mr-2">{dateString} • {timeString} ({hours} hr{hours>1 ? 's':''}) </Text>
                            
                            {/* Uniform Status label (Only shown if uniform past record) */}
                            {!isUnmarked && isUniform && overallType !== 'MIXED' && (
                              <View className="flex-row items-center">
                                  <View className={clsx("w-1.5 h-1.5 rounded-full mr-1", 
                                    overallType === 'PRESENT' ? "bg-green-500" : 
                                    overallType === 'ABSENT' ? "bg-red-500" : "bg-slate-400"
                                  )} />
                                  <Text className={clsx("text-xs font-semibold capitalize", getStatusColor(overallType))}>
                                    {overallType.toLowerCase()}
                                  </Text>
                              </View>
                            )}
                          </View>
                      </View>
                      
                      {/* Expansion & Edit Actions */}
                      <View className="flex-row items-center gap-x-2">
                        {/* Expand Button for Unmarked/Uniform Groups (Mixed groups auto-expand) */}
                        {group.length > 1 && overallType !== 'MIXED' && (
                          <TouchableOpacity 
                            onPress={() => toggleTimelineExpand(groupIndex)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"
                          >
                            {isTimelineExpanded ? <ChevronUp size={16} color={iconColor} /> : <ChevronDown size={16} color={iconColor} />}
                          </TouchableOpacity>
                        )}

                        {/* Edit Button for any past group (uniform or mixed) */}
                        {!isUnmarked && (
                          <TouchableOpacity onPress={() => handleEditGroupPress(group)} className="p-2">
                              <Pencil size={16} color={iconColor}/>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* --- MAIN UNMARKED CONTROLS (BULK) --- */}
                    {isUnmarked && !isTimelineExpanded && (
                      <View className="flex-row justify-between mt-1">
                        {[
                          { label: 'PRESENT', icon: Check, status: 'PRESENT', color: 'text-green-500' },
                          { label: 'ABSENT', icon: X, status: 'ABSENT', color: 'text-red-500' },
                          { label: 'MEDICAL', icon: Activity, status: 'MEDICAL', color: 'text-yellow-500' },
                          { label: 'CANCEL', icon: Ban, status: 'CANCELLED', color: 'text-slate-400' },
                        ].map((btn) => (
                          <TouchableOpacity 
                            key={btn.status}
                            onPress={() => handleCreateAttendanceBulk(group, btn.status)}
                            disabled={isCreatePending}
                            className="items-center bg-white dark:bg-[#151F32] border border-slate-100 dark:border-slate-700 rounded-xl p-2 w-[23%] shadow-sm"
                          >
                            <View className={clsx("w-8 h-8 rounded-full items-center justify-center mb-1", 
                              btn.status === 'PRESENT' && "bg-green-500",
                              btn.status === 'ABSENT' && "bg-red-500",
                              btn.status === 'MEDICAL' && "bg-yellow-500",
                              btn.status === 'CANCELLED' && "bg-slate-500",
                            )}>
                              <btn.icon size={16} className={btn.color} strokeWidth={2.5} color={"white"}/>
                            </View>
                            <Text className={clsx("text-[9px] font-bold uppercase", btn.color)}>{btn.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* --- SUB-TIMELINE (For Mixed or Expanded Views) --- */}
                    {isTimelineExpanded && (
                      <View className="mt-2 pl-3 border-l-2 border-slate-100 dark:border-slate-800 gap-y-3">
                        {group.map((child, childIndex) => {
                           const childUnmarked = child.type === 'UNMARKED';
                           return (
                             <View key={childIndex} className="bg-slate-50 dark:bg-[#151F32] p-3 rounded-2xl flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                  {getStatusDot(child.type)}
                                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-3">
                                    {child.timeSlot.split('_')[1]}
                                  </Text>
                                </View>

                                {/* Partial Unmarked Marking Logic */}
                                {childUnmarked ? (
                                  <View className="flex-row gap-x-1">
                                    {['PRESENT', 'ABSENT', 'MEDICAL', 'CANCELLED'].map((stat) => (
                                      <TouchableOpacity 
                                        key={stat}
                                        onPress={() => handleCreateAttendanceSingle(child, stat)}
                                        className={clsx(
                                          "w-8 h-8 rounded-lg items-center justify-center border mx-1",
                                          stat === 'PRESENT' ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-700' :
                                          stat === 'ABSENT' ? 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-700' :
                                          stat === 'MEDICAL' ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-700' :
                                          /* Styling for CANCELLED */
                                          'bg-slate-100 border-slate-500 dark:bg-slate-900/30 dark:border-slate-700' 
                                        )}
                                      >
                                        {stat === 'PRESENT' && <Check size={14} color={colorScheme==='dark'?'#4ade80':'#22c55e'} />}
                                        {stat === 'ABSENT' && <X size={14} color={colorScheme==='dark'?'#f87171':'#ef4444'} />}
                                        {stat === 'MEDICAL' && <Activity size={14} color={colorScheme==='dark'?'#facc15':'#eab308'} />}
                                        {stat === 'CANCELLED' && <Ban size={14} color={colorScheme==='dark'?'#94a3b8':'#64748b'} />}
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                ) : (
                                  <View className="flex-row items-center">
                                    <Text className={clsx("text-xs font-bold mr-3", getStatusColor(child.type))}>
                                      {child.type}
                                    </Text>
                                  </View>
                                )}
                             </View>
                           )
                        })}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* --- Group Actions Modal (For Editing) --- */}
      <AttendanceEditModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        selectedGroup={selectedGroup}
        onUpdateBulk={handleUpdateStatusBulk}
        onUpdateSingle={handleUpdateStatusSingle}
        isLoading={updateMutation.isPending}
      />

      {/* --- Filter Modal --- */}
      <SemesterFilterModal 
        visible={semesterModalVisible}
        onClose={() => setSemesterModalVisible(false)}
        onSelect={(sem: number) => setSemester(sem)}
        semesters={semesters}
        currentSemester={semester}
      />
    </SafeAreaView>
  );
}

