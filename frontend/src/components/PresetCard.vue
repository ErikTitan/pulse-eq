<template>
  <div class="preset-card-wrapper">
    <div class="preset-card " :style="cardStyle">
      <Card class="card h-full">
        <template #header>
          <div class="relative h-32 border-b border-surface overflow-hidden" @mousemove="handleMouseMove"
            @mouseleave="handleMouseLeave">
            <div class="preset-card-glow" :style="glowStyle"></div>
            <Chart v-if="chartReady" ref="chart" type="line" :data="chartData" :options="chartOptions"
              class="w-full h-full relative z-10" :key="`chart-${preset.id}`" />
            <Badge v-if="preset.isStaffPick" value="Staff Pick" class="absolute top-2 right-2" severity="success" />
          </div>
        </template>
        <template #title>
          <div class="flex justify-between items-start gap-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold truncate">{{ preset.name }}</h3>
            </div>
            <div class="flex-shrink-0">
              <Rating :modelValue="preset.rating" :readonly="true" :cancel="false" />
            </div>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <p ref="description" class="text-sm text-color-secondary min-h-[2.5rem]"
              :class="{ 'line-clamp-2': !isExpanded }">{{ preset.description }}</p>
            <button v-if="isTruncated" @click="toggleExpanded" class="text-sm text-primary hover:underline">
              {{ isExpanded ? 'Show less' : 'Show more' }}
            </button>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UserAvatar v-if="showUserAvatar && preset.user" :user="preset.user" size="small"
                  :variant="preset.user.avatar_variant || 'bauhaus'" class="flex-shrink-0" />
                <span class="text-sm text-color-secondary">
                  {{ (preset.usageCount || 0).toLocaleString() }} users
                </span>
              </div>
              <div class="flex gap-2">
                <Button icon="pi pi-download" class="p-button-rounded p-button-outlined"
                  @click.prevent="$emit('download', preset)" tooltip="Download" />
                <Button icon="pi pi-share-alt" class="p-button-rounded p-button-outlined"
                  @click.prevent.stop="$emit('share', preset)" tooltip="Share" />
                <Button v-if="showActions" icon="pi pi-pencil"
                  class="p-button-rounded p-button-outlined p-button-secondary" @click="$emit('edit', preset)"
                  tooltip="Edit" />
                <Button v-if="showActions" icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger"
                  @click="$emit('delete', preset)" tooltip="Delete" />
              </div>
            </div>
            <div class="flex flex-wrap gap-1 pt-1 border-t border-surface">
              <Tag v-for="tag in limitedTags" :key="tag.id" :value="tag.name" class="text-xs py-0.5 px-1.5" />
            </div>
          </div>
        </template>
      </Card>
    </div>
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
import { useThemeStore } from '@/stores/themeStore'
import { mapStores } from 'pinia'

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
  emits: ['download', 'edit', 'delete', 'share'],
  data() {
    return {
      isExpanded: false,
      isTruncated: false,
      glowStyle: {},
      chartReady: false,
    };
  },
  computed: {
    ...mapStores(useAuthStore, useThemeStore),
    chartOptions() {
      const isDark = this.themeStore.isDarkMode;
      const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      const tooltipTitleColor = isDark ? '#ffffff' : '#374151';
      const tooltipBodyColor = isDark ? '#ffffff' : '#4b5563';
      const tooltipBorderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

      return {
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            displayColors: false,
            backgroundColor: tooltipBg,
            titleColor: tooltipTitleColor,
            bodyColor: tooltipBodyColor,
            borderColor: tooltipBorderColor,
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
          line: {}
        }
      };
    },
    chartData() {
      const { hex: chartColor } = this.parseHexColor(this.preset.color);
      return {
        ...this.preset.chartData,
        datasets: this.preset.chartData.datasets.map(dataset => ({
          ...dataset,
          borderColor: chartColor,
          fill: true,
          tension: 0.4,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return null;
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            const { r, g, b } = this.parseHexColor(this.preset.color);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            return gradient;
          },
        })),
      };
    },
    cardStyle() {
      const { r, g, b } = this.parseHexColor(this.preset.color);
      return {
        '--shadow-color-rgb': `${r}, ${g}, ${b}`,
        '--glow-color-rgb': `${r}, ${g}, ${b}`
      };
    },
    limitedTags() {
      if (!this.preset.tags || this.preset.tags.length === 0) return [];

      const maxChars = 100;
      let totalChars = 0;
      const limitedTags = [];

      for (const tag of this.preset.tags) {
        const tagLength = tag.name.length;
        if (totalChars + tagLength <= maxChars) {
          limitedTags.push(tag);
          totalChars += tagLength;
        } else {
          // If we can fit a truncated version with "...", add it
          if (totalChars + 3 <= maxChars && limitedTags.length > 0) {
            limitedTags.push({ ...tag, name: '...', id: 'truncated' });
          }
          break;
        }
      }

      return limitedTags;
    },
  },

  mounted() {
    this.checkTruncation();

    // Small delay to ensure all reactive dependencies have settled during navigation
    setTimeout(() => {
      this.chartReady = true;
    }, 16); // One animation frame (~16ms)
  },
  updated() {
    this.checkTruncation();
  },
  methods: {
    parseHexColor(hex) {
      let color = hex || '#4ade80';
      if (!color.startsWith('#')) {
        color = `#${color}`;
      }
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        color = '#4ade80';
      }
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        hex: color
      };
    },
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

    handleMouseMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.glowStyle = {
        '--glow-x': `${x}px`,
        '--glow-y': `${y}px`,
        opacity: 1
      };
    },
    handleMouseLeave() {
      this.glowStyle = {
        opacity: 0
      };
    },
  }
};
</script>

<style scoped>
.preset-card-wrapper {
  @apply relative;
}

.preset-card {
  @apply relative rounded-lg transition-transform duration-300;
  transform-style: preserve-3d;
}

.preset-card:hover {
  transform: scale(1.02) translateY(-2px);
}

.preset-card-glow {
  --glow-size: 250px;
  position: absolute;
  top: var(--glow-y);
  left: var(--glow-x);
  width: var(--glow-size);
  height: var(--glow-size);
  background-image: radial-gradient(circle at center,
      rgba(var(--glow-color-rgb), 0.15) 0%,
      rgba(var(--glow-color-rgb), 0) 70%);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
  z-index: 0;
}

:deep(.p-card) {
  @apply h-full;
  transition: box-shadow 0.3s ease-in-out;
}

.preset-card:hover :deep(.p-card) {
  box-shadow: 0 10px 15px -3px rgba(var(--shadow-color-rgb), 0.2), 0 4px 6px -4px rgba(var(--shadow-color-rgb), 0.15);
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
