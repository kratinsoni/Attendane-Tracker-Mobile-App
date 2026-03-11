import * as Notifications from "expo-notifications";
import { Alert } from "react-native"; // Added for native UI alerts
import { AppEvent } from "../types/event";

// Tells Expo how to handle notifications when the app is open in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }) as Notifications.NotificationBehavior,
});

export const scheduleEventReminders = async (
  event: AppEvent,
): Promise<string[]> => {
  // 1. Ask for permission first
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Permission Required",
      "Please enable notifications in your phone settings to get reminders.",
    );
    return [];
  }

  // 2. Calculate times
  // Because event.date is now a full ISO string, this grabs the exact millisecond!
  const eventTime = new Date(event.date).getTime();
  const intervalsInHours = [24, 12, 6,1, 0.5]; // 48h, 24h, 12h, 6h, 1h, and 30min before the event
  const scheduledIds: string[] = [];

  // 3. Schedule each valid reminder
  for (const hours of intervalsInHours) {
    const triggerTime = new Date(eventTime - hours * 60 * 60 * 1000);

    // Only schedule if the reminder time is in the future
    if (triggerTime > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${event.type} Reminder: ${event.name}`,
          body: `Starts in ${hours<1?`${hours * 60} minutes`:`${hours} hours`} at ${event.location}.`,
          data: { eventId: event._id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerTime,
        },
      });
      scheduledIds.push(id);
    }
  }

  return scheduledIds;
};

export const cancelReminders = async (notificationIds: string[]) => {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
};
