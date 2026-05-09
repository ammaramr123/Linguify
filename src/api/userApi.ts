import axiosInstance from './axiosInstance';

export const uploadImage = async (file: File, targetLang: string) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post(`/Api/User/images/upload?targetLang=${targetLang}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getHistory = async (page = 0, size = 10) => {
  const response = await axiosInstance.get(`/Api/User/images/history?page=${page}&size=${size}`);
  return response.data;
};

export const deleteImage = async (imageId: number) => {
  return axiosInstance.delete(`/Api/User/images/history/${imageId}`);
};

export const submitReport = async (imageId: number, reportData: { failureType: string; description: string }) => {
  return axiosInstance.post(`/Api/User/images/${imageId}/reports`, reportData);
};

export const getUserReports = async (page = 0, size = 10) => {
  const response = await axiosInstance.get(`/Api/User/reports?page=${page}&size=${size}`);
  return response.data;
};

export const deleteReport = async (reportId: number) => {
  return axiosInstance.delete(`/Api/User/reports/${reportId}`);
};