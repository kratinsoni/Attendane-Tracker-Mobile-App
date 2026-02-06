
export interface CreateSubjectPayload {
  _id: string;
  name: string;
  code: string;
  type: "THEORY" | "LAB"; 
  professor: string;
  credits: number;
  slots: string[];
  Grading: "ABSOLUTE" | "RELATIVE";
  labLength?: number; // <--- The '?' makes this field OPTIONAL
}