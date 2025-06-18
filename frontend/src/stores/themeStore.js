import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false,
  }),

  getters: {
    currentTheme: (state) => (state.isDarkMode ? 'dark' : 'light'),
    themeClass: (state) => (state.isDarkMode ? 'my-app-dark' : ''),
  },

  actions: {
    // Initialize theme on app load
    initializeTheme() {
      // Apply the current theme to the document
      this.applyTheme()
    },

    // Toggle between dark and light mode
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      this.applyTheme()
    },

    // Set dark mode explicitly
    setDarkMode(isDark) {
      this.isDarkMode = isDark
      this.applyTheme()
    },

    // Apply theme to document
    applyTheme() {
      if (this.isDarkMode) {
        document.documentElement.classList.add('my-app-dark')
      } else {
        document.documentElement.classList.remove('my-app-dark')
      }
    },
  },

  // Persist theme state to localStorage
  persist: {
    key: 'theme',
    storage: localStorage,
    paths: ['isDarkMode'],
  },
})
