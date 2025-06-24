function toLog10(value, min, max) {
  return (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))
}

function toLin(value, min, max) {
  return Math.pow(10, value * (Math.log10(max) - Math.log10(min)) + Math.log10(min))
}

import { defineStore } from 'pinia'
import { WEQ8Runtime } from 'weq8'

export const useEqualizerStore = defineStore('equalizer', {
  state: () => ({
    savedState: null,
    filters: [],
    defaultFilters: [
      { type: 'lowshelf12', frequency: 60, gain: 0, Q: 1, bypass: false },
      { type: 'peaking12', frequency: 150, gain: 0, Q: 1, bypass: false },
      { type: 'peaking12', frequency: 400, gain: 0, Q: 1, bypass: false },
      { type: 'peaking12', frequency: 1000, gain: 0, Q: 1, bypass: false },
      { type: 'peaking12', frequency: 2400, gain: 0, Q: 1, bypass: false },
      { type: 'peaking12', frequency: 6000, gain: 0, Q: 1, bypass: false },
      { type: 'highshelf12', frequency: 12000, gain: 0, Q: 1, bypass: false },
    ],
    filterTypes: [
      { label: 'LP', value: 'lowpass12' },
      { label: 'HP', value: 'highpass12' },
      { label: 'BP', value: 'bandpass12' },
      { label: 'LS', value: 'lowshelf12' },
      { label: 'HS', value: 'highshelf12' },
      { label: 'PK', value: 'peaking12' },
      { label: 'NO', value: 'notch12' },
      { label: 'OFF', value: 'noop' },
    ],
    selectedPoint: null,
    isDragging: false,
    dragState: null,
    audioContext: null,
    analyserNode: null,
    audio: null,
    source: null,
    weq8: null,
    nyquist: 20000,
  }),

  getters: {
    filterHasGain: () => (type) => {
      return [
        'lowshelf12',
        'lowshelf24',
        'highshelf12',
        'highshelf24',
        'peaking12',
        'peaking24',
      ].includes(type)
    },

    filterHasQ: () => (type) => {
      return [
        'lowpass12',
        'lowpass24',
        'highpass12',
        'highpass24',
        'bandpass12',
        'bandpass24',
        'peaking12',
        'peaking24',
        'notch12',
        'notch24',
      ].includes(type)
    },
  },

  actions: {
    syncWeq8Filters() {
      if (!this.weq8) return

      for (let i = 0; i < 8; i++) {
        const filter = this.filters[i]
        if (filter) {
          this.weq8.setFilterType(i, filter.type)
          this.weq8.setFilterFrequency(i, filter.frequency)
          if (this.filterHasGain(filter.type)) {
            this.weq8.setFilterGain(i, filter.gain)
          }
          if (this.filterHasQ(filter.type)) {
            this.weq8.setFilterQ(i, filter.Q)
          }
          this.weq8.toggleBypass(i, filter.bypass)
        } else {
          this.weq8.setFilterType(i, 'noop')
        }
      }
    },

    addFilter() {
      if (this.filters.length >= 8) {
        console.warn('Maximum number of filters (8) reached.')
        return
      }
      const newFilter = { type: 'peaking12', frequency: 1000, gain: 0, Q: 1, bypass: false }
      this.filters.push(newFilter)
      this.syncWeq8Filters()
      this.updateState()
    },

    removeFilter(index) {
      this.filters.splice(index, 1)
      this.syncWeq8Filters()
      this.updateState()
    },

    // Audio initialization methods
    resetFilter(index) {
      const filter = this.filters[index]
      if (filter) {
        filter.gain = 0
        filter.Q = 1
        filter.bypass = false
        this.syncWeq8Filters()
        this.updateState()
      }
    },
    async initializeAudio(audioPath) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      this.audio = new Audio(audioPath)
      this.source = this.audioContext.createMediaElementSource(this.audio)
      this.weq8 = new WEQ8Runtime(this.audioContext)

      // Initialize analyzer node
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 8192
      this.analyserNode.smoothingTimeConstant = 0.5

      // Set up audio routing
      this.source.connect(this.weq8.input)
      this.weq8.connect(this.analyserNode)
      this.analyserNode.connect(this.audioContext.destination)

      // Try to load saved state
      const savedState = this.loadFromLocalStorage()
      if (savedState?.filters) {
        this.filters = this.initializeWithSavedState(savedState)
      } else {
        this.filters = this.initializeFilterPositions()
        this.syncWeq8Filters() // Sync for default filters
      }

      return {
        audioContext: this.audioContext,
        analyserNode: this.analyserNode,
        source: this.source,
        weq8: this.weq8,
        nyquist: this.nyquist,
      }
    },

    initializeWithSavedState(savedState) {
      const filters = savedState.filters.map((filter) => ({
        type: filter.type,
        frequency: filter.frequency,
        gain: filter.gain,
        Q: filter.Q || 1,
        bypass: filter.bypass,
      }))

      filters.forEach((filter, index) => {
        this.weq8.setFilterType(index, filter.type)
        this.weq8.setFilterFrequency(index, filter.frequency)
        if (this.filterHasGain(filter.type)) {
          this.weq8.setFilterGain(index, filter.gain)
        }
        if (this.filterHasQ(filter.type)) {
          this.weq8.setFilterQ(index, filter.Q)
        }
        this.weq8.toggleBypass(index, filter.bypass)
      })

      return filters
    },

    initializeFilterPositions() {
      const savedState = this.loadFromLocalStorage()

      if (savedState?.filters) {
        return savedState.filters.map((filter) => ({
          ...filter,
          Q: filter.Q || 1,
          bypass: filter.bypass || false,
        }))
      }

      return this.createSpacedFilters(this.defaultFilters)
    },

    // Audio control methods
    async playAudio() {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      await this.audio.play()
    },

    pauseAudio() {
      this.audio?.pause()
    },

    cleanup() {
      this.analyserNode?.disconnect()
      this.audio?.pause()
      this.audio = null
      this.audioContext?.close()
    },
    // Drag handling methods
    startDragging(event, index) {
      event.preventDefault()
      event.stopPropagation()

      const handle = event.target
      handle.setPointerCapture(event.pointerId)

      this.selectedPoint = index
      this.isDragging = true
      const filter = this.filters[index]
      this.dragState = {
        index: index,
        startX: event.clientX,
        startY: event.clientY,
        startFreq: filter.frequency,
        startGain: filter.gain,
        pointerId: event.pointerId,
      }
    },

    stopDragging(event) {
      if (this.isDragging && this.dragState?.pointerId === event.pointerId) {
        const handle = event.target
        handle.releasePointerCapture(event.pointerId)

        this.updateState() // Persist the final state
        this.isDragging = false
        this.selectedPoint = null
        this.dragState = null
      }
    },

    handleDrag(event, containerRef, weq8) {
      if (!this.isDragging || !this.dragState || this.dragState.pointerId !== event.pointerId)
        return

      const rect = containerRef.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      const deltaX = event.clientX - this.dragState.startX
      const deltaY = event.clientY - this.dragState.startY

      // --- Frequency Calculation (Logarithmic) ---
      const minFreq = 20
      const maxFreq = this.nyquist
      const startFreqLog = toLog10(this.dragState.startFreq, minFreq, maxFreq)
      const pixelDeltaAsPercent = deltaX / width
      const newFreq = toLin(startFreqLog + pixelDeltaAsPercent, minFreq, maxFreq)
      const clampedFreq = Math.max(minFreq, Math.min(maxFreq, newFreq))

      // --- Gain Calculation (Linear) ---
      const gainRange = 36 // -18 to +18
      const gainPerPixel = gainRange / height
      const newGain = this.dragState.startGain - deltaY * gainPerPixel
      const clampedGain = Math.max(-18, Math.min(18, newGain))

      const filter = this.filters[this.dragState.index]

      // --- Update state for UI handle position ---
      filter.frequency = clampedFreq
      if (this.filterHasGain(filter.type)) {
        filter.gain = clampedGain
      }

      // --- DIRECTLY update weq8 runtime for immediate audio response ---
      if (weq8) {
        weq8.setFilterFrequency(this.dragState.index, clampedFreq)
        if (this.filterHasGain(filter.type)) {
          weq8.setFilterGain(this.dragState.index, clampedGain)
        }
      }
    },

    handleFilterScroll(event, index, weq8) {
      event.preventDefault()
      const filter = this.filters[index]
      if (!this.filterHasQ(filter.type)) return

      const delta = Math.sign(event.deltaY) * -1
      const step = 0.1
      const newQ = Math.max(0.1, Math.min(10, filter.Q + delta * step))

      this.updateFilter(index, 'Q', newQ, weq8)
    },

    async updateFilter(index, property, value, weq8) {
      const filter = this.filters[index]
      const startValue = filter[property]

      if (property === 'frequency' || property === 'gain' || property === 'Q') {
        filter[property] = value
      } else {
        filter[property] = value
      }

      if (!weq8) return

      switch (property) {
        case 'type':
          weq8.setFilterType(index, value)
          break
        case 'frequency':
          weq8.setFilterFrequency(index, value)
          break
        case 'gain':
          if (this.filterHasGain(filter.type)) {
            weq8.setFilterGain(index, value)
          }
          break
        case 'Q':
          if (this.filterHasQ(filter.type)) {
            weq8.setFilterQ(index, value)
          }
          break
        case 'bypass':
          weq8.toggleBypass(index, value)
          break
      }
    },

    createSpacedFilters(defaultFilters) {
      return defaultFilters.map((defaultFilter) => ({
        ...defaultFilter,
        gain: 0,
        Q: 1,
        bypass: false,
      }))
    },

    updateState() {
      // Save complete filter state including all properties
      const completeState = {
        filters: this.filters.map((filter) => ({
          type: filter.type,
          frequency: filter.frequency,
          gain: filter.gain,
          Q: filter.Q,
          bypass: filter.bypass,
        })),
      }

      this.savedState = completeState
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      try {
        if (this.savedState) {
          console.log('Saving complete state:', this.savedState)
          localStorage.setItem('equalizerState', JSON.stringify(this.savedState))
          return true
        }
        return false
      } catch (error) {
        console.error('Error saving equalizer state:', error)
        return false
      }
    },

    loadFromLocalStorage() {
      try {
        const savedState = localStorage.getItem('equalizerState')
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          // Validate that we have all required properties
          if (parsedState.filters && parsedState.filters.length > 0) {
            this.savedState = parsedState
            console.log('Loaded complete state:', this.savedState)
            return this.savedState
          }
        }
        return null
      } catch (error) {
        console.error('Error loading equalizer state:', error)
        return null
      }
    },
    getDefaultFilters() {
      return [...this.defaultFilters]
    },
  },
})
