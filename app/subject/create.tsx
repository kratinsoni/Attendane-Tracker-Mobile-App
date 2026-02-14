// import React, { useState } from 'react';
// import { View, Text, TextInput, ScrollView, Pressable, useColorScheme } from 'react-native';
// import { PlusCircle, CheckCircle2, Check, User, Clock, ChevronLeft } from 'lucide-react-native';
// import Toast from 'react-native-toast-message';
// import { useRouter } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useCreateSubject } from '@/hooks/useCreateSubject';
// import { TIME_SLOTS, DAYS, Day } from '@/types/subjectFormType';

// // Simple class joiner
// function cn(...classes: (string | undefined | null | false)[]) {
//   return classes.filter(Boolean).join(' ');
// }

// const CreateSubjectScreen =() => {
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === 'dark';
//   const iconColor = isDark ? '#FFFFFF' : '#0f172a';
//   const placeholderColor = '#94a3b8';

//   const { mutate, isPending } = useCreateSubject();

//   // --- 1. Separate State for Each Field ---
//   const [name, setName] = useState('');
//   const [code, setCode] = useState('');
//   const [credits, setCredits] = useState('');
//   const [professor, setProfessor] = useState('');
  
//   // Explicit simple states for Toggles
//   const [type, setType] = useState<'THEORY' | 'LAB'>('THEORY');
//   const [grading, setGrading] = useState<'RELATIVE' | 'ABSOLUTE'>('RELATIVE');
//   const [labLength, setLabLength] = useState('');

//   // Schedule State
//   const [activeDay, setActiveDay] = useState<Day>('Mon');
//   const [schedules, setSchedules] = useState<Record<Day, string[]>>({
//     Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
//   });

//   // --- 2. Simplified Handlers ---

//   const toggleSlot = (day: Day, slotValue: string) => {
//     setSchedules(prev => {
//       const currentDaySlots = prev[day];
//       const isSelected = currentDaySlots.includes(slotValue);
      
//       const newDaySlots = isSelected
//         ? currentDaySlots.filter(s => s !== slotValue)
//         : [...currentDaySlots, slotValue];

//       return { ...prev, [day]: newDaySlots };
//     });
//   };

//   const handleSubmit = () => {
//     // Re-assemble the object just for submission
//     const totalSlots = Object.values(schedules).flat().length;

//     if (totalSlots === 0) {
//         Toast.show({
//             type: 'error',
//             text1: 'Validation Error',
//             text2: 'Please select at least one time slot.',
//             position: 'bottom'
//         });
//         return;
//     }

//     const payload = {
//         name,
//         code,
//         credits,
//         professor,
//         type,
//         Grading: grading, // Note: API expects 'Grading' capitalized based on your previous code
//         labLength,
//         schedules
//     };

//     mutate(payload, {
//       onSuccess: (data) => {
//         Toast.show({
//           type: "success",
//           text1: "Subject Created",
//           text2: `${data?.name || 'Subject'} added successfully.`,
//           position: "bottom",
//         });
        
//         router.back();
//       },
//       onError: (error: any) => {
//         const message = error.response?.data?.message || error.message || "Creation failed";
//         Toast.show({
//           type: "error",
//           text1: "Error",
//           text2: message,
//           position: "bottom",
//         });
//       }
//     });
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
//        <View className="flex-row items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
//           <Pressable onPress={() => router.back()} className="mr-3 p-1">
//              <ChevronLeft size={24} color={iconColor} />
//           </Pressable>
//           <Text className="text-lg font-bold text-slate-900 dark:text-white">Create Subject</Text>
//        </View>

//        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
//           <View className="py-6 space-y-6">
            
//             {/* --- Info Fields --- */}
//             <View className="space-y-4">
//                <View>
//                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Subject Name</Text>
//                  <TextInput 
//                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
//                    placeholder="e.g. Distributed Systems"
//                    placeholderTextColor={placeholderColor}
//                    value={name}
//                    onChangeText={setName} 
//                  />
//                </View>

