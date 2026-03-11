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
  const intervalsInHours = [24, 12, 6, 1]; // 48h, 24h, 12h, 6h, 1h, and 30min before the event
  const scheduledIds: string[] = [];

  // 3. Schedule each valid reminder
  for (const hours of intervalsInHours) {
    const triggerTime = new Date(eventTime - hours * 60 * 60 * 1000);

    // Only schedule if the reminder time is in the future
    if (triggerTime > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${event.type} Reminder: ${event.name}`,
          body: `Starts in ${hours} hours at ${event.location}.`,
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

export const scheduleClassReminders = async (
  classes: {
    subjectName: string;
    subjectCode: string;
    slot: string;
    subjectVenue?: string;
  }[],
): Promise<string[]> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return [];
  }

  // Cancel all previously scheduled class reminders
  const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of allScheduled) {
    if (notif.content.data?.type === "classReminder") {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  const scheduledIds: string[] = [];
  const now = new Date();

  for (const cls of classes) {
    const classTime = getClassTimeFromSlot(cls.slot);
    if (!classTime || classTime <= now) continue;

    // 15 minutes before class
    const reminderTime = new Date(classTime.getTime() - 15 * 60 * 1000);
    if (reminderTime <= now) continue;

    const venue = cls.subjectVenue ? ` at ${cls.subjectVenue}` : "";
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming Class: ${cls.subjectName}`,
        body: `${cls.subjectName} (${cls.subjectCode}) starts in 15 minutes${venue}.`,
        data: { type: "classReminder", subjectCode: cls.subjectCode },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
    });
    scheduledIds.push(id);
  }

  return scheduledIds;
};

const getClassTimeFromSlot = (slot: string): Date | null => {
  if (!slot) return null;
  try {
    const timePart = slot.split("_")[1];
    if (!timePart) return null;
    const startTime = timePart.split("-")[0];
    const match = startTime.match(/(\d+)(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const ampm = match[2].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const today = new Date();
    today.setHours(hours, 0, 0, 0);
    return today;
  } catch {
    return null;
  }
};

export const cancelReminders = async (notificationIds: string[]) => {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
};
