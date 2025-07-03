<template>
  <div class="mini-eq-preview">
    <div class="eq-header">
      <h3 class="text-lg font-bold text-white">{{ preset.name }}</h3>
      <p class="text-sm text-gray-400">by {{ preset.creator }}</p>
    </div>

    <!-- Mini EQ Visualization -->
    <div class="eq-visualization bg-gray-900 rounded-lg p-4 mb-4">
      <canvas ref="eqCanvas" width="300" height="120" class="w-full h-auto"></canvas>
    </div>

    <!-- Frequency Response Info -->
    <div class="frequency-info mb-4">
      <div class="flex flex-wrap gap-2">
        <div v-for="band in frequencyBands" :key="band.frequency" class="text-xs bg-gray-700 px-2 py-1 rounded">
          {{ formatFrequency(band.frequency) }}: {{ formatGain(band.gain) }}
        </div>
      </div>
    </div>

    <!-- Audio Preview (if available) -->
    <div v-if="showAudioPreview" class="audio-preview mb-4">
      <div class="flex items-center space-x-2 bg-gray-800 rounded-lg p-3">
        <button @click="togglePlay" class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full">
          <i :class="isPlaying ? 'pi pi-pause' : 'pi pi-play'" class="text-sm"></i>
        </button>
        <span class="text-sm text-gray-300">Preview with EQ</span>
      </div>
      <audio ref="audioElement" :src="audioSample" @ended="isPlaying = false" preload="metadata"></audio>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons flex space-x-2">
      <button @click="$emit('apply', preset)"
        class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg">
        Apply Preset
      </button>
      <button @click="$emit('download', preset)"
        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
        Download
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
  preset: {
    type: Object,
    required: true
  },
  showAudioPreview: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['apply', 'download']);

const eqCanvas = ref(null);
const audioElement = ref(null);
const isPlaying = ref(false);

// Use the sample audio from your assets
const audioSample = '/src/assets/audio/sample_audio.mp3';

const frequencyBands = computed(() => {
  try {
    const settings = typeof props.preset.settings === 'string'
      ? JSON.parse(props.preset.settings)
      : props.preset.settings;
    return Array.isArray(settings) ? settings : [];
  } catch (e) {
    console.error('Error parsing preset settings:', e);
    return [];
  }
});

const formatFrequency = (freq) => {
  if (freq >= 1000) {
    return `${Math.round(freq / 1000)}kHz`;
  }
  return `${Math.round(freq)}Hz`;
};

const formatGain = (gain) => {
  const gainDb = gain || 0;
  return gainDb >= 0 ? `+${gainDb.toFixed(1)}dB` : `${gainDb.toFixed(1)}dB`;
};

const togglePlay = () => {
  if (audioElement.value) {
    if (isPlaying.value) {
      audioElement.value.pause();
    } else {
      audioElement.value.play();
    }
    isPlaying.value = !isPlaying.value;
  }
};

const drawEqCurve = () => {
  const canvas = eqCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Set up the drawing style
  ctx.strokeStyle = props.preset.color || '#4ade80';
  ctx.lineWidth = 2;
  ctx.fillStyle = `${props.preset.color || '#4ade80'}20`;

  // Draw grid
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;

  // Horizontal grid lines (gain levels)
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical grid lines (frequency divisions)
  for (let i = 0; i <= 6; i++) {
    const x = (width / 6) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw EQ curve
  if (frequencyBands.value.length > 0) {
    ctx.strokeStyle = props.preset.color || '#4ade80';
    ctx.lineWidth = 3;

    ctx.beginPath();

    frequencyBands.value.forEach((band, index) => {
      const x = (width / (frequencyBands.value.length - 1)) * index;
      const gain = band.gain || 0;
      // Map gain from -12dB to +12dB to canvas height
      const y = height - ((gain + 12) / 24) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = `${props.preset.color || '#4ade80'}20`;
    ctx.fill();
  }
};

onMounted(() => {
  drawEqCurve();
});

watch(() => props.preset, () => {
  drawEqCurve();
}, { deep: true });
</script>

<style scoped>
.mini-eq-preview {
  @apply bg-gray-800 rounded-lg p-6 max-w-md mx-auto;
}

.eq-visualization canvas {
  @apply bg-gray-900 rounded;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
