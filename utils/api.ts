import { getToken } from "@/utils/token";
import axios, { AxiosInstance } from "axios";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { CreateSubjectPayload } from "../types/subjectTypes";
import { UserInterface } from "@/types/userTypes";
import { RegisterPayload } from "@/hooks/useRegister";

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
  me: async (api: AxiosInstance) => {
    return await api.get("/users/me");
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
    }: RegisterPayload & { api: AxiosInstance }
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
  },
  registerInit: async (api: AxiosInstance, instituteId: string) => {
    return await api.post("/users/register-init", { instituteId });
  },
  verifyOtp: async (api: AxiosInstance, instituteId: string, otp: string) => {
    return await api.post("/users/verify", { instituteId, otp });
  },
  logout: async (api: AxiosInstance) => {
    await api.post("/users/logout");
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
  },
  
  editAttendanceStatus : async ( api : AxiosInstance,timetableId:string, type : string)=>{
    const res = await api.patch(`/attendance/${timetableId}`,{
      type : type
    });
    return res.data.data;
  }
}

// inside your api file (e.g., subjectApi.ts)

export const subjectApi = {
  getAllSubjects: async (api: AxiosInstance) => {
    const res = await api.get("/subjects/");
    return res.data.data; 
  },
  createSubject: async (
    api: AxiosInstance,
    payload: CreateSubjectPayload
  ) => {
    const res = await api.post("/subjects/", payload);
    return res.data.data;
  },
  getSubjectByCode: async (api: AxiosInstance, code: string) => {
    // Calls the backend endpoint: GET /subjects/:code
    const res = await api.get(`/subjects/details/${code}`);
    return res.data.data;
  },
};