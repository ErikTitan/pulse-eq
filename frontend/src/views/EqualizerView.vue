<script>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Message from 'primevue/message'
import Slider from 'primevue/slider'

import { useEqualizerStore } from '@/stores/equalizerStore'
import { useAuthStore } from '@/stores/authStore'
import { useAudioUploadStore } from '@/stores/audioUploadStore'
import GridCanvas from '@/components/GridCanvas.vue'
import AnalyzerCanvas from '@/components/AnalyzerCanvas.vue'
import ResponseCanvas from '@/components/ResponseCanvas.vue'
import FilterHandles from '@/components/FilterHandles.vue'
import BandControls from '@/components/BandControls.vue'
import EqControls from '@/components/EqControls.vue'
import FrequencyRegions from '@/components/FrequencyRegions.vue'
import AudioUploadManager from '@/components/AudioUploadManager.vue'

export default {
  name: 'Equalizer',
  components: {
    Message,
    Select,
    Card,
    Button,
    GridCanvas,
    AnalyzerCanvas,
    ResponseCanvas,
    FilterHandles,
    BandControls,
    EqControls,
    FrequencyRegions,
    AudioUploadManager,
    Slider,
  },
  data() {
    const equalizerStore = useEqualizerStore()
    const authStore = useAuthStore()
    const audioUploadStore = useAudioUploadStore()
    return {
      equalizerStore,
      authStore,
      audioUploadStore,
      preset: {
        name: 'Equalizer',
        description: '',
      },
      analyserNode: null,
      audio: null,
      audioContext: null,
      source: null,
      weq8: null,
      selectedPoint: null,
      devicePixelRatio: window.devicePixelRatio || 1,
      nyquist: 20000,
      showFrequencyRegions: false,
      highlightedRange: null,
      isBrowserSupported: true,
      seekValue: 0,
      isSeeking: false,
    }
  },
  computed: {
    formattedCurrentTime() {
      return this.formatTime(this.equalizerStore.currentTime)
    },
    formattedDuration() {
      return this.formatTime(this.equalizerStore.duration)
    },
  },
  methods: {
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },
    onSeek(event) {
      this.isSeeking = true
      // Handle PrimeVue event object if present
      const val =
        typeof event === 'number'
          ? event
          : event && event.value !== undefined
            ? event.value
            : this.seekValue
      this.seekValue = val
    },
    onSeekEnd(event) {
      this.isSeeking = false
      // Handle PrimeVue event object if present
      const val =
        typeof event === 'number'
          ? event
          : event && event.value !== undefined
            ? event.value
            : this.seekValue
      this.equalizerStore.seek(val)
    },
    updateProgress() {
      if (this.equalizerStore.isPlaying) {
        this.equalizerStore.updateTime()
        if (!this.isSeeking) {
          this.seekValue = this.equalizerStore.currentTime
        }
        requestAnimationFrame(this.updateProgress)
      }
    },
    addFilter() {
      this.equalizerStore.addFilter()
    },
    removeFilter(index) {
      this.equalizerStore.removeFilter(index)
    },

    resetFilter(index) {
      this.equalizerStore.resetFilter(index)
    },

    async initializeAudio() {
      // Clean up existing audio context before creating a new one

      // Clean up existing audio resources if they exist
      if (this.source) {
        this.source.disconnect()
      }
      if (this.audio) {
        this.audio.pause()
        this.audio = null
      }

      // Create or reuse audio context
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      }

      // Determine audio source based on sourceId or current store selection
      const currentSourceId = this.audioUploadStore.selectedAudioSource
      let audioSource
      let audioBuffer = null

      if (currentSourceId && currentSourceId !== 'default') {
        // Use uploaded file
        const selectedFile = this.audioUploadStore.getFileById(currentSourceId)
        console.log('[EqualizerView] Selected file from store:', selectedFile)
        if (selectedFile) {
          audioSource = selectedFile.objectUrl
          audioBuffer = selectedFile.audioBuffer
          console.log('[EqualizerView] Using uploaded file. URL:', audioSource)
          console.log('[EqualizerView] Using uploaded file. Buffer:', audioBuffer)
        } else {
          // Fallback to default if uploaded file not found
          audioSource = new URL('@/assets/audio/sample_audio.mp3', import.meta.url).href
        }
      } else {
        // Use default audio file
        audioSource = new URL('@/assets/audio/sample_audio.mp3', import.meta.url).href
      }

      const { analyserNode, source, weq8, nyquist } = await this.equalizerStore.initializeAudio(
        this.audioContext,
        audioSource,
        audioBuffer,
      )

      this.analyserNode = analyserNode
      this.source = source
      this.weq8 = weq8
      this.nyquist = nyquist
    },

    // Filter interaction methods
    startDragging(event, index) {
      this.equalizerStore.startDragging(event, index)
    },

    stopDragging(event) {
      this.equalizerStore.stopDragging(event)
    },

    handleDrag(event) {
      this.equalizerStore.handleDrag(event, this.$refs.eqContainer, this.weq8)
    },

    handleFilterScroll(event, index) {
      this.equalizerStore.handleFilterScroll(event, index, this.weq8)
    },

    updateFilter(index, property, value) {
      this.equalizerStore.updateFilter(index, property, value, this.weq8)
    },

    // Audio control methods
    playAudio() {
      this.equalizerStore.playAudio()
    },

    pauseAudio() {
      this.equalizerStore.pauseAudio()
    },

    // Frequency region methods
    toggleFrequencyRegions() {
      this.showFrequencyRegions = !this.showFrequencyRegions
    },

    handleHighlightRegion(range) {
      this.highlightedRange = range
    },
  },

  watch: {
    // Watch for changes in the selected audio source from the store
    'audioUploadStore.selectedAudioSource': {
      handler(newSourceId, oldSourceId) {
        if (newSourceId !== oldSourceId) {
          console.log(
            `[EqualizerView] Audio source changed from "${oldSourceId}" to "${newSourceId}". Re-initializing audio.`,
          )
          this.initializeAudio()
        }
      },
      immediate: false,
    },
    'audioUploadStore.isOriginalAudio': {
      handler(isOriginal) {
        this.equalizerStore.setGlobalBypass(isOriginal)
      },
    },
    'equalizerStore.isPlaying': {
      handler(isPlaying) {
        if (isPlaying) {
          this.updateProgress()
        }
      },
    },
    'equalizerStore.currentTime': {
      handler(time) {
        if (!this.isSeeking && !this.equalizerStore.isPlaying) {
          this.seekValue = time
        }
      },
    },
  },

  async mounted() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      this.isBrowserSupported = false
    } else {
      await this.initializeAudio()
    }
  },

  beforeUnmount() {
    this.equalizerStore.cleanup()
    if (this.audioContext) {
      this.audioContext.close()
    }
    if (this.source) {
      this.source.disconnect()
      this.source = null
    }
  },
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex-1 pt-24 px-6 lg:px-20 pb-6">
      <Message v-if="!isBrowserSupported" severity="warn" :closable="false">
        Your browser does not support the Web Audio API, which is required for this application to
        function. Please use a modern browser like Chrome, Firefox, or Safari.
      </Message>
      <div class="grid grid-cols-12 gap-6">
        <!-- Left Controls -->
        <div class="col-span-12 lg:col-span-2">
          <EqControls
            :weq8="weq8"
            :filters="equalizerStore.filters"
            :audio-context="audioContext"
            :source="source"
            :analyser-node="analyserNode"
            @update:filters="equalizerStore.filters = $event"
            @update-weq8="weq8 = $event"
          />
        </div>

        <!-- Main Content -->
        <div class="col-span-12 lg:col-span-10 flex flex-col gap-6">
          <!-- Equalizer Display -->
          <Card class="shadow-xl flex-grow">
            <template #title>
              <div class="text-2xl font-semibold mb-2">{{ preset.name }}</div>
            </template>
            <template #content>
              <div class="flex flex-col items-center justify-center h-full">
                <div
                  ref="eqContainer"
                  class="border-2 border-gray-300 dark:border-gray-600 w-full h-[40vh] md:h-[50vh] lg:h-[60vh] relative mb-6 bg-gray-900 rounded-lg overflow-hidden"
                  style="background-color: var(--eq-background)"
                >
                  <GridCanvas
                    :nyquist="nyquist"
                    :device-pixel-ratio="devicePixelRatio"
                    :highlighted-range="highlightedRange"
                  />
                  <AnalyzerCanvas
                    v-if="analyserNode"
                    :analyser-node="analyserNode"
                    :nyquist="nyquist"
                    :device-pixel-ratio="devicePixelRatio"
                  />
                  <ResponseCanvas
                    :weq8="weq8"
                    :filters="equalizerStore.filters"
                    :nyquist="nyquist"
                    :device-pixel-ratio="devicePixelRatio"
                    @pointermove="handleDrag"
                    @pointerup="stopDragging"
                    @pointerleave="stopDragging"
                  />
                  <FilterHandles
                    :filters="equalizerStore.filters"
                    :selected-point="equalizerStore.selectedPoint"
                    :nyquist="nyquist"
                    @update:filters="equalizerStore.filters = $event"
                    @pointerdown="startDragging"
                    @pointermove="handleDrag"
                    @pointerup="stopDragging"
                    @pointercancel="stopDragging"
                    @wheel="handleFilterScroll"
                  />
                </div>
                <div class="w-full px-4 mb-4">
                  <div class="flex justify-between text-xs text-surface-500 mb-2">
                    <span>{{ formattedCurrentTime }}</span>
                    <span>{{ formattedDuration }}</span>
                  </div>
                  <Slider
                    v-model="seekValue"
                    :min="0"
                    :max="equalizerStore.duration"
                    :step="0.1"
                    @slideend="onSeekEnd"
                    @slide="onSeek"
                    @change="onSeekEnd"
                    class="w-full"
                  />
                </div>
                <div class="flex gap-4 items-center">
                  <Button icon="pi pi-play" severity="success" @click="playAudio" />
                  <Button icon="pi pi-pause" severity="secondary" @click="pauseAudio" />
                  <Button
                    :label="
                      showFrequencyRegions ? 'Hide Frequency Regions' : 'Show Frequency Regions'
                    "
                    icon="pi pi-chart-bar"
                    severity="info"
                    @click="toggleFrequencyRegions"
                  />
                </div>
              </div>
            </template>
          </Card>

          <!-- Frequency Regions -->
          <Card v-if="showFrequencyRegions" class="shadow-xl">
            <template #content>
              <FrequencyRegions @highlight-region="handleHighlightRegion" />
            </template>
          </Card>

          <!-- Band Controls -->
          <Card class="shadow-xl">
            <template #title>
              <div class="text-xl font-semibold mb-4">Band Controls</div>
            </template>
            <template #content>
              <BandControls
                :filters="equalizerStore.filters"
                :filter-types="equalizerStore.filterTypes"
                :nyquist="nyquist"
                :weq8="weq8"
                @update-filter="updateFilter"
                @add-filter="addFilter"
                @remove-filter="removeFilter"
                @reset-filter="resetFilter"
              />
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas {
  image-rendering: pixelated;
  background: transparent;
}
</style>
