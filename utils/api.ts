import { getToken } from "@/utils/token";
import axios, { AxiosInstance } from "axios";
import { UserInterface } from "@/types/userTypes";
import { SubjectFormData } from "@/types/subjectFormType";
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

export const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  api.interceptors.request.use(
    async (config) => {
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  return api;
};

export const api = createApiClient();

export const userApi = {
  login: async (
    api: AxiosInstance,
    instituteId: string,
    password: string,
  ): Promise<{ accessToken: string }> => {
    const res = await api.post("/users/login", {
      instituteId,
      password,
    });

    // Debug log
    return res.data.data; // ✅ IMPORTANT
  },
  me: (api: AxiosInstance) => {
    return api.get("/users/me");
  },
  register: async (
    {
      api,
      instituteId,
      firstName,
      lastName,
      rollNo,
      password,
      confirmPassword,    
    }: UserInterface & { api: AxiosInstance; confirmPassword: string }
  ): Promise<{ user: UserInterface }> => {
    const res = await api.post("/users/register", {
      instituteId,
      firstName,
      lastName,
      rollNo,
      password,
      confirmPassword,
    });

    return res.data.data;
  }
};

export const timetableApi = {
  createTimetable: async (
    api: AxiosInstance,
    name: string,
    semester: string,
  ) => {
    const res = await api.post("/timetable/create", {
      name,
      semester,
    });
    return res.data.data;
  },
  getUserTimetables: async (api: AxiosInstance) => {
    const res = await api.get("/timetable/user");
    return res.data.data;
  },
  getTimetableById: async (api: AxiosInstance, id: string) => {
    const res = await api.get(`/timetable/${id}`);
    return res.data.data;
  },
  getSubjectsByTimetableId: async (api: AxiosInstance, id: string) => {
    const res = await api.get(`/timetable/subjects/${id}`);
    return res.data.data;
  },
};

export const attendanceApi = {
  getAttendanceForDateByTimetable: async (
    api: AxiosInstance,
    timetableId: string,
    date: string,
  ) => {
    const res = await api.get(
      `/attendance/timetable/${timetableId}/date/${date}`,
    );
    return res.data.data;
  },
  createAttendance: async (api: AxiosInstance, subjectId: string, day: string, type: string, timeSlot: string, date: string, semester: number) => {
    const res = await api.post("/attendance", {
      subjectId,
      day,
      type,
      timeSlot,
      date,
      semester,
    });
    return res.data.data;
  }
}

export const subjectApi = {
  createSubject: async (
    api: AxiosInstance,
    formData: SubjectFormData
  ) => {
    
    const flatSlots: string[] = Object.values(formData.schedules).flat();

    const res = await api.post("/subjects/", {
    name: formData.name,
    code: formData.code,
    type: formData.type,
    professor: formData.professor,
    credits: Number(formData.credits), // Convert to number
    slots: flatSlots,
    Grading: formData.Grading, 
    labLength: formData.labLength ? Number(formData.labLength) : undefined, // Optional
    });
    return res.data.data;
  },
  getAllSubjects: async (api: AxiosInstance) => {
    const res = await api.get("/subjects/");
    return res;
  },
};