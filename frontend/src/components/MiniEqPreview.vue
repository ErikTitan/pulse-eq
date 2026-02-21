<template>
  <div class="mini-eq-preview">
    <!-- Mini EQ Visualization -->
    <div
      class="eq-visualization rounded-xl p-4 mb-6 relative border border-surface overflow-hidden"
      style="height: 200px"
      @mousemove="handleInteraction"
      @mouseleave="resetInteraction"
    >
      <div class="w-full h-full relative z-10">
        <div class="preset-modal-glow" :style="glowStyle"></div>
        <Chart
          v-if="chartReady"
          type="line"
          :data="chartData"
          :options="chartOptions"
          class="w-full h-full relative z-20"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'primevue/chart'
import { mapStores } from 'pinia'
import { useThemeStore } from '@/stores/themeStore'

export default {
  name: 'MiniEqPreview',
  components: {
    Chart,
  },
  props: {
    preset: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chartReady: false,
      glowStyle: {},
    }
  },
  computed: {
    ...mapStores(useThemeStore),
    frequencyBands() {
      try {
        const settings =
          typeof this.preset.settings === 'string'
            ? JSON.parse(this.preset.settings)
            : this.preset.settings
        return Array.isArray(settings) ? settings : []
      } catch (e) {
        console.error('Error parsing preset settings:', e)
        return []
      }
    },
    chartOptions() {
      const isDark = this.themeStore.isDarkMode
      const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
      const tooltipTitleColor = isDark ? '#ffffff' : '#374151'
      const tooltipBodyColor = isDark ? '#ffffff' : '#4b5563'
      const tooltipBorderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      const textColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'

      return {
        maintainAspectRatio: false,
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            backgroundColor: tooltipBg,
            titleColor: tooltipTitleColor,
            bodyColor: tooltipBodyColor,
            borderColor: tooltipBorderColor,
            borderWidth: 1,
            callbacks: {
              title: (context) => {
                return `Frequency: ${context[0].label}`
              },
              label: (context) => {
                const gain = context.parsed.y.toFixed(1)
                return `Gain: ${gain >= 0 ? '+' : ''}${gain} dB`
              },
            },
          },
        },
        scales: {
          y: {
            display: true,
            min: -18,
            max: 18,
            grid: {
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              callback: (value) => `${value}dB`,
              maxTicksLimit: 5,
              font: {
                size: 10,
              },
            },
          },
          x: {
            display: true,
            grid: {
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              maxTicksLimit: 6,
              font: {
                size: 10,
              },
            },
          },
        },
        elements: {
          line: {},
        },
      }
    },
    chartData() {
      const { hex: chartColor, r, g, b } = this.parseHexColor(this.preset.color)

      const labels = this.frequencyBands.map((band) => this.formatFrequency(band.frequency))
      const data = this.frequencyBands.map((band) => band.gain || 0)

      return {
        labels,
        datasets: [
          {
            label: 'Gain (dB)',
            data,
            borderColor: chartColor,
            fill: true,
            tension: 0.4,
            backgroundColor: (context) => {
              const chart = context.chart
              const { ctx, chartArea } = chart
              if (!chartArea) {
                return null
              }
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
              gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`)
              gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
              return gradient
            },
          },
        ],
      }
    },
  },
  mounted() {
    // Small delay to ensure all reactive dependencies have settled
    setTimeout(() => {
      this.chartReady = true
    }, 16)
  },
  methods: {
    handleInteraction(e) {
      // Handle Glow
      const el = e.currentTarget
      const { left, top } = el.getBoundingClientRect()
      
      const x = e.clientX - left
      const y = e.clientY - top
      
      const { r, g, b } = this.parseHexColor(this.preset.color)
      this.glowStyle = {
        '--glow-x': `${x}px`,
        '--glow-y': `${y}px`,
        '--glow-color-rgb': `${r}, ${g}, ${b}`,
        opacity: 1,
      }
    },
    resetInteraction() {
      this.glowStyle = {
        opacity: 0,
      }
    },
    formatFrequency(freq) {
      if (freq >= 1000) {
        return `${Math.round(freq / 1000)}kHz`
      }
      return `${Math.round(freq)}Hz`
    },
    parseHexColor(hex) {
      let color = hex || '#4ade80'
      if (!color.startsWith('#')) {
        color = `#${color}`
      }
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        color = '#4ade80'
      }
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        hex: color,
      }
    },
  },
}
</script>

<style scoped>
.mini-eq-preview {
  background: transparent;
  @apply w-full mx-auto;
}

.eq-visualization {
  background: transparent;
}

.preset-modal-glow {
  --glow-size: 350px;
  position: absolute;
  top: var(--glow-y);
  left: var(--glow-x);
  width: var(--glow-size);
  height: var(--glow-size);
  background-image: radial-gradient(
    circle at center,
    rgba(var(--glow-color-rgb), 0.2) 0%,
    rgba(var(--glow-color-rgb), 0) 70%
  );
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
  z-index: 0;
}
</style>
