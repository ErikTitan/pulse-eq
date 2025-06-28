import apiClient from '../axios';

export const updateProfile = (profileData) => {
  return apiClient.put('/user/profile', profileData);
};