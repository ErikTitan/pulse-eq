<template>
  <div class="mini-eq-preview">
    <!-- Mini EQ Visualization -->
    <div class="eq-visualization rounded-lg p-4 mb-4">
      <canvas ref="eqCanvas" width="300" height="120" class="w-full h-auto"></canvas>
    </div>

    <!-- Frequency Response Info -->
    <div class="frequency-info mb-4">
      <div class="flex flex-wrap gap-2">
        <div v-for="band in frequencyBands" :key="band.frequency" class="text-xs frequency-band px-2 py-1 rounded">
          {{ formatFrequency(band.frequency) }}: {{ formatGain(band.gain) }}
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons flex space-x-2">
      <Button @click="$emit('apply', preset)" label="Apply Preset" severity="success" class="flex-1" />
      <Button @click="$emit('download', preset)" label="Download" severity="info" class="flex-1" />
    </div>
  </div>
</template>

<script>
import Button from 'primevue/button'

export default {
  name: 'MiniEqPreview',
  components: {
    Button
  },
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

      // Draw grid - use theme-aware color
      const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--p-surface-400').trim() || '#6b7280';
      ctx.strokeStyle = gridColor;
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
  background: transparent;
  @apply rounded-lg p-6 max-w-md mx-auto;
}

.eq-visualization {
  background: var(--p-surface-ground);
}

.eq-visualization canvas {
  background: var(--p-surface-0);
  @apply rounded;
}

.frequency-band {
  background: var(--p-surface-ground);
  border: 1px solid var(--p-surface-border);
  color: var(--p-text-color);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
