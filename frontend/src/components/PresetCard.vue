<template>
  <div class="preset-card transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
    <Card class="card h-full">
      <template #header>
        <div class="relative h-32 border-b border-surface-200 dark:border-surface-700">
          <Chart ref="chart" type="line" :data="chartData" :options="chartOptions" class="w-full h-full" />
          <Badge v-if="preset.isStaffPick" value="Staff Pick" class="absolute top-2 right-2" severity="success" />
        </div>
      </template>
      <template #title>
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-xl font-bold">{{ preset.name }}</h3>
            <p class="text-sm text-text-secondary">by {{ preset.creator }}</p>
          </div>
          <Rating :modelValue="preset.rating" readonly :cancel="false" />
        </div>
      </template>
      <template #content>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <Tag v-for="tag in preset.tags" :key="tag" :value="tag" class="text-xs" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-text-secondary">
              {{ (preset.usageCount || 0).toLocaleString() }} users
            </span>
            <div class="flex gap-2">
              <Button icon="pi pi-play" class="p-button-rounded p-button-outlined" @click="$emit('apply', preset)"
                tooltip="Quick Apply" />
              <Button icon="pi pi-download" class="p-button-rounded p-button-outlined"
                @click="$emit('download', preset)" tooltip="Download" />
              <Button v-if="showActions" icon="pi pi-pencil"
                class="p-button-rounded p-button-outlined p-button-secondary" @click="$emit('edit', preset)"
                tooltip="Edit" />
              <Button v-if="showActions" icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger"
                @click="$emit('delete', preset)" tooltip="Delete" />
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Rating from 'primevue/rating'
import Chart from 'primevue/chart'

export default {
  name: 'PresetCard',
  components: {
    Card,
    Button,
    Tag,
    Badge,
    Rating,
    Chart
  },
  props: {
    preset: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  emits: ['apply', 'download', 'edit', 'delete'],
  computed: {
    chartData() {
      let chartColor = this.preset.color || '#4ade80';
      if (!chartColor.startsWith('#')) {
        chartColor = `#${chartColor}`;
      }
      return {
        ...this.preset.chartData,
        datasets: this.preset.chartData.datasets.map(dataset => ({
          ...dataset,
          borderColor: chartColor,
        })),
      };
    },
  },
  watch: {
    chartData: {
      handler() {
        this.redrawChart();
      },
      deep: true,
    },
  },
  data() {
    return {
      chartOptions: {
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            displayColors: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            callbacks: {
              title: (context) => {
                return `Frequency: ${context[0].label}`;
              },
              label: (context) => {
                const gain = context.parsed.y.toFixed(1);
                return `Gain: ${gain} dB`;
              }
            }
          }
        },
        scales: {
          y: {
            display: false,
            min: -18,
            max: 18
          },
          x: {
            display: false
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
          }
        }
      }
    };
  },
  methods: {
    redrawChart() {
      if (this.$refs.chart) {
        this.$refs.chart.reinit();
      }
    },
  }
};
</script>

<style scoped>
.preset-card {
  @apply relative;
}

.preset-card:hover {
  transform: translateY(-2px);
}

:deep(.p-card) {
  @apply h-full;
}

:deep(.p-card-content) {
  @apply p-4;
}

:deep(.p-tag) {
  background: var(--color-accent-primary);
}

:deep(.p-badge) {
  background: var(--color-accent-primary);
}

:deep(.p-rating-icon) {
  color: var(--color-accent-primary);
}
</style>
