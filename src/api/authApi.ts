import axiosInstance from './axiosInstance';

export const login = async (credentials: { username: string; password: string; }) => {
  const response = await axiosInstance.post('/Api/Auth/login', credentials);
  return response.data; // JWT string
};

export const registerUser = async (data: { username: string; email: string; password: string; }) => {
  return axiosInstance.post('/Api/Auth/User/register', data);
};

export const registerAdmin = async (data: { username: string; email: string; password: string; }) => {
  return axiosInstance.post('/Api/Auth/Admin/register', data);
};

export const checkHealth = async () => {
  return axiosInstance.get('/Api/Auth/health');
};
