export interface SubjectInterface {
  _id: string;
  name: string;
  code: string;
  type: "THEORY" | "LAB";
  labLength: number; // Keep this required for the database model
  professors: string[];
  credits: number;
  totalClasses: number;
  classesAttended: number;
  slots: string[];
  grading: "ABSOLUTE" | "RELATIVE";
  owner: string;
  createdAt: string;
  updatedAt: string;
}

// 1. Omit labLength along with the other internal fields
// 2. Then add it back as an optional property
export interface CreateSubjectPayload extends Omit<
  SubjectInterface, 
  "_id" | "totalClasses" | "classesAttended" | "owner" | "createdAt" | "updatedAt" | "labLength" | "type"
> {
  labLength?: number; 
}