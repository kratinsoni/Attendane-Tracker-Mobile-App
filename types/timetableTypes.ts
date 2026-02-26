export interface TimetableCardType {
    _id: string,
    name: string,
    semester: number,
    student: {
        _id: string,
        firstName: string,
        lastName: string,
    },
    createdAt: string,
    updatedAt: string,
}

export interface SubjectCardType {
    _id: string,
    name: string,
    code: string,
    type: string,
    professor: string,
    credits: number,
    slots: string[],
    Grading: string,
    totalClasses: number,
    attendedClasses: number,
    createdAt: string,
    updatedAt: string,
}

export enum SemesterType {
  AUTUMN = "AUTUMN",
  SPRING = "SPRING",
}

export interface TimetableInterface {
  name: string;
  semester: number;
  student: string;       // Representing the ObjectId as a string
  subjects: string[];    // Array of ObjectIds as strings
  semesterType: SemesterType;
  createdAt?: Date;      // Added due to { timestamps: true }
  updatedAt?: Date;      // Added due to { timestamps: true }
}