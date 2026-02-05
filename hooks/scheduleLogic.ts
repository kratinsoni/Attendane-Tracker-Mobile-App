import { useMemo } from 'react';

// --- TYPES ---

export interface Subject {
  name: string;
  code: string;
  slots: string[];
  location?: string;
}

export interface ClassSession {
  subjectName: string;
  subjectCode: string;
  location: string;
  time: string;
  slot: string;
  sortTime: number;
}

interface SlotDefinition {
  slot: string;
  time: string;
}

// --- CONSTANTS ---

const TIMES = {
  P1: "08:00 - 08:55", P2: "09:00 - 09:55", P3: "10:00 - 10:55",
  P4: "11:00 - 11:55", P5: "12:00 - 12:55", P6: "14:00 - 14:55",
  P7: "15:00 - 15:55", P8: "16:00 - 16:55", P9: "17:00 - 17:55",
  Slot2Hr: "09:00 - 10:55", 
  MorningLab: "09:00 - 11:55", 
  AfternoonLab: "14:00 - 16:55",
};

// 1=Mon, 2=Tue...
const SLOT_MATRIX: Record<number, SlotDefinition[]> = {
  1: [ // MON
    { slot: "A3", time: TIMES.P1 }, { slot: "A2", time: TIMES.Slot2Hr },
    { slot: "C3", time: TIMES.P3 }, { slot: "B3", time: TIMES.P4 },
    { slot: "D3", time: TIMES.P5 }, { slot: "H3", time: TIMES.P6 },
    { slot: "Q", time: TIMES.MorningLab }, { slot: "J", time: TIMES.AfternoonLab },
  ],
  2: [ // TUE
    { slot: "B2", time: TIMES.Slot2Hr }, { slot: "D2", time: TIMES.Slot2Hr },
    { slot: "A3", time: TIMES.P5 }, { slot: "H3", time: TIMES.P8 },
    { slot: "K", time: TIMES.MorningLab }, { slot: "L", time: TIMES.AfternoonLab },
  ],
  3: [ // WED
    { slot: "C2", time: TIMES.Slot2Hr }, { slot: "E3", time: TIMES.P5 },
    { slot: "R", time: TIMES.MorningLab }, { slot: "X", time: TIMES.AfternoonLab },
  ],
  4: [ // THU
    { slot: "D4", time: TIMES.P1 }, { slot: "E3", time: TIMES.P4 },
    { slot: "G3", time: TIMES.P5 }, { slot: "I2", time: TIMES.P6 },
    { slot: "M", time: TIMES.MorningLab }, { slot: "N", time: TIMES.AfternoonLab },
  ],
  5: [ // FRI
    { slot: "G3", time: TIMES.P1 }, { slot: "E2", time: TIMES.Slot2Hr },
    { slot: "F2", time: TIMES.P4 }, { slot: "V3", time: TIMES.P6 },
    { slot: "O", time: TIMES.MorningLab }, { slot: "P", time: TIMES.AfternoonLab },
  ]
};

// --- HOOK ---

export const useDailyClasses = (subjects: Subject[], dateObj: Date): ClassSession[] => {
  return useMemo(() => {
    if (!subjects || !dateObj) return [];

    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon...
    const todaysSlots = SLOT_MATRIX[dayOfWeek];

    if (!todaysSlots) return [];

    const classesToday: ClassSession[] = [];

    subjects.forEach((subject) => {
      subject.slots.forEach((subjectSlot) => {
        const match = todaysSlots.find((s) => s.slot === subjectSlot);
        if (match) {
          classesToday.push({
            subjectName: subject.name,
            subjectCode: subject.code,
            location: subject.location || "TBA",
            time: match.time,
            slot: subjectSlot,
            // Sorting helper: remove colon to parse int (08:00 -> 800)
            sortTime: parseInt(match.time.split(' - ')[0].replace(':', ''), 10)
          });
        }
      });
    });

    return classesToday.sort((a, b) => a.sortTime - b.sortTime);
  }, [subjects, dateObj]);
};

// --- HELPER ---

export const getCurrentWeek = (): Date[] => {
  const dates: Date[] = [];
  const curr = new Date();
  const day = curr.getDay(); // 0-6
  // Calculate Monday: current date - current day of week + 1 (if sunday(0), need logic to go back to prev monday)
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1); 

  const monday = new Date(curr.setDate(diff));

  for (let i = 0; i < 5; i++) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    dates.push(next);
  }
  return dates;
};