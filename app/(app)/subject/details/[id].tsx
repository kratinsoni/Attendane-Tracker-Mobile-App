import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Pressable, TextInput, Alert, RefreshControl, Animated, PanResponder } from 'react-native';
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
  Plus,
  Search,
  Trash2,
  ArrowDownUp
} from 'lucide-react-native';

// Hooks & Types
import { useGetSubjectById } from '@/hooks/useGetSubjectById';
import { useGetAttendanceBySubject } from '@/hooks/useGetAttendanceBySubject';
import { useCreateAttendanceForSubjectPage } from '@/hooks/useCreateAttendance';
import { useUpdateAttendance } from '@/hooks/useUpdateAttendance';
import { AttendanceStatus } from '@/types/attendanceTypes';
import { useQueryClient } from '@tanstack/react-query';

// Make sure you import your newly created hooks and types correctly based on your file structure
import { useCreateRecord } from '@/hooks/recordHooks/useCreateRecord';
import { useDeleteRecord } from '@/hooks/recordHooks/useDeleteRecord';
import { useUpdateRecord } from '@/hooks/recordHooks/useUpdateRecord';
import { useGetAllRecordsBySubjectAndSemester } from '@/hooks/recordHooks/useGetAllRecordsBySubjectAndSemester';
import { RecordInterface } from '@/types/recordTypes'; // <-- Update path if necessary

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
 * Modal for creating and editing Records
 */
