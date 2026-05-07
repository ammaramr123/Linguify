import axiosInstance from './axiosInstance';

export const getAllImages = async (page = 0, size = 10) => {
  const response = await axiosInstance.get(`/Api/Admin/images?page=${page}&size=${size}`);
  return response.data;
};

export const getResolvedReports = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(
      `/Api/Admin/reports/resolved?page=${page}&size=${size}`
    );
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { content: [] };
    }
    throw err;
  }
};

export const getUnresolvedReports = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(
      `/Api/Admin/reports/unresolved?page=${page}&size=${size}`
    );
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { content: [] };
    }
    throw err;
  }
};

export const getUserReportsAdmin = async (userId: any, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(`/Api/Admin/users/${userId}/reports?page=${page}&size=${size}`);
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { content: [] };
    }
    throw err;
  }
};

export const deleteUser = async (userId: string) => {
  return axiosInstance.delete(`/Api/Admin/users/${userId}`);
};

export const deleteImage = async (imageId: any) => {
  return axiosInstance.delete(`/Api/Admin/images/${imageId}`);
};
