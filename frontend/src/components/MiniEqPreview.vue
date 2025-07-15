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

<script>
export default {
  name: 'MiniEqPreview',
  props: {
    preset: {
      type: Object,
      required: true
    }
  },
  emits: ['apply', 'download'],
  computed: {
    frequencyBands() {
      try {
        const settings = typeof this.preset.settings === 'string'
          ? JSON.parse(this.preset.settings)
          : this.preset.settings;
        return Array.isArray(settings) ? settings : [];
      } catch (e) {
        console.error('Error parsing preset settings:', e);
        return [];
      }
    }
  },
  watch: {
    preset: {
      handler() {
        this.drawEqCurve();
      },
      deep: true
    }
  },
  mounted() {
    this.drawEqCurve();
  },
  methods: {
    formatFrequency(freq) {
      if (freq >= 1000) {
        return `${Math.round(freq / 1000)}kHz`;
      }
      return `${Math.round(freq)}Hz`;
    },
    formatGain(gain) {
      const gainDb = gain || 0;
      return gainDb >= 0 ? `+${gainDb.toFixed(1)}dB` : `${gainDb.toFixed(1)}dB`;
    },
    drawEqCurve() {
      const canvas = this.$refs.eqCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Normalize color to ensure valid hex format
      let color = this.preset.color || '#4ade80';
      if (!color.startsWith('#')) {
        color = `#${color}`;
      }
      // Validate hex color format and fallback if invalid
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        color = '#4ade80';
      }

      // Set up the drawing style
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = `${color}20`;

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
      if (this.frequencyBands.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        ctx.beginPath();

        this.frequencyBands.forEach((band, index) => {
          const x = (width / (this.frequencyBands.length - 1)) * index;
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
        ctx.fillStyle = `${color}20`;
        ctx.fill();
      }
    }
  }
}
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
