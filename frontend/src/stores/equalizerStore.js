import { defineStore } from 'pinia'
import { WEQ8Runtime } from 'weq8'

export const useEqualizerStore = defineStore('equalizer', {
  state: () => ({
    savedState: null,
    defaultFilters: [
      { type: 'lowshelf12', frequency: 80, gain: 0, Q: 1, bypass: false },
      { type: 'peaking12', frequency: 200, gain: 0, Q: 1, bypass: false },
      { type: 'peaking12', frequency: 500, gain: 0, Q: 1, bypass: false },
      { type: 'highshelf12', frequency: 1000, gain: 0, Q: 1, bypass: false },
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
    audioContext: null,
    analyserNode: null,
    audio: null,
    source: null,
    weq8: null,
    nyquist: 24000,
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
    // Audio initialization methods
    async initializeAudio(audioPath) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.nyquist = this.audioContext.sampleRate / 2

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
      const filters = savedState?.filters
        ? this.initializeWithSavedState(savedState)
        : this.initializeFilterPositions()

      return {
        filters,
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
    },

    stopDragging(event, filters) {
      if (this.selectedPoint !== null) {
        const handle = event.target
        handle.releasePointerCapture(event.pointerId)

        this.updateState(filters)
      }
      this.isDragging = false
      this.selectedPoint = null
    },

    handleDrag(event, containerRef, filters, weq8, nyquist) {
      if (!this.isDragging || this.selectedPoint === null) return

      const rect = containerRef.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const width = rect.width
      const minF = Math.log10(20)
      const maxF = Math.log10(nyquist)
      const logX = (x / width) * (maxF - minF) + minF
      const newFreq = Math.pow(10, logX)

      const height = rect.height
      const newGain = 15 - (y / height) * 30

      const filter = filters[this.selectedPoint]
      if (this.filterHasGain(filter.type)) {
        this.updateFilter(
          this.selectedPoint,
          'gain',
          Math.max(-15, Math.min(15, newGain)),
          filters,
          weq8,
        )
      }

      const clampedFreq = Math.max(20, Math.min(nyquist, newFreq))
      this.updateFilter(this.selectedPoint, 'frequency', clampedFreq, filters, weq8)
    },

    handleFilterScroll(event, index, filters, weq8) {
      event.preventDefault()
      const filter = filters[index]
      if (!this.filterHasQ(filter.type)) return

      const delta = Math.sign(event.deltaY) * -1
      const step = 0.1
      const newQ = Math.max(0.1, Math.min(10, filter.Q + delta * step))

      this.updateFilter(index, 'Q', newQ, filters, weq8)
    },

    async updateFilter(index, property, value, filters, weq8) {
      const filter = filters[index]
      const startValue = filter[property]

      if (property === 'frequency' || property === 'gain' || property === 'Q') {
        if (property === 'gain') {
          filter[property] = value
        } else {
          const transitionedValue = await this.smoothTransition(startValue, value)
          filter[property] = transitionedValue
        }
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

    async smoothTransition(startValue, endValue, duration = 50) {
      return new Promise((resolve) => {
        const startTime = performance.now()

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)

          const eased =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2

          const currentValue = startValue + (endValue - startValue) * eased

          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            resolve(endValue)
          }

          return currentValue
        }

        requestAnimationFrame(animate)
      })
    },

    createSpacedFilters(defaultFilters, audioContext) {
      const minF = Math.log10(80)
      const maxF = Math.log10((audioContext.sampleRate / 2) * 0.75)
      const step = (maxF - minF) / (defaultFilters.length - 1)

      return defaultFilters.map((defaultFilter, index) => ({
        ...defaultFilter,
        frequency: Math.pow(10, minF + step * index),
        gain: 0,
        Q: 1,
        bypass: false,
      }))
    },

    updateState(filters) {
      // Save complete filter state including all properties
      const completeState = {
        filters: filters.map((filter) => ({
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
