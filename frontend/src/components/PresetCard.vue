<template>
  <div class="preset-card transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
    <Card class="card h-full">
      <template #header>
        <div class="relative h-32">
          <Chart type="line" :data="preset.chartData" :options="chartOptions" class="w-full h-full" />
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
              {{ preset.usageCount.toLocaleString() }} users
            </span>
            <div class="flex gap-2">
              <Button icon="pi pi-play" class="p-button-rounded p-button-outlined" @click="$emit('apply', preset)"
                tooltip="Quick Apply" />
              <Button icon="pi pi-download" class="p-button-rounded p-button-outlined"
                @click="$emit('download', preset)" tooltip="Download" />
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
    }
  },
  emits: ['apply', 'download'],
  computed: {
    chartOptions() {
      return {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            display: false,
            min: -12,
            max: 12
          },
          x: {
            display: false
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    }
  }
}
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
