// types/index.ts

export type ExamType = 'Mid' | 'Final';
export type TermType = 'Spring' | 'Fall';
export type PaperStatus = 'Pending' | 'Approved' | 'Rejected';
export type SemesterNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  department_id: string;
  name: string;
  designation?: string;
  teacher_type?: 'Permanent' | 'Visiting';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Subject {
  id: string;
  teacher_id: string;
  name: string;
  course_code: string;
  credits?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
}

export interface Contributor {
  id: string;
  roll_number: string;
  department_id?: string;
  total_approved: number;
  total_pending: number;
  total_rejected: number;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Paper {
  id: string;
  department_id: string;
  teacher_id: string;
  subject_id: string;
  contributor_id?: string;
  exam_type: ExamType;
  semester: SemesterNumber;
  term: TermType;
  year: number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url?: string;
  roll_number: string;
  upload_ip?: string;
  status: PaperStatus;
  admin_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  department?: Department;
  teacher?: Teacher;
  subject?: Subject;
  contributor?: Contributor;
}

export interface PaperPublic {
  id: string;
  exam_type: ExamType;
  semester: SemesterNumber;
  term: TermType;
  year: number;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  department_id: string;
  department_name: string;
  department_code: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  course_code: string;
}

export interface TeamMemberLink {
  label: string;
  url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  info?: string;
  quote?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
  links: TeamMemberLink[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category?: string;
  is_pinned: boolean;
  link_url?: string;
  link_label?: string;
  published_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  roll_number: string;
  total_approved: number;
  created_at: string;
  department_name?: string;
  department_code?: string;
  rank: number;
}

export interface PaperFilters {
  department_id?: string;
  teacher_id?: string;
  subject_id?: string;
  exam_type?: ExamType;
  semester?: SemesterNumber;
  term?: TermType;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContributeFormData {
  roll_number: string;
  teacher_id: string;
  subject_id: string;
  exam_type: ExamType;
  semester: SemesterNumber;
  term: TermType;
  year: number;
  file: File;
  recaptcha_token: string;
}

export interface AdminDashboardStats {
  total_papers: number;
  pending_papers: number;
  approved_papers: number;
  rejected_papers: number;
  departments_count: number;
  teachers_count: number;
  subjects_count: number;
  contributors_count: number;
}

export interface ParsedRollNumber {
  raw: string;
  year: string;
  university: string;
  departmentCode: string;
  type: string;
  sequence: string;
  departmentId?: string;
  departmentName?: string;
  isValid: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
