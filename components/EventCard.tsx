import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View, useColorScheme, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { AppEvent, EventType } from "../types/event";
import { scheduleEventReminders, cancelReminders } from "../utils/notificationHelper";
import { useToggleReminders, useEditEvent, useDeleteEvent } from "../hooks/useEvents"; 

interface EventCardProps {
  event: AppEvent;
  onEdit?: (event: AppEvent) => void;
  onDelete?: (event: AppEvent) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const EVENT_TYPES: EventType[] = ["Exam", "Assignment", "Test", "Other"];

const getBadgeStyles = (type: EventType) => {
  switch (type) {
    case "Exam":
      return { view: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-300" };
    case "Assignment":
      return { view: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300" };
    case "Test":
      return { view: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300" };
    case "Other":
      return { view: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300" };
    default:
      return { view: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700", text: "text-gray-700 dark:text-gray-300" };
  }
};

export const EventCard = ({ event, onEdit, onDelete, isSelectionMode, isSelected, onPress, onLongPress }: EventCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const badgeStyles = getBadgeStyles(event.type);
  
  const { mutateAsync: toggleRemindersMutation, isPending: isRemindersPending } = useToggleReminders();
  const { mutateAsync: editEventMutation, isPending: isSaving } = useEditEvent();
  const { mutateAsync: deleteEventMutation, isPending: isDeleting } = useDeleteEvent();

  const initialNotificationIds = event.notificationIds || [];
  const [scheduledNotifIds, setScheduledNotifIds] = useState<string[]>(initialNotificationIds);
  const isReminderSet = scheduledNotifIds.length > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editData, setEditData] = useState({
    name: event.name,
    location: event.location,
    description: event.description || "",
    type: event.type,
    date: new Date(event.date),
  });

  const handleDateChange = (e: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) {
      setEditData((prev) => {
        const newDate = new Date(prev.date);
        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        return { ...prev, date: newDate };
      });
    }
  };

  const handleTimeChange = (e: any, selectedTime?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (selectedTime) {
      setEditData((prev) => {
        const newDate = new Date(prev.date);
        newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        return { ...prev, date: newDate };
      });
    }
  };

  const handleToggleReminder = async () => {
    if (isRemindersPending) return;

    try {
      if (isReminderSet) {
        await cancelReminders(scheduledNotifIds);
        await toggleRemindersMutation({ eventId: event._id, notificationIds: [] }); 
        setScheduledNotifIds([]);
        
        Toast.show({
          type: 'success',
          text1: 'Reminders Disabled 🔕',
          text2: 'You will no longer receive notifications for this event.',
        });
      } else {
        const newIds = await scheduleEventReminders(event);
        if (newIds.length > 0) {
          await toggleRemindersMutation({ eventId: event._id, notificationIds: newIds });
          setScheduledNotifIds(newIds);
          
          Toast.show({
            type: 'success',
            text1: 'Reminders Enabled 🔔',
            text2: 'You will be notified before this event begins.',
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'Cannot Set Reminder',
            text2: 'This event is too soon or in the past.',
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update reminders. Please try again.',
      });
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Event name cannot be empty.',
      });
      return;
    }

    try {
      let finalNotificationIds = scheduledNotifIds;
      const originalDate = new Date(event.date).getTime();
      const newDate = editData.date.getTime();
      const dateChanged = originalDate !== newDate;

      if (dateChanged && isReminderSet) {
        await cancelReminders(scheduledNotifIds);
        const tempUpdatedEvent: AppEvent = {
          ...event,
          ...editData,
          date: editData.date.toISOString(),
        };

        finalNotificationIds = await scheduleEventReminders(tempUpdatedEvent);
        setScheduledNotifIds(finalNotificationIds);
        
        if (finalNotificationIds.length === 0) {
             Toast.show({
               type: 'info',
               text1: 'Reminders Removed',
               text2: 'The new date is too soon or in the past.',
             });
        }
      }

      await editEventMutation({
        eventId: event._id,
        updates: {
          name: editData.name,
          location: editData.location,
          description: editData.description,
          type: editData.type,
          date: editData.date.toISOString(),
          notificationIds: finalNotificationIds,
        },
      });
      setIsEditing(false);
      
      Toast.show({
        type: 'success',
        text1: 'Event Updated ✨',
        text2: 'Your changes have been saved successfully.',
      });

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Could not save event. Please try again.',
      });
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: event.name,
      location: event.location,
      description: event.description || "",
      type: event.type,
      date: new Date(event.date), 
    });
    setIsEditing(false);
  };

  const cycleEventType = () => {
    const currentIndex = EVENT_TYPES.indexOf(editData.type);
    const nextIndex = (currentIndex + 1) % EVENT_TYPES.length;
    setEditData(prev => ({ ...prev, type: EVENT_TYPES[nextIndex] }));
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (scheduledNotifIds.length > 0) {
                await cancelReminders(scheduledNotifIds);
              }
              await deleteEventMutation(event._id);
              onDelete?.(event); 
              
              Toast.show({
                type: 'success',
                text1: 'Event Deleted 🗑️',
                text2: 'The event was permanently removed.',
              });

            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: 'Could not delete the event. Please try again.',
              });
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const displayDate = new Date(event.date);

