import { defineStore } from 'pinia'
import axios from 'axios'

export const usePresetCategoryStore = defineStore('presetCategory', {
  state: () => ({
    categories: [],
  }),
  actions: {
    async fetchPresetCategories() {
      console.log('Fetching preset categories...')
      try {
        const response = await axios.get('/api/preset-categories')
        console.log('Categories response:', response.data)
        this.categories = response.data
      } catch (error) {
        console.error('Error fetching preset categories:', error)
      }
    },
  },
})
