import { 
  LoginCredentials, 
  AuthResponse, 
  User, 
  StudentProfile, 
  ParentProfile, 
  StaffProfile,
  ApiResponse
} from './types';
import { api } from './client';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('users/auth/login/', credentials);
    
    // Store tokens and user info
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('users/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User; profile: any }> => {
    return api.get('users/auth/me/');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Get user from localStorage
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Refresh token
  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post<{ access: string }>('users/auth/refresh/', {
      refresh: refreshToken,
    });
    
    localStorage.setItem('access_token', response.access);
    return response;
  },
};

export const userService = {
  // Get all students
  getStudents: (params?: any): Promise<ApiResponse<StudentProfile[]>> =>
    api.get('users/students/', params),

  // Get student by ID
  getStudent: (id: number): Promise<StudentProfile> =>
    api.get(`users/students/${id}/`),

  // Create student
  createStudent: (data: Partial<StudentProfile>): Promise<StudentProfile> =>
    api.post('users/students/', data),

  // Update student
  updateStudent: (id: number, data: Partial<StudentProfile>): Promise<StudentProfile> =>
    api.patch(`users/students/${id}/`, data),

  // Get all parents
  getParents: (params?: any): Promise<ApiResponse<ParentProfile[]>> =>
    api.get('users/parents/', params),

  // Get parent by ID
  getParent: (id: number): Promise<ParentProfile> =>
    api.get(`users/parents/${id}/`),

  // Get all staff
  getStaff: (params?: any): Promise<ApiResponse<StaffProfile[]>> =>
    api.get('users/staff/', params),

  // Get staff by ID
  getStaffMember: (id: number): Promise<StaffProfile> =>
    api.get(`users/staff/${id}/`),
};