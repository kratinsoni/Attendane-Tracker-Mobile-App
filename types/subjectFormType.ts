export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface SubjectFormData {
  name: string;
  code: string;
  credits: string; // Kept as string for TextInput, converted to number for API
  professor: string;
  type: 'THEORY' | 'LAB';
  Grading: 'RELATIVE' | 'ABSOLUTE'; // Matches 'Grading' field
  labLength?: string; // Kept as string for TextInput, converted to number for API
  schedules: Record<Day, string[]>; 
}

// Maps UI labels to the exact backend string format required
export const TIME_SLOTS = [
  { label: "08:00 AM", value: "8:00 AM - 8:55 AM" },
  { label: "09:00 AM", value: "9:00 AM - 9:55 AM" },
  { label: "10:00 AM", value: "10:00 AM - 10:55 AM" },
  { label: "11:00 AM", value: "11:00 AM - 11:55 AM" },
  { label: "12:00 PM", value: "12:00 PM - 12:55 PM" },
  { label: "02:00 PM", value: "2:00 PM - 2:55 PM" },
  { label: "03:00 PM", value: "3:00 PM - 3:55 PM" },
  { label: "04:00 PM", value: "4:00 PM - 4:55 PM" },
  { label: "05:00 PM", value: "5:00 PM - 5:55 PM" },
];

export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];