import { useMemo } from 'react';

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
}

export interface ClassSession {
  subjectName: string;
  subjectCode: string;
  time: string;
  timeSlot: string; // <--- This is required
  slot: string;
  location: string;
  sortTime: number;
  status: string;   // <--- Added this as per previous step
}

// --- HELPER TO PARSE TIME ---
const getSortTime = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  // Basic parsing for "10:00 AM - ..."
  const [startTime, modifier] = timeStr.split(' - ')[0].trim().split(' ');
  let [hours, minutes] = startTime.split(':').map(Number);

  // Handle AM/PM
  if (modifier) {
    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }

  return hours * 100 + minutes;
};

// --- HOOK ---
export const useDailyClasses = (subjects: Subject[], dateObj: Date): ClassSession[] => {
  return useMemo(() => {
    if (!subjects || subjects.length === 0) return [];

    const classesToday: ClassSession[] = subjects.map((subject) => {
      const displayTime = subject.timeSlot || "N/A";
      
      const displaySlot = subject.slots && subject.slots.length > 0 
        ? subject.slots[0] 
        : "VAR"; 

      return {
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        time: displayTime,
        timeSlot: displayTime, // <--- FIXED: Added this missing property
        slot: displaySlot,
        location: "Nalanda",
        sortTime: getSortTime(displayTime),
        status: subject.status, 
      };
    });

    return classesToday.sort((a, b) => a.sortTime - b.sortTime);
  }, [subjects]);
};