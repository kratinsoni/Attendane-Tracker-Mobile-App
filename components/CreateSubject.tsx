import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  ActivityIndicator, KeyboardAvoidingView, Platform, 
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateSubject } from '@/hooks/useCreateSubject';
import { useGetSubjectByCode } from '@/hooks/useGetSubjectByCode';
import { timeSlots } from '@/constants/slotData';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateSubjectPage() {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayFull = {
    'Mon': 'MONDAY',
    'Tue': 'TUESDAY',
    'Wed': 'WEDNESDAY',
    'Thu': 'THURSDAY',
    'Fri': 'FRIDAY',
  }
  const TIME_LABELS = [
    '8 AM - 9 AM', '9 AM - 10 AM', '10 AM - 11 AM', '11 AM - 12 PM',
    '12 PM - 1 PM', '1 PM - 2 PM (LUNCH)', '2 PM - 3 PM', '3 PM - 4 PM', 
    '4 PM - 5 PM', '5 PM - 6 PM'
  ];
  
  const mapUiToSlotKey = (day: string, timeLabel: string) => {
    const timeRange = timeLabel.replace(/\s/g, '').replace(' (LUNCH)', '');
    return `${dayFull[day as keyof typeof dayFull]}_${timeRange}`;
  };

  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [credits, setCredits] = useState(3);
  const [grading, setGrading] = useState<'ABSOLUTE' | 'RELATIVE'>('ABSOLUTE');
  const [professors, setProfessors] = useState<string[]>([]);
  const [currentProf, setCurrentProf] = useState('');
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const { mutate: createSubject, isPending: isCreating } = useCreateSubject();
  
  const { data: fetchedSubject, isFetching: isSearching } = useGetSubjectByCode(subjectCode.toUpperCase());

  useEffect(() => {
    if (fetchedSubject) {
      console.log('Fetched Subject:', fetchedSubject);
      setSubjectName(fetchedSubject.subjectName);
      setCredits(Number(fetchedSubject.credits) || 0);
      const professors = fetchedSubject.professors ? fetchedSubject.professors.split(',').map((prof: string) => prof.trim()) : [];
      console.log('Parsed Professors:', professors);
      setProfessors(professors);
      
      if (fetchedSubject.slots) {
        // Handle potential space-separated or comma-separated slots
        const slots = fetchedSubject.slots.split(/[ ,]+/);
        console.log('Parsed Slots:', slots);
        let mappedTimeBlocks: string[] = [];
        (slots as string[]).map((slot: string) => {
          if (slot.length === 1) mappedTimeBlocks = [ ...mappedTimeBlocks, ...timeSlots[slot] ];
          else mappedTimeBlocks = [ ...mappedTimeBlocks, timeSlots[slot.substring(0, 2)][Number(slot.substring(2)) - 1] ];
        });
        setSelectedSlots(mappedTimeBlocks);
      }
    }
    else {
      setSubjectName('');
      setCredits(3);
      setProfessors([]);
      setSelectedSlots([]);
    }
  }, [fetchedSubject]);

  const toggleSlot = (slotKey: string) => {
    if (slotKey.includes('1-2PM')) return;
    setSelectedSlots(prev => 
      prev.includes(slotKey) ? prev.filter(s => s !== slotKey) : [...prev, slotKey]
    );
  };

  const handleCreate = () => {
    console.log(subjectCode, subjectName, credits, grading, professors, selectedSlots);
    createSubject({
      code: subjectCode.toUpperCase(),
      name: subjectName,
      credits,
      grading,
      professors,
      slots: selectedSlots,
    });
  };

  return (
    // edges={['top']} prevents the bottom safe area from messing with the keyboard view
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header - Simplified padding since SafeAreaView handles the top */}
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Text className="text-blue-600 text-lg font-medium">Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">New Subject</Text>
          <TouchableOpacity onPress={handleCreate} disabled={isCreating} className="p-1">
            <Text className={`text-lg font-semibold ${isCreating ? 'text-gray-400' : 'text-blue-600'}`}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback>
          <ScrollView 
            className="flex-1 px-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 300 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Subject Code */}
            <View className="mt-6">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject Code</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900 text-base"
                  placeholder="e.g. AE20202"
                  value={subjectCode}
                  onChangeText={setSubjectCode}
                  autoCapitalize="characters"
                />
                {isSearching && (
                  <View className="absolute right-4 top-4">
                    <ActivityIndicator size="small" color="#2563eb" />
                  </View>
                )}
              </View>
            </View>

            {/* Subject Name */}
            <View className="mt-6">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject Name</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-900 text-base"
                placeholder="e.g. Flight Vehicle Controls"
                value={subjectName}
                onChangeText={setSubjectName}
              />
            </View>

            {/* Schedule Slots Section */}
            <View className="mt-8">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Schedule Slots</Text>
              
              <View className="flex-row justify-between mb-6">
                {DAYS.map(day => (
                  <TouchableOpacity 
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-full border ${selectedDay === day ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <Text className={`font-semibold ${selectedDay === day ? 'text-white' : 'text-gray-600'}`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row flex-wrap justify-between">
                {TIME_LABELS.map((label) => {
                  const slotKey = mapUiToSlotKey(selectedDay, label);
                  const isSelected = selectedSlots.includes(slotKey);
                  const isLunch = label.includes('LUNCH');

                  return (
                    <TouchableOpacity
                      key={label}
                      disabled={isLunch}
                      onPress={() => toggleSlot(slotKey)}
                      className={`w-[48%] mb-3 p-4 rounded-xl items-center border 
                        ${isLunch ? 'bg-gray-50 border-gray-100 border-dashed opacity-50' : 
                          isSelected ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-100'}`}
                    >
                      <Text className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Selection Chips */}
            {selectedSlots.length > 0 && (
              <View className="mt-4 flex-row flex-wrap">
                {selectedSlots.map(slot => (
                  <View key={slot} className="bg-blue-50 border border-blue-100 flex-row items-center px-3 py-1 rounded-md mr-2 mb-2">
                    <Text className="text-blue-700 text-[10px] font-medium mr-1">{slot.replace('_', ' ')}</Text>
                    <TouchableOpacity onPress={() => toggleSlot(slot)}>
                      <Ionicons name="close-circle" size={14} color="#2563eb" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View className="h-[1px] bg-gray-100 my-8" />

            {/* Credits and Grading */}
            <View className="flex-row justify-between h-14 mb-6">
              <View className="w-[45%]">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Credits</Text>
                <View className="flex-row items-center justify-between bg-white border border-gray-100 rounded-xl p-2">
                  <TouchableOpacity onPress={() => setCredits(Math.max(0, credits - 1))} className="p-2">
                    <Ionicons name="remove" size={20} color="#2563eb" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold">{credits}</Text>
                  <TouchableOpacity onPress={() => setCredits(credits + 1)} className="p-2">
                    <Ionicons name="add" size={20} color="#2563eb" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="w-[45%]">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Grading</Text>
                <View className="flex-row bg-gray-50 rounded-xl p-1 h-full items-center">
                  {(['ABSOLUTE', 'RELATIVE'] as const).map((type) => {
                    const isActive = grading === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setGrading(type)}
                        className={`flex-1 py-[13px] rounded-lg items-center ${isActive ? 'bg-white' : 'bg-transparent'}`}
                        style={isActive ? { shadowColor: '#000', shadowOpacity: 0.1 } : {}}
                      >
                        <Text className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Professors */}
            <View className="mt-8 mb-6">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Professors</Text>
              <View className="flex-row items-center bg-white border border-gray-100 rounded-xl px-4 mb-4">
                <TextInput
                  className="flex-1 py-4 text-base"
                  placeholder="Add Professor..."
                  value={currentProf}
                  onChangeText={setCurrentProf}
                />
                <TouchableOpacity 
                  onPress={() => {
                    if(currentProf) {
                      setProfessors([...professors, currentProf]);
                      setCurrentProf('');
                    }
                  }}
                  className="bg-blue-600 rounded-lg p-2"
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {professors.map((prof, index) => (
                <View key={index} className="flex-row items-center justify-between border border-gray-100 rounded-xl p-3 mb-2">
                  <Text className="text-gray-700 font-medium">{prof}</Text>
                  <TouchableOpacity onPress={() => setProfessors(professors.filter((_, i) => i !== index))}>
                    <Ionicons name="close" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleCreate}
              disabled={isCreating}
              className={`py-5 rounded-2xl items-center mb-10 ${isCreating ? 'bg-gray-300' : 'bg-blue-600 shadow-lg shadow-blue-200'}`}
            >
              {isCreating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold">Create Subject</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}