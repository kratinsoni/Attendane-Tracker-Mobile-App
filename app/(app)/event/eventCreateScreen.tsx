import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAddEvent } from '@/hooks/useAddEvent';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const EVENT_TYPES = ['Assignment', 'Test', 'Other'];

export default function EventCreateScreen() {
  const router = useRouter();
  const { mutateAsync: addEvent, isPending } = useAddEvent();

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  
  // Date State
  const [date, setDate] = useState(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dropdown State
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handleDateChange = (event:any, selectedDate:any) => {
    // Android automatically closes the picker, iOS needs manual handling
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCreateEvent = async () => {
    if (!name || !location || !type || !description) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      await addEvent({
        name,
        location,
        type,
        date: date.toISOString(), // Convert to ISO string for the backend
        description,
      });
      
      Alert.alert("Success", "Event created successfully!");
      router.back(); 
    } catch (error) {
      Alert.alert("Error", "Failed to create event. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Top App Bar */}
      <View className="flex-row items-center p-4 pb-2 justify-between bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full hover:bg-sky-500/10"
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" className="dark:text-zinc-100" />
        </TouchableOpacity>
        <Text className="text-zinc-900 dark:text-zinc-100 text-lg font-bold flex-1 text-center pr-12">
          Add New Event
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        
        {/* Event Name */}
        <View className="mb-4">
          <Text className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-2 ml-1">
            Event Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Advanced Calculus Lab"
            placeholderTextColor="#94a3b8"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14 px-4 text-base text-zinc-900 dark:text-zinc-100 focus:border-sky-500"
          />
        </View>

        {/* Location */}
        <View className="mb-4">
          <Text className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-2 ml-1">
            Location
          </Text>
          <View className="relative justify-center">
            <MaterialIcons name="location-on" size={20} color="#94a3b8" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location or room number"
              placeholderTextColor="#94a3b8"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14 pl-12 pr-4 text-base text-zinc-900 dark:text-zinc-100 focus:border-sky-500"
            />
          </View>
        </View>

        {/* Type Dropdown */}
        <View className="mb-4">
          <Text className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-2 ml-1">
            Type
          </Text>
          <TouchableOpacity 
            onPress={() => setShowTypeMenu(true)}
            activeOpacity={0.7}
            className="w-full flex-row items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-14 px-4"
          >
            <Text className={`text-base ${type ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400'}`}>
              {type || "Select event type"}
            </Text>
            <MaterialIcons name="expand-more" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <View className="mb-4">
          <Text className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-2 ml-1">
            Date
          </Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
            className="w-full flex-row items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <View className="flex-1 justify-center h-14 px-4">
              <Text className="text-base text-zinc-900 dark:text-zinc-100">
                {date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center bg-sky-500/10 border-l border-zinc-200 dark:border-zinc-800">
              <MaterialIcons name="calendar-today" size={20} color="#0ea5e9" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Render Native Date Picker conditionally */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
          />
        )}
        
        {/* iOS needs a "Done" button for the picker if not using inline. 'inline' is generally better for modern iOS. */}
        {Platform.OS === 'ios' && showDatePicker && (
           <TouchableOpacity onPress={() => setShowDatePicker(false)} className="mb-4 items-end pr-2">
             <Text className="text-sky-500 font-bold">Done</Text>
           </TouchableOpacity>
        )}

        {/* Description */}
        <View className="mb-8 mt-2">
          <Text className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-2 ml-1">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add additional details about the event..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[140px] p-4 text-base text-zinc-900 dark:text-zinc-100 focus:border-sky-500"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={handleCreateEvent}
          disabled={isPending}
          activeOpacity={0.8}
          className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-sky-500/20 ${
            isPending ? 'bg-sky-400' : 'bg-sky-500'
          }`}
        >
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="add-circle-outline" size={24} color="#ffffff" />
              <Text className="text-white text-base font-bold">Create Event</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Type Selection Modal Menu */}
      <Modal
        visible={showTypeMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypeMenu(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} 
          activeOpacity={1} 
          onPress={() => setShowTypeMenu(false)}
          className="justify-center items-center p-6"
        >
          <View className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden p-2">
            <Text className="text-zinc-500 dark:text-zinc-400 font-semibold px-4 py-3 text-sm border-b border-zinc-100 dark:border-zinc-800">
              Select Event Type
            </Text>
            {EVENT_TYPES.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  setType(item);
                  setShowTypeMenu(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl ${type === item ? 'bg-sky-500/10' : ''}`}
              >
                <Text className={`text-base ${type === item ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-zinc-800 dark:text-zinc-200'}`}>
                  {item}
                </Text>
                {type === item && (
                  <MaterialIcons name="check" size={20} color="#0ea5e9" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}