//                <View className="flex-row gap-4">
//                   <View className="flex-1">
//                     <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Subject Code</Text>
//                     <TextInput 
//                       className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
//                       placeholder="CS-402"
//                       placeholderTextColor={placeholderColor}
//                       value={code}
//                       onChangeText={setCode}
//                     />
//                   </View>
//                   <View className="flex-1">
//                     <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Credits</Text>
//                     <TextInput 
//                       keyboardType="numeric"
//                       className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
//                       placeholder="4"
//                       placeholderTextColor={placeholderColor}
//                       value={credits}
//                       onChangeText={setCredits}
//                     />
//                   </View>
//                </View>

//                 <View>
//                   <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Professor Name</Text>
//                   <View className="relative justify-center">
//                     <TextInput 
//                       className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
//                       placeholder="Dr. Julian Casablancas"
//                       placeholderTextColor={placeholderColor}
//                       value={professor}
//                       onChangeText={setProfessor}
//                     />
//                     <View className="absolute left-3 top-3">
//                         <User size={18} color={placeholderColor} />
//                     </View>
//                   </View>
//                 </View>
//             </View>

//             {/* --- Type & Grading (Simplified Logic) --- */}
//             <View className="space-y-4">
//                 <View className="flex-row gap-4">
                   
//                    {/* TYPE */}
//                    <View className="flex-1 space-y-1.5">
//                       <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Type</Text>
//                       <View className="flex-row p-1 bg-slate-100 dark:bg-slate-800 rounded-xl h-12 items-center">
//                         <Pressable 
//                             onPress={() => setType('THEORY')}
//                             className={cn("flex-1 h-full items-center justify-center rounded-lg", type === 'THEORY' ? "bg-white dark:bg-slate-700 shadow-sm" : "")}
//                         >
//                             <Text className={cn("text-xs font-bold", type === 'THEORY' ? "text-blue-600 dark:text-blue-400" : "text-slate-500")}>THEORY</Text>
//                         </Pressable>
//                         <Pressable 
//                             onPress={() => setType('LAB')}
//                             className={cn("flex-1 h-full items-center justify-center rounded-lg", type === 'LAB' ? "bg-white dark:bg-slate-700 shadow-sm" : "")}
//                         >
//                             <Text className={cn("text-xs font-bold", type === 'LAB' ? "text-blue-600 dark:text-blue-400" : "text-slate-500")}>LAB</Text>
//                         </Pressable>
//                       </View>
//                    </View>

//                    {/* GRADING */}
//                    <View className="flex-1 space-y-1.5">
//                       <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Grading</Text>
//                       <View className="flex-row p-1 bg-slate-100 dark:bg-slate-800 rounded-xl h-12 items-center">
//                         <Pressable 
//                             onPress={() => setGrading('RELATIVE')}
//                             className={cn("flex-1 h-full items-center justify-center rounded-lg", grading === 'RELATIVE' ? "bg-white dark:bg-slate-700 shadow-sm" : "")}
//                         >
//                             <Text className={cn("text-[10px] font-bold", grading === 'RELATIVE' ? "text-blue-600 dark:text-blue-400" : "text-slate-500")}>RELATIVE</Text>
//                         </Pressable>
//                         <Pressable 
//                             onPress={() => setGrading('ABSOLUTE')}
//                             className={cn("flex-1 h-full items-center justify-center rounded-lg", grading === 'ABSOLUTE' ? "bg-white dark:bg-slate-700 shadow-sm" : "")}
//                         >
//                             <Text className={cn("text-[10px] font-bold", grading === 'ABSOLUTE' ? "text-blue-600 dark:text-blue-400" : "text-slate-500")}>ABSOLUTE</Text>
//                         </Pressable>
//                       </View>
//                    </View>
//                 </View>