  return (
    <TouchableOpacity
      activeOpacity={isEditing || isSelectionMode ? 1 : 0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-100 dark:border-slate-700'}`}
    >
      <View className="flex-row justify-between items-start ">
        <View className="flex-row items-center gap-2">
          {/* Display Checkbox during selection mode */}
          {isSelectionMode && (
            <MaterialIcons
              name={isSelected ? "check-circle" : "radio-button-unchecked"}
              size={22}
              color={isSelected ? "#3B82F6" : (isDark ? "#64748B" : "#94A3B8")}
            />
          )}
          
          {isEditing ? (
            <TouchableOpacity 
              onPress={cycleEventType}
              className={`flex-row items-center px-2 py-0.5 rounded border ${getBadgeStyles(editData.type).view}`}
            >
              <Text className={`text-[10px] font-bold uppercase tracking-wide mr-1 ${getBadgeStyles(editData.type).text}`}>
                {editData.type}
              </Text>
              <MaterialIcons name="loop" size={12} color={getBadgeStyles(editData.type).text.split(' ')[0].replace('text-', '')} />
            </TouchableOpacity>
          ) : (
            <View className={`px-2 py-0.5 rounded border ${badgeStyles.view}`}>
              <Text className={`text-[10px] font-bold uppercase tracking-wide ${badgeStyles.text}`}>
                {event.type}
              </Text>
            </View>
          )}
        </View>

        {/* Hide actions entirely when in multi-select mode */}
        {!isSelectionMode && (
          <View className="flex-row items-center gap-3">
            {isEditing ? (
              <>
                <TouchableOpacity onPress={handleCancel} hitSlop={8} disabled={isSaving}>
                  <MaterialIcons name="close" size={22} color="#EF4444" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleSave} hitSlop={8} disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : (
                    <MaterialIcons name="check" size={22} color="#10B981" />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleToggleReminder} hitSlop={8} disabled={isRemindersPending}>
                  {isRemindersPending ? (
                    <ActivityIndicator size="small" color={isDark ? "#94A3B8" : "#64748B"} />
                  ) : (
                    <MaterialIcons
                      name={isReminderSet ? "notifications-active" : "notifications-none"}
                      size={20}
                      color={isReminderSet ? "#F59E0B" : (isDark ? "#94A3B8" : "#64748B")} 
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsEditing(true)} hitSlop={8}>
                  <MaterialIcons name="edit" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDelete} hitSlop={8} disabled={isDeleting}>
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {isEditing ? (
        <TextInput
          value={editData.name}
          onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
          placeholder="Event Name"
          placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
          className="text-lg font-semibold mb-2 py-1 border-b border-gray-200 dark:border-slate-600 text-slate-900 dark:text-slate-50"
          autoFocus
        />
      ) : (
        <Text className="text-lg font-semibold mb-1 text-slate-900 dark:text-slate-50">
          {event.name}
        </Text>
      )}

      <View className="flex-row items-center gap-1.5 mb-2">
        <MaterialIcons name="access-time" size={14} color={isDark ? "#94A3B8" : "#64748B"} />
        {isEditing ? (
          <View className="flex-row items-center flex-1 gap-2">
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-1 border-b border-gray-200 dark:border-slate-600 py-0.5">
              <Text className="text-sm text-sky-600 dark:text-sky-400">
                {editData.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-1 border-b border-gray-200 dark:border-slate-600 py-0.5">
              <Text className="text-sm text-sky-600 dark:text-sky-400">
                {editData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {displayDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at {displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={editData.date}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={editData.date}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <View className="flex-row items-center gap-1.5 mb-2">
        <MaterialIcons name="location-on" size={14} color={isDark ? "#94A3B8" : "#64748B"} />
        {isEditing ? (
          <TextInput
            value={editData.location}
            onChangeText={(text) => setEditData(prev => ({ ...prev, location: text }))}
            placeholder="Location"
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            className="flex-1 text-sm py-0.5 border-b border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
          />
        ) : (
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            {event.location}
          </Text>
        )}
      </View>

      {(isEditing || (event.description && event.description.trim() !== "")) && (
        <View className="mt-1">
          {isEditing ? (
            <TextInput
              value={editData.description}
              onChangeText={(text) => setEditData(prev => ({ ...prev, description: text }))}
              placeholder="Add a description..."
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              multiline
              className="text-sm py-1 border-b border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            />
          ) : (
            <Text numberOfLines={2} className="text-sm text-zinc-500 dark:text-zinc-400 leading-tight">
              {event.description}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};