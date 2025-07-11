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
        <div class="flex justify-between items-start gap-3">
          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-bold truncate">{{ preset.name }}</h3>
          </div>
          <div class="flex-shrink-0">
            <Rating :modelValue="rating" @update:modelValue="onRate" :readonly="!authStore.isAuthenticated"
              :cancel="false" />
          </div>
        </div>
      </template>
      <template #content>
        <div class="space-y-4">
          <p ref="description" class="text-sm text-surface-600 dark:text-surface-400 min-h-[2.5rem]"
            :class="{ 'line-clamp-2': !isExpanded }">{{ preset.description }}</p>
          <button v-if="isTruncated" @click="toggleExpanded" class="text-sm text-primary-500 hover:underline">
            {{ isExpanded ? 'Show less' : 'Show more' }}
          </button>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UserAvatar v-if="showUserAvatar && preset.user" :user="preset.user" size="small"
                :variant="preset.user.avatar_variant || 'bauhaus'" class="flex-shrink-0" />
              <span class="text-sm text-text-secondary">
                {{ (preset.usageCount || 0).toLocaleString() }} users
              </span>
            </div>
            <div class="flex gap-2">
              <Button icon="pi pi-download" class="p-button-rounded p-button-outlined"
                @click.prevent="$emit('download', preset)" tooltip="Download" />
              <Button v-if="showActions" icon="pi pi-pencil"
                class="p-button-rounded p-button-outlined p-button-secondary" @click="$emit('edit', preset)"
                tooltip="Edit" />
              <Button v-if="showActions" icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger"
                @click="$emit('delete', preset)" tooltip="Delete" />
            </div>
          </div>
          <div class="flex flex-wrap gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
            <Tag v-for="tag in preset.tags" :key="tag.id" :value="tag.name" class="text-xs" />
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
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuthStore } from '@/stores/authStore'
import { ratePreset } from '@/services/presetService'

export default {
  name: 'PresetCard',
  components: {
    Card,
    Button,
    Tag,
    Badge,
    Rating,
    Chart,
    UserAvatar
  },
  props: {
    preset: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: false
    },
    showUserAvatar: {
      type: Boolean,
      default: true
    }
  },
  emits: ['download', 'edit', 'delete', 'rate'],
  data() {
    const authStore = useAuthStore();
    return {
      authStore,
      rating: this.preset.rating,
      isExpanded: false,
      isTruncated: false,
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
  mounted() {
    this.checkTruncation();
  },
  updated() {
    this.checkTruncation();
  },
  methods: {
    checkTruncation() {
      this.$nextTick(() => {
        const descriptionEl = this.$refs.description;
        if (descriptionEl) {
          this.isTruncated = descriptionEl.scrollHeight > descriptionEl.clientHeight;
        }
      });
    },
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    redrawChart() {
      if (this.$refs.chart) {
        this.$refs.chart.reinit();
      }
    },
    async onRate(event) {
      if (!this.authStore.isAuthenticated) {
        // Optionally, trigger login/register modal
        return;
      }
      try {
        await ratePreset(this.preset.id, event.value);
        this.$emit('rate', { presetId: this.preset.id, newRating: event.value });
      } catch (error) {
        console.error('Failed to rate preset:', error);
        // Revert rating on failure
        this.rating = this.preset.rating;
      }
    }
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
