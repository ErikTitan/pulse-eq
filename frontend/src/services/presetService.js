import axios from '../axios'

export const getPublicPresets = () => {
  return axios.get('/presets')
}

export const getUserPresets = () => {
  return axios.get('/user/presets')
}

export const createPreset = (preset) => {
  return axios.post('/presets', preset)
}

export const updatePreset = (slug, preset) => {
  return axios.put(`/presets/${slug}`, preset)
}

export const deletePreset = (slug) => {
  return axios.delete(`/presets/${slug}`)
}

export const usePreset = (slug) => {
  return axios.post(`/presets/${slug}/use`)
}

export const ratePreset = (slug, rating) => {
  return axios.post(`/presets/${slug}/rate`, { rating })
}
