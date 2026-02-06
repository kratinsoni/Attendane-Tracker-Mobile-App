import { getToken } from "@/utils/token";
import axios, { AxiosInstance } from "axios";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { CreateSubjectPayload } from "../types/subjectTypes";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.145.69.20:8000/api/v1";

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

export const subjectApi = {
  createSubject: async (
    api: AxiosInstance,
    data: CreateSubjectPayload,
  ) => {
    const res = await api.post("/subjects/", data);
    return res.data.data;
  },
  getAllSubjects: async (api: AxiosInstance) => {
    const res = await api.get("/subjects/");
    return res.data.data;
  },
};