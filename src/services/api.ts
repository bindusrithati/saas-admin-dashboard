import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API Endpoints
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/login', data),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/register', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/forgot-password', data),
  resetPassword: (data: { token: string; new_password: string }) =>
    api.post('/reset-password', data),
};

export const usersAPI = {
  getAll: (params?: {
    search?: string;
    filter_by?: string;
    filter_values?: string;
    sort_by?: string;
    order_by?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
  }) => api.get('/users', { params }),
  getById: (userId: number) => api.get(`/users/data/${userId}`),
  getInfo: () => api.get('/users/info'),
  create: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => api.post('/users', data),
};

export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (studentId: number) => api.get(`/students/${studentId}`),
  create: (data: { user_id: number; phone?: string }) =>
    api.post('/students', data),
  update: (studentId: number, data: { user_id: number; phone?: string }) =>
    api.put(`/students/${studentId}`, data),
  delete: (studentId: number) => api.delete(`/students/${studentId}`),
  mapToBatch: (studentId: number, data: { batch_id: number }) =>
    api.post(`/students/${studentId}/batches`, data),
  getByBatch: (batchId: number) => api.get(`/students/batches/${batchId}`),
};

export const mentorsAPI = {
  getProfile: (userId: number) => api.get(`/mentors/profile/${userId}`),
  createProfile: (data: {
    user_id: number;
    bio?: string;
    expertise?: string[];
  }) => api.post('/mentors/profile', data),
  updateProfile: (
    userId: number,
    data: { bio?: string; expertise?: string[] }
  ) => api.put(`/mentors/profile/${userId}`, data),
};

export const syllabusAPI = {
  getAll: () => api.get('/syllabus'),
  getById: (syllabusId: number) => api.get(`/syllabus/${syllabusId}`),
  create: (data: { name: string; topics: string[] }) =>
    api.post('/syllabus', data),
  update: (syllabusId: number, data: { name: string; topics: string[] }) =>
    api.put(`/syllabus/${syllabusId}`, data),
  delete: (syllabusId: number) => api.delete(`/syllabus/${syllabusId}`),
};

export const batchesAPI = {
  getAll: () => api.get('/batches'),
  getById: (batchId: number) => api.get(`/batches/${batchId}`),
  create: (data: {
    name: string;
    mentor_id: number;
    syllabus_id: number;
    start_date: string;
    end_date: string;
  }) => api.post('/batches', data),
  update: (
    batchId: number,
    data: {
      name: string;
      mentor_id: number;
      syllabus_id: number;
      start_date: string;
      end_date: string;
    }
  ) => api.put(`/batches/${batchId}`, data),
  delete: (batchId: number) => api.delete(`/batches/${batchId}`),
  getSchedules: (batchId: number) =>
    api.get(`/batches/${batchId}/schedule-class`),
  createSchedule: (
    batchId: number,
    data: {
      day_of_week: string;
      start_time: string;
      end_time: string;
      topic?: string;
    }
  ) => api.post(`/batches/${batchId}/schedule-class`, data),
  updateSchedule: (
    batchId: number,
    scheduleId: number,
    data: {
      day_of_week: string;
      start_time: string;
      end_time: string;
      topic?: string;
    }
  ) => api.put(`/batches/${batchId}/schedule-class/${scheduleId}`, data),
  deleteSchedule: (batchId: number, scheduleId: number) =>
    api.delete(`/batches/${batchId}/schedule-class/${scheduleId}`),
};
