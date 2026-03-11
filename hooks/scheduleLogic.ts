import { useMemo } from "react";

// --- TYPES ---
export interface Subject {
  attendanceId: string | null;
  professor: string;
  status: string;
  subjectCode: string;
  subjectId: string;
  subjectName: string;
  timeSlot: string;
  type: string;
  slots: string[];
  day: string;
  semester: number;
  location: string;
}

export interface SlotDetail {
  timeSlot: string;
  status: string;
  attendanceId?: string;
}

export interface ClassSession {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  time: string;
  timeSlot: string[];
  slots: string[];
  location: string;
  sortTime: number;
  status: string;
  day: string;
  semester: number;
  attendanceId?: string;
  slotDetails: SlotDetail[];
}

// --- HELPER TO PARSE TIME ---
const getSortTime = (timeStr: string): number => {
  if (!timeStr) return 0;

  // Basic parsing for "10:00 AM - ..."
  const [startTime, modifier] = timeStr.split(" - ")[0].trim().split(" ");
  let [hours, minutes] = startTime.split(":").map(Number);

  // Handle AM/PM
  if (modifier) {
    if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
  }

  return hours * 100 + minutes;
};

// --- HOOK ---
export const useDailyClasses = (subjects: Subject[]) => {
  // Using inferred return type or you can cast to your updated ClassSession[]
  return useMemo(() => {
    if (!subjects || subjects.length === 0) return [];

    // 1. Map the initial array and setup timeSlot as an array
    const classesToday = subjects.map((subject) => {
      const displayTime = subject.timeSlot || "N/A";

      return {
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        time: displayTime,
        timeSlot: [displayTime], // Initialize as an array containing the single slot
        slots: subject.slots || [],
        location: subject.location || "TBA",
        sortTime: getSortTime(displayTime),
        status: subject.status,
        day: subject.day,
        semester: subject.semester,
        attendanceId: subject.attendanceId || undefined,
        slotDetails: [
          {
            timeSlot: displayTime,
            status: subject.status,
            attendanceId: subject.attendanceId || undefined,
          },
        ],
      };
    });

    // 2. Sort chronologically so consecutive classes sit next to each other
    const sortedClasses = classesToday.sort((a, b) => a.sortTime - b.sortTime);

    // 3. Group consecutive classes with the same subjectId
    const groupedClasses = sortedClasses.reduce(
      (acc, currentClass) => {
        if (acc.length === 0) {
          acc.push(currentClass);
          return acc;
        }

        const lastClass = acc[acc.length - 1];

        // If the current class is the same subject as the previous one
        if (lastClass.subjectId === currentClass.subjectId) {
          // Add the current timeSlot to the array
          lastClass.timeSlot.push(...currentClass.timeSlot);

          // Merge slots arrays (optional, but usually helpful if slots hold unique block IDs)
          lastClass.slots = [...lastClass.slots, ...currentClass.slots];

          // Accumulate per-slot details for individual attendance tracking
          lastClass.slotDetails.push(...currentClass.slotDetails);

          // Extract start time from the first block and end time from the current block
          // Relies on your exact format: "8:00 AM - 8:55 AM"
          const startTime = lastClass.time.split(" - ")[0];
          const endTime =
            currentClass.time.split(" - ")[1] || currentClass.time;

          // Update the 'time' string to represent the full duration
          lastClass.time = `${startTime} - ${endTime}`;
        } else {
          // Different subject, push as a new entry
          acc.push(currentClass);
        }

        return acc;
      },
      [] as typeof classesToday,
    );

    return groupedClasses;
  }, [subjects]);
};
