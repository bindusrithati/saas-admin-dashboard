// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'mentor' | 'student';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreationRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'mentor' | 'student';
}

// Student Types
export interface Student {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentRequest {
  user_id: number;
  phone?: string;
}

export interface MappedBatchStudent {
  mapping_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  batch_id: number;
  batch_name: string;
  joined_at: string;
}

// Mentor Types
export interface Mentor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  bio?: string;
  expertise?: string[];
  created_at: string;
  updated_at: string;
}

export interface MentorProfileRequest {
  user_id: number;
  bio?: string;
  expertise?: string[];
}

// Syllabus Types
export interface Syllabus {
  id: number;
  name: string;
  topics: string[];
  created_at: string;
  updated_at: string;
}

export interface SyllabusRequest {
  name: string;
  topics: string[];
}

// Batch Types
export interface Batch {
  id: number;
  name: string;
  mentor_id: number;
  mentor_name?: string;
  syllabus_id: number;
  syllabus_name?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BatchRequest {
  name: string;
  mentor_id: number;
  syllabus_id: number;
  start_date: string;
  end_date: string;
}

// Class Schedule Types
export interface ClassSchedule {
  id: number;
  batch_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  topic?: string;
  created_at: string;
}

export interface ClassScheduleRequest {
  day_of_week: string;
  start_time: string;
  end_time: string;
  topic?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  batch_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  message: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_users: number;
  total_students: number;
  total_mentors: number;
  total_batches: number;
  active_batches: number;
}
