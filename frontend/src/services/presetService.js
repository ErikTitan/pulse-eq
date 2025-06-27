import axios from '../axios';

export const getPublicPresets = () => {
  return axios.get('/presets');
};

export const getUserPresets = () => {
  return axios.get('/user/presets');
};

export const createPreset = (preset) => {
  return axios.post('/presets', preset);
};

export const updatePreset = (id, preset) => {
  return axios.put(`/presets/${id}`, preset);
};

export const deletePreset = (id) => {
  return axios.delete(`/presets/${id}`);
};

export const usePreset = (id) => {
  return axios.post(`/presets/${id}/use`);
};

export const ratePreset = (id, rating) => {
  return axios.post(`/presets/${id}/rate`, { rating });
};
