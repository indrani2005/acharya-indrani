import { apiClient } from '@/lib/api/client';

export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalWardens: number;
  activeParents: number;
  totalClasses: number;
  currentSemester: string;
  school: {
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
  };
}

export interface Student {
  id: number;
  admission_number: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  course: string;
  batch: string;
  status: string;
  // Add other student fields as needed
}

export interface Teacher {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  department: string;
  designation: string;
  experience_years: number;
  status: string;
  // Add other teacher fields as needed
}

export interface Staff {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  role: string;
  department: string;
  experience_years: number;
  status: string;
}

export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const adminAPI = {
  // Get school statistics
  getSchoolStats: async (): Promise<SchoolStats> => {
    try {
      // For now, return zero/empty values since we need to create these endpoints
      // TODO: Replace with actual API calls when backend endpoints are ready
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalStaff: 0,
        totalWardens: 0,
        activeParents: 0,
        totalClasses: 0,
        currentSemester: "N/A",
        school: {
          name: "Loading...",
          code: "N/A",
          email: "N/A",
          phone: "N/A",
          address: "N/A"
        }
      };
    } catch (error) {
      console.error('Error fetching school stats:', error);
      throw error;
    }
  },

  // Get all students
  getStudents: async (): Promise<Student[]> => {
    try {
      const response = await apiClient.get('/users/students/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Get all teachers/faculty
  getTeachers: async (): Promise<Teacher[]> => {
    try {
      const response = await apiClient.get('/users/staff/?role=faculty');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  },

  // Get all staff
  getStaff: async (): Promise<Staff[]> => {
    try {
      const response = await apiClient.get('/users/staff/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },

  // Get all users for user management
  getAllUsers: async (): Promise<UserData[]> => {
    try {
      const response = await apiClient.get('/users/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get fees data
  getFeesData: async () => {
    try {
      const response = await apiClient.get('/fees/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching fees data:', error);
      return [];
    }
  },

  // Get attendance data
  getAttendanceData: async () => {
    try {
      const response = await apiClient.get('/attendance/records/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }
  },

  // Get exams data
  getExamsData: async () => {
    try {
      const response = await apiClient.get('/exams/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching exams data:', error);
      return [];
    }
  }
};