const RecordFormModal = ({
  visible,
  onClose,
  editingRecord,
  onSave,
  isLoading
}: {
  visible: boolean;
  onClose: () => void;
  editingRecord: RecordInterface | null;
  onSave: (data: { name: string; marksScored: number; marksTotal: number }) => void;
  isLoading: boolean;
}) => {
  const [name, setName] = useState('');
  const [marksScored, setMarksScored] = useState('');
  const [marksTotal, setMarksTotal] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setName(editingRecord.name);
      setMarksScored(String(editingRecord.marksScored));
      setMarksTotal(String(editingRecord.marksTotal));
    } else {
      setName('');
      setMarksScored('');
      setMarksTotal('');
    }
  }, [editingRecord, visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end sm:justify-center items-center" onPress={onClose}>
        <Pressable className="bg-white dark:bg-[#1C1C1E] w-full sm:w-80 rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 gap-4" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              {editingRecord ? "Edit Record" : "New Record"}
            </Text>
            {isLoading && <ActivityIndicator size="small" color="#4f46e5" />}
          </View>

          <View className="gap-y-4">
            <View>
              <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1.5">Record Name</Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700"
                placeholder="e.g. Midterm 1"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="flex-row gap-x-4">
              <View className="flex-1">
                <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1.5">Marks Scored</Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={marksScored}
                  onChangeText={setMarksScored}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1.5">Total Marks</Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700"
                  placeholder="100"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={marksTotal}
                  onChangeText={setMarksTotal}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => onSave({ name, marksScored: Number(marksScored), marksTotal: Number(marksTotal) })}
            disabled={isLoading || !name || !marksScored || !marksTotal}
            className="bg-indigo-500 mt-2 py-3.5 rounded-xl items-center disabled:opacity-50"
          >
            <Text className="text-white font-bold text-base">Save Record</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/**
 * Modal for editing PAST attendance records (Handles Group Bulk & Partial Edits & Swipe to Close)
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

  // Animation and gesture values for Swipe-to-close
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only take over if the user is swiping downwards with intent
        return gestureState.dy > 15 && gestureState.vy > 0.1;
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 1) {
          // Swipe exceeded threshold, animate out and close
          Animated.timing(panY, {
            toValue: 500, 
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          // Didn't swipe far enough, spring back into place
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0); // Reset animation state when modal opens
    } else {
      setIsExpanded(false);
    }
  }, [visible, panY]);

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
        <Animated.View 
          {...panResponder.panHandlers}
          style={{ transform: [{ translateY: panY }] }}
          className="bg-white dark:bg-[#1C1C1E] w-full sm:w-80 rounded-t-3xl sm:rounded-2xl p-6 pt-4 pb-10 sm:pb-6 gap-4 max-h-[90%]" 
        >
          {/* Pressable wrapper inside Animated.View stops closing when tapping modal body */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            
            {/* Drag handle indicator */}
            <View className="w-full items-center pb-4">
              <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </View>

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                Edit Status {isGroup && `(${selectedGroup.length} Slots)`}
              </Text>
              {isLoading && <ActivityIndicator size="small" />}
            </View>

            <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
              {isGroup ? "Apply to all slots:" : "Select status:"}
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-2">
              {options.map((opt) => (
                <TouchableOpacity
                  key={`bulk-${opt.value}`}
                  onPress={() => onUpdateBulk(selectedGroup, opt.value)}
                  // REMOVED disabled={isLoading} to allow sequential unblocked clicks
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
                              // REMOVED disabled={isLoading} to allow sequential unblocked clicks
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
        </Animated.View>
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

/**
 * Modal for Sorting Records
 */
const SortFilterModal = ({ visible, onClose, onSelect, currentSort }: any) => {
  if (!visible) return null;
  
  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Last Modified", value: "modified" },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end sm:justify-center items-center" onPress={onClose}>
        <Pressable className="bg-white dark:bg-[#1C1C1E] w-full sm:w-80 rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 gap-4" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Sort Records</Text>
          </View>
          <View className="gap-y-3">
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => { onSelect(option.value); onClose(); }}
                className={clsx(
                  "flex-row items-center justify-between p-4 rounded-xl border-2",
                  currentSort === option.value
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500"
                    : "bg-slate-50 dark:bg-slate-800 border-transparent"
                )}
              >
                <Text className={clsx("font-semibold", currentSort === option.value ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300")}>
                  {option.label}
                </Text>
                {currentSort === option.value && <Check size={18} color="#4f46e5" />}
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
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  const [modalVisible, setModalVisible] = useState(false);
  const [semesterModalVisible, setSemesterModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any[] | null>(null);
  const [editedSlots, setEditedSlots] = useState<Set<string>>(new Set());
  const [expandedTimelineGroups, setExpandedTimelineGroups] = useState<Record<number, boolean>>({});
  const [isShowMore, setIsShowMore] = useState(false);
  const [semester, setSemester] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  // --- Record Section State ---
  const [isRecordsExpanded, setIsRecordsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordInterface | null>(null);
  
  // New Sort State
  const [sortMethod, setSortMethod] = useState<'newest' | 'oldest' | 'modified'>('newest');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // --- Sequential Request Queue ---
  // This queue prevents the 500 API Error (WriteConflicts) by ensuring only one request hits the DB at a time
  const requestQueue = useRef<Promise<any>>(Promise.resolve());
  const enqueueMutation = (mutationFn: () => Promise<any>) => {
    requestQueue.current = requestQueue.current
      .then(mutationFn)
      .catch((err) => console.error("Queue mutation failed:", err));
  };

  // --- Data Fetching ---
  const { data: subject, isLoading: isSubjectLoading, refetch: refetchSubject } = useGetSubjectById(id);
  const { data: semesters, isLoading: isSemestersLoading, refetch: refetchSemesters } = useGetAttendanceBySubject(id, -1);
  const { data: attendanceDataGrouped, isLoading: isAttendanceLoading, refetch: refetchAttendance } = useGetAttendanceBySubject(id, semester);
  const { data: recordsData, isLoading: isRecordsLoading, refetch: refetchRecords } = useGetAllRecordsBySubjectAndSemester(id, semester);

  // --- Mutations ---
  const { mutateAsync: createAttendanceAsync, isPending: isCreatePending } = useCreateAttendanceForSubjectPage({ date: new Date().toISOString() });
  const { mutateAsync: updateAttendanceAsync, isPending: isUpdatePending } = useUpdateAttendance();
  const createRecordMutation = useCreateRecord();
  const updateRecordMutation = useUpdateRecord();
  const deleteRecordMutation = useDeleteRecord();

  const queryClient = useQueryClient();
  
  // --- Pull to Refresh Handler ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchSubject(),
      refetchSemesters(),
      refetchAttendance(),
      refetchRecords()
    ]);
    setRefreshing(false);
  }, [refetchSubject, refetchSemesters, refetchAttendance, refetchRecords]);

  // --- Flatten Data for logic & stats ---
  const flatAttendance = useMemo(() => {
    return attendanceDataGrouped?.flat() || [];
  }, [attendanceDataGrouped]);

  const sortedAndFilteredRecords = useMemo(() => {
    if (!recordsData) return [];
    let result = [...recordsData];
    
    // 1. Filter
    if (searchQuery) {
      result = result.filter((r: RecordInterface) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // 2. Sort (assuming RecordInterface has createdAt / updatedAt standard timestamps)
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const modA = a.updatedAt ? new Date(a.updatedAt).getTime() : dateA;
      const modB = b.updatedAt ? new Date(b.updatedAt).getTime() : dateB;

      if (sortMethod === 'newest') return dateB - dateA;
      if (sortMethod === 'oldest') return dateA - dateB;
      if (sortMethod === 'modified') return modB - modA;
      return 0;
    });

    return result;
  }, [recordsData, searchQuery, sortMethod]);

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

  // --- Handlers for Attendance (Queued) ---
  const toggleTimelineExpand = (index: number) => {
    setExpandedTimelineGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCreateAttendanceBulk = (group: any[], status: string) => {
    group.forEach(item => {
      enqueueMutation(() => createAttendanceAsync({
        subjectId: item.subject || id,
        day: item.day,
        type: status,
        timeSlot: item.timeSlot,
        date: item.date,
        semester: item.semester || subject?.semester || 0,
      }));
    });
    enqueueMutation(async () => {
      await refetchAttendance();
    });
  };

  const handleCreateAttendanceSingle = (item: any, status: string) => {
    enqueueMutation(async () => {
      await createAttendanceAsync({
        subjectId: item.subject || id,
        day: item.day,
        type: status,
        timeSlot: item.timeSlot,
        date: item.date,
        semester: item.semester || subject?.semester || 0,
      });
      await refetchAttendance();
    });
  };

  const handleEditGroupPress = (group: any[]) => {
    setSelectedGroup(group);
    setEditedSlots(new Set());
    setModalVisible(true);
  };

  const handleUpdateStatusBulk = (group: any[], newStatus: string) => {
    group.forEach(item => {
      enqueueMutation(() => updateAttendanceAsync({
        attendanceId: item._id,
        type: newStatus,
        subjectId: id,
      }));
    });
    
    enqueueMutation(async () => {
      await queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
      await refetchAttendance();
    });
    setModalVisible(false);
  };

  const handleUpdateStatusSingle = (item: any, newStatus: string) => {
    const newEditedSlots = new Set(editedSlots);
    newEditedSlots.add(item._id);
    setEditedSlots(newEditedSlots);

    // Optimistic local update
    setSelectedGroup((prevGroup) => {
      if (!prevGroup) return null;
      return prevGroup.map((g) => 
        g._id === item._id ? { ...g, type: newStatus } : g
      );
    });
    
    enqueueMutation(async () => {
      await updateAttendanceAsync({
        attendanceId: item._id,
        type: newStatus,
        subjectId: id,
      });
      
      if (selectedGroup && newEditedSlots.size >= selectedGroup.length) {
        setModalVisible(false);
      }
      await queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
      await refetchAttendance();
    });
  };

  // --- Handlers for Records ---
  const handleSaveRecord = (data: { name: string; marksScored: number; marksTotal: number }) => {
    const payload = {
      ...data,
      semester,
      subject: id,
    };

    if (editingRecord) {
      updateRecordMutation.mutate(
        { data: payload, recordId: editingRecord._id }, 
        { onSuccess: () => setRecordModalVisible(false) }
      );
    } else {
      createRecordMutation.mutate(payload, { onSuccess: () => setRecordModalVisible(false) });
    }
  };

  const confirmDeleteRecord = (recordId: string) => {
    Alert.alert("Delete Record", "Are you sure you want to delete this record? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteRecordMutation.mutate(recordId) }
    ]);
  };

  const confirmBulkDeleteRecords = () => {
    Alert.alert("Delete Multiple Records", `Are you sure you want to delete ${selectedRecords.length} records?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        selectedRecords.forEach(recordId => deleteRecordMutation.mutate(recordId));
        setSelectedRecords([]);
      }}
    ]);
  };

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) ? prev.filter(selectedId => selectedId !== recordId) : [...prev, recordId]
    );
  };

  const getSortLabel = (val: string) => {
    if (val === 'newest') return 'Newest';
    if (val === 'oldest') return 'Oldest';
    return 'Modified';
  };

  // --- Sorting / Loading ---
  if (isSubjectLoading || isAttendanceLoading || isSemestersLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F7FA] dark:bg-[#09101f]">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const isSelectionMode = selectedRecords.length > 0;

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

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
            colors={['#4f46e5']}
          />
        }
      >
        
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
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{subject?.grading}</Text>
            </View>
            <View className="mr-8">
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">CREDITS</Text>
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{subject?.credits || 4}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">VENUE</Text>
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-wrap">{subject?.venues.join(', ')}</Text>
            </View>
          </View>

          {/* Professors & Semester Action Row */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
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

            {/* Moved Semester Filter */}
            {semester !== 0 && (
              <TouchableOpacity 
                onPress={() => setSemesterModalVisible(true)} 
                className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/60 px-4 py-2.5 rounded-xl ml-4 shadow-sm"
              >
                <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-300 mr-2">
                  Sem {semester}
                </Text>
                <ChevronDown size={16} color={colorScheme === 'dark' ? '#a5b4fc' : '#4f46e5'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Attendance Stats */}
            <View className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
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

        {/* ================= RECORDS SECTION ================= */}
        <View className="px-6 mt-8 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Records</Text>

            {/* New Sort Filter */}
            {sortedAndFilteredRecords.length > 0 && (
              <TouchableOpacity onPress={() => setSortModalVisible(true)} className="flex-row items-center bg-slate-200/50 dark:bg-slate-800 px-3 py-1.5 rounded-full ml-3 mr-auto">
                <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1.5">Sort: {getSortLabel(sortMethod)}</Text>
                <ArrowDownUp size={12} color={iconColor} />
              </TouchableOpacity>
            )}

            <View className="flex-row items-center gap-x-2">
              {isSelectionMode && isRecordsExpanded && (
                <TouchableOpacity onPress={confirmBulkDeleteRecords} className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                  <Trash2 size={16} color={colorScheme === 'dark' ? '#f87171' : '#ef4444'} />
                </TouchableOpacity>
              )}
              {isRecordsExpanded && (
                <TouchableOpacity onPress={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) setSearchQuery('');
                }} className="bg-slate-200/50 dark:bg-slate-800 p-2 rounded-full">
                  <Search size={16} color={iconColor} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => { setEditingRecord(null); setRecordModalVisible(true); }} className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                <Plus size={16} color={colorScheme === 'dark' ? '#818cf8' : '#4f46e5'} />
              </TouchableOpacity>
            </View>
          </View>

          {isSearchVisible && isRecordsExpanded && (
            <View className="mb-4 flex-row items-center bg-white dark:bg-[#151F32] px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <Search size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-slate-900 dark:text-white"
                placeholder="Search records by name..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {isRecordsLoading ? (
            <ActivityIndicator size="small" color="#4f46e5" className="my-4" />
          ) : semester === 0 ? (
            <View className="bg-white dark:bg-[#151F32] rounded-2xl p-6 items-center shadow-sm">
              <Text className="text-slate-500 dark:text-slate-400 font-medium text-center">Assign this subject to a timetable to add records.</Text>
            </View>
          ) : sortedAndFilteredRecords.length === 0 ? (
            <View className="bg-white dark:bg-[#151F32] rounded-2xl p-6 items-center shadow-sm border border-slate-100 dark:border-slate-800">
              <Text className="text-slate-500 dark:text-slate-400 font-medium text-center">
                {searchQuery ? "No records match your search." : "No records added yet."}
              </Text>
            </View>
          ) : (
            <View className="bg-white dark:bg-[#151F32] rounded-2xl overflow-hidden shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <ScrollView
                className={isRecordsExpanded ? "max-h-[240px]" : ""}
                showsVerticalScrollIndicator={true}
                scrollEnabled={isRecordsExpanded}
                nestedScrollEnabled={true}
              >
                {(isRecordsExpanded ? sortedAndFilteredRecords : sortedAndFilteredRecords.slice(0, 1)).map((record: RecordInterface, index: number) => {
                  const isSelected = selectedRecords.includes(record._id);
                  const percentage = record.marksTotal > 0 ? Math.round((record.marksScored / record.marksTotal) * 100) : 0;
                  
                  return (
                    <TouchableOpacity
                      key={record._id}
                      activeOpacity={isRecordsExpanded ? 0.7 : 1}
                      onLongPress={() => {
                        if (isRecordsExpanded) toggleRecordSelection(record._id);
                      }}
                      onPress={() => {
                        if (isRecordsExpanded && isSelectionMode) {
                          toggleRecordSelection(record._id);
                        }
                      }}
                      className={clsx(
                        "px-5 py-4 flex-row justify-between items-center border-2",
                        isSelected 
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 rounded-xl m-1" 
                          : "border-transparent border-t-slate-100 dark:border-t-slate-800",
                        index === 0 && !isSelected && "border-t-transparent dark:border-t-transparent"
                      )}
                    >
                      <View className="flex-1 mr-4">
                        <Text className="font-bold text-slate-900 dark:text-white text-base mb-1" numberOfLines={1}>{record.name}</Text>
                        <View className="flex-row items-center gap-x-2">
                          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Score: {record.marksScored} / {record.marksTotal}
                          </Text>
                          <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <Text className={clsx("text-xs font-bold", percentage >= 40 ? "text-green-500" : "text-red-500")}>
                            {percentage}%
                          </Text>
                        </View>
                      </View>
                      
                      {/* Hide edit/delete actions if multi-selection mode is active */}
                      {!isSelectionMode && (
                        <View className="flex-row items-center gap-x-2">
                          <TouchableOpacity onPress={() => { setEditingRecord(record); setRecordModalVisible(true); }} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Pencil size={16} color={colorScheme === 'dark' ? '#cbd5e1' : '#64748b'} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => confirmDeleteRecord(record._id)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <Trash2 size={16} color={colorScheme === 'dark' ? '#f87171' : '#ef4444'} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>

              {sortedAndFilteredRecords.length > 1 && (
                <TouchableOpacity
                  onPress={() => {
                    setIsRecordsExpanded(!isRecordsExpanded);
                    if (isRecordsExpanded) {
                      setSearchQuery('');
                      setIsSearchVisible(false);
                      setSelectedRecords([]);
                    }
                  }}
                  className="bg-slate-50 dark:bg-[#1C283F] py-3 items-center border-t border-slate-100 dark:border-slate-800"
                >
                  {isRecordsExpanded ? <ChevronUp size={20} color={iconColor} /> : <ChevronDown size={20} color={iconColor} />}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ================= HISTORY SECTION ================= */}
        <View className="px-6 mt-4 mb-4 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Attendance History</Text>
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
                  <View className="w-8 items-center mr-3">
                    <View className={clsx(
                      "absolute top-0 bottom-0 w-[2px]",
                      isLastGroup ? "h-6" : "h-full", 
                      groupIndex === 0 && isUnmarked ? "bg-green-200 dark:bg-green-900" : "bg-slate-200 dark:bg-slate-700",
                      groupIndex === 0 && !isUnmarked ? "mt-4" : "" 
                    )} />
                    
                    <View className="mt-1 relative z-10">
                      {getStatusDot(overallType)}
                    </View>
                  </View>

                  <View className="flex-1 pb-6">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                          <Text className="text-base font-bold text-slate-800 dark:text-white mb-0.5">
                            {title}
                          </Text>
                          <View className="flex-row items-center mt-1 mb-2">
                            <Text className="text-xs text-slate-500 dark:text-slate-400 mr-2">{dateString} • {timeString} ({hours} hr{hours>1 ? 's':''}) </Text>
                            
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
                      
                      <View className="flex-row items-center gap-x-2">
                        {group.length > 1 && overallType !== 'MIXED' && (
                          <TouchableOpacity 
                            onPress={() => toggleTimelineExpand(groupIndex)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"
                          >
                            {isTimelineExpanded ? <ChevronUp size={16} color={iconColor} /> : <ChevronDown size={16} color={iconColor} />}
                          </TouchableOpacity>
                        )}

                        {!isUnmarked && (
                          <TouchableOpacity onPress={() => handleEditGroupPress(group)} className="p-2">
                              <Pencil size={16} color={iconColor}/>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

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
                            // REMOVED disabled={isCreatePending} to allow sequential unblocked clicks
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

                                {childUnmarked ? (
                                  <View className="flex-row gap-x-1">
                                    {['PRESENT', 'ABSENT', 'MEDICAL', 'CANCELLED'].map((stat) => (
                                      <TouchableOpacity 
                                        key={stat}
                                        onPress={() => handleCreateAttendanceSingle(child, stat)}
                                        // REMOVED any disabling logic here as well
                                        className={clsx(
                                          "w-8 h-8 rounded-lg items-center justify-center border mx-1",
                                          stat === 'PRESENT' ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-700' :
                                          stat === 'ABSENT' ? 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-700' :
                                          stat === 'MEDICAL' ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-700' :
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

      {/* --- Modals --- */}
      <RecordFormModal 
        visible={recordModalVisible}
        onClose={() => setRecordModalVisible(false)}
        editingRecord={editingRecord}
        onSave={handleSaveRecord}
        isLoading={createRecordMutation.isPending || updateRecordMutation.isPending}
      />

      <AttendanceEditModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        selectedGroup={selectedGroup}
        onUpdateBulk={handleUpdateStatusBulk}
        onUpdateSingle={handleUpdateStatusSingle}
        isLoading={isUpdatePending}
      />

      <SemesterFilterModal 
        visible={semesterModalVisible}
        onClose={() => setSemesterModalVisible(false)}
        onSelect={(sem: number) => setSemester(sem)}
        semesters={semesters}
        currentSemester={semester}
      />

      <SortFilterModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        onSelect={(sortMethod: 'newest' | 'oldest' | 'modified') => setSortMethod(sortMethod)}
        currentSort={sortMethod}
      />
    </SafeAreaView>
  );
}