//                 {type === 'LAB' && (
//                   <View>
//                     <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Lab Length (Hours)</Text>
//                     <View className="relative justify-center">
//                       <TextInput 
//                         keyboardType="numeric"
//                         className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
//                         placeholder="e.g. 2"
//                         placeholderTextColor={placeholderColor}
//                         value={labLength}
//                         onChangeText={setLabLength}
//                       />
//                        <View className="absolute left-3 top-3">
//                            <Clock size={18} color={placeholderColor} />
//                        </View>
//                     </View>
//                   </View>
//                 )}
//             </View>

//              {/* --- Schedule Matrix --- */}
//              <View>
//               <View className="flex-row justify-between items-center mb-3 ml-1">
//                 <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">Schedule Sessions</Text>
//                 <Text className="text-[10px] text-slate-400 font-medium">Select time slots</Text>
//               </View>

//               <View className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-3 px-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
//                   {DAYS.map((day) => {
//                     const isActive = activeDay === day;
//                     const hasSelection = schedules[day].length > 0;
//                     return (
//                       <Pressable 
//                         key={day}
//                         onPress={() => setActiveDay(day)}
//                         className={cn(
//                           "mr-2 items-center justify-center w-14 h-16 rounded-xl border",
//                           isActive ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-slate-100 dark:bg-slate-700/50"
//                         )}
//                       >
//                         <Text className={cn("text-[10px] uppercase font-bold mb-1", isActive ? "text-blue-600" : "text-slate-500")}>
//                           {day}
//                         </Text>
//                         {hasSelection ? <CheckCircle2 size={18} color="#2563eb" /> : <Text className="text-slate-300">•</Text>}
//                       </Pressable>
//                     );
//                   })}
//                 </ScrollView>

//                 <View className="p-4">
//                   <View className="flex-row items-center gap-2 mb-4">
//                     <Text className="text-xs font-bold uppercase text-blue-600">{activeDay} Slots</Text>
//                     <View className="h-[1px] bg-blue-600/20 flex-1" />
//                   </View>

//                   <View className="flex-row flex-wrap gap-2">
//                     {TIME_SLOTS.map((slot) => {
//                       const isSelected = schedules[activeDay].includes(slot.value);
//                       return (
//                         <Pressable
//                           key={slot.value}
//                           onPress={() => toggleSlot(activeDay, slot.value)}
//                           className={cn(
//                             "w-[31%] py-3 rounded-lg border items-center relative",
//                             isSelected ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
//                           )}
//                         >
//                           <Text className={cn("text-[10px] font-semibold", isSelected ? "text-white" : "text-slate-600 dark:text-slate-300")}>
//                             {slot.label}
//                           </Text>
//                           {isSelected && (
//                             <View className="absolute -top-1 -right-1 bg-white rounded-full">
//                               <Check size={10} color="#2563eb" strokeWidth={4} />
//                             </View>
//                           )}
//                         </Pressable>
//                       );
//                     })}
//                   </View>
//                 </View>
//               </View>
//             </View>

//             <View className="h-24" />
//           </View>
//        </ScrollView>

//        <View className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-slate-900/80">
//         <Pressable 
//           onPress={handleSubmit}
//           disabled={isPending}
//           className={cn(
//             "w-full h-14 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-500/30",
//             isPending ? "bg-blue-600/70" : "bg-blue-600"
//           )}
//         >
//           {isPending ? (
//              <Text className="text-white font-bold">Creating...</Text>
//           ) : (
//             <>
//               <PlusCircle size={20} color="white" />
//               <Text className="text-white font-bold ml-2">Create Subject</Text>
//             </>
//           )}
//         </Pressable>
//       </View>
//     </SafeAreaView>
//   );
// }

// export default CreateSubjectScreen

import { View, Text } from 'react-native'
import React from 'react'
import CreateSubjectPage from '@/components/CreateSubject'

const create = () => {
  return (
    <CreateSubjectPage />
  )
}

export default create