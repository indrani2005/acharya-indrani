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
  // Get school-specific statistics for the logged-in admin
  getSchoolStats: async (): Promise<SchoolStats> => {
    try {
      const response = await apiClient.get('/schools/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching school stats:', error);
      // Return default values if API fails
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalStaff: 0,
        totalWardens: 0,
        activeParents: 0,
        totalClasses: 0,
        currentSemester: "N/A",
        school: {
          name: "Error loading school data",
          code: "N/A",
          email: "N/A",
          phone: "N/A",
          address: "N/A"
        }
      };
    }
  },

  // Get comprehensive dashboard data for the school
  getDashboardData: async () => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        students: [],
        teachers: [],
        staff: [],
        users: [],
        fees: [],
        attendance: [],
        exams: []
      };
    }
  },

  // Get all students
  getStudents: async (): Promise<Student[]> => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data.students || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Get all teachers/faculty
  getTeachers: async (): Promise<Teacher[]> => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data.teachers || [];
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  },

  // Get all staff
  getStaff: async (): Promise<Staff[]> => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data.staff || [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },

  // Get all users for user management
  getAllUsers: async (): Promise<UserData[]> => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get fees data
  getFeesData: async () => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data.fees || [];
    } catch (error) {
      console.error('Error fetching fees data:', error);
      return [];
    }
  },

  // Get attendance data
  getAttendanceData: async () => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data.attendance || [];
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }
  },

  // Get exams data
  getExamsData: async () => {
    try {
      const response = await apiClient.get('/schools/dashboard/');
      return response.data.exams || [];
    } catch (error) {
      console.error('Error fetching exams data:', error);
      return [];
    }
  }
};