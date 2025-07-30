import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface RegisterData {
  email: string;
  username: string;
  fullname: string;
  password: string;
  userProfilePic?: File;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullname: string;
  userProfilePic?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Register a new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('username', data.username);
  formData.append('fullname', data.fullname);
  formData.append('password', data.password);
  
  if (data.userProfilePic) {
    formData.append('userProfilePic', data.userProfilePic);
  }

  const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Login a user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data);
  return response.data;
};

// Get user profile
export const getProfile = async (token: string): Promise<User> => {
  const response = await axios.get<{ user: User }>(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data.user;
}; 