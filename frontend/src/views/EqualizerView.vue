<script>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Select from 'primevue/select';

import { useEqualizerStore } from '@/stores/equalizerStore';
import { useAuthStore } from '@/stores/authStore';
import GridCanvas from '@/components/GridCanvas.vue';
import AnalyzerCanvas from '@/components/AnalyzerCanvas.vue';
import ResponseCanvas from '@/components/ResponseCanvas.vue';
import FilterHandles from '@/components/FilterHandles.vue';
import BandControls from '@/components/BandControls.vue';
import EqControls from '@/components/EqControls.vue';
import FrequencyRegions from '@/components/FrequencyRegions.vue';

export default {
  name: 'Equalizer',
  components: {
    Select,
    Card,
    Button,
    GridCanvas,
    AnalyzerCanvas,
    ResponseCanvas,
    FilterHandles,
    BandControls,
    EqControls,
    FrequencyRegions
  },
  data() {
    const equalizerStore = useEqualizerStore();
    const authStore = useAuthStore();
    return {
      equalizerStore,
      authStore,
      preset: {
        name: 'Equalizer',
        description: '',
      },
      uploadedFile: null,
      exportedSettings: '',
      importedSettings: '',
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
    }
  },
  methods: {
    addFilter() {
      this.equalizerStore.addFilter();
    },
    removeFilter(index) {
      this.equalizerStore.removeFilter(index);
    },

    resetFilter(index) {
      this.equalizerStore.resetFilter(index);
    },

    async initializeAudio() {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      const audioPath = new URL('@/assets/audio/sample_audio.mp3', import.meta.url).href
      const {
        analyserNode,
        source,
        weq8,
        nyquist
      } = await this.equalizerStore.initializeAudio(this.audioContext, audioPath)

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
      this.equalizerStore.handleDrag(
        event,
        this.$refs.eqContainer,
        this.weq8,
      )
    },

    handleFilterScroll(event, index) {
      this.equalizerStore.handleFilterScroll(event, index, this.weq8)
    },

    updateFilter(index, property, value) {
      this.equalizerStore.updateFilter(
        index,
        property,
        value,
        this.weq8
      )
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
      this.showFrequencyRegions = !this.showFrequencyRegions;
    },

    handleHighlightRegion(range) {
      this.highlightedRange = range;
    },

  },

  async mounted() {
    await this.initializeAudio()
  },

  beforeUnmount() {
    this.equalizerStore.cleanup()
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex-1 pt-24 px-6 lg:px-20 pb-6">
      <div class="grid grid-cols-12 gap-6">
        <!-- Left Controls -->
        <div class="col-span-12 lg:col-span-2">
          <EqControls :weq8="weq8" :filters="equalizerStore.filters" :audio-context="audioContext" :source="source"
            :analyser-node="analyserNode" @update:filters="equalizerStore.filters = $event"
            @update-weq8="weq8 = $event" />
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
                <div ref="eqContainer"
                  class="border-2 border-gray-300 dark:border-gray-600 w-full h-[40vh] md:h-[50vh] lg:h-[60vh] relative mb-6 bg-gray-900 rounded-lg overflow-hidden"
                  style="background-color: var(--eq-background)">
                  <GridCanvas :nyquist="nyquist" :device-pixel-ratio="devicePixelRatio"
                    :highlighted-range="highlightedRange" />
                  <AnalyzerCanvas v-if="analyserNode" :analyser-node="analyserNode" :nyquist="nyquist"
                    :device-pixel-ratio="devicePixelRatio" />
                  <ResponseCanvas :weq8="weq8" :filters="equalizerStore.filters" :nyquist="nyquist"
                    :device-pixel-ratio="devicePixelRatio" @pointermove="handleDrag" @pointerup="stopDragging"
                    @pointerleave="stopDragging" />
                  <FilterHandles :filters="equalizerStore.filters" :selected-point="equalizerStore.selectedPoint"
                    :nyquist="nyquist" @update:filters="equalizerStore.filters = $event" @pointerdown="startDragging"
                    @pointermove="handleDrag" @pointerup="stopDragging" @pointercancel="stopDragging"
                    @wheel="handleFilterScroll" />
                </div>
                <div class="flex gap-4 items-center">
                  <Button icon="pi pi-play" severity="success" @click="playAudio" />
                  <Button icon="pi pi-pause" severity="secondary" @click="pauseAudio" />
                  <Button :label="showFrequencyRegions ? 'Hide Frequency Regions' : 'Show Frequency Regions'"
                    icon="pi pi-chart-bar" severity="info" @click="toggleFrequencyRegions" />
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
              <BandControls :filters="equalizerStore.filters" :filter-types="equalizerStore.filterTypes"
                :nyquist="nyquist" :weq8="weq8" @update-filter="updateFilter" @add-filter="addFilter"
                @remove-filter="removeFilter" @reset-filter="resetFilter" />
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
