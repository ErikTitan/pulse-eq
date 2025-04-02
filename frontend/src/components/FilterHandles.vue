<script>
import { useEqualizerStore } from '@/stores/equalizerStore';
export default {
    name: 'FilterHandles',
    props: {
        filters: {
            type: Array,
            required: true
        },
        selectedPoint: {
            type: Number,
            default: null
        },
        nyquist: {
            type: Number,
            required: true
        }
    },
    emits: ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'wheel', 'update:filters'],
    data() {
        const equalizerStore = useEqualizerStore();
        return {
            equalizerStore,
            canvas: null
        }
    },
    methods: {
        getFilterPosition(filter) {
            if (!this.canvas) return { transform: 'translate(0px, 0px)' };

            const rect = this.canvas.getBoundingClientRect();
            const displayWidth = rect.width;
            const displayHeight = rect.height;

            // Convert frequency to x position (logarithmic scale)
            const minF = Math.log10(20);
            const maxF = Math.log10(this.nyquist);
            const logPos = (Math.log10(filter.frequency) - minF) / (maxF - minF);
            const x = logPos * displayWidth;

            // Convert gain to y position (linear scale)
            const y = displayHeight - ((filter.gain + 15) / 30) * displayHeight;

            return {
                transform: `translate(${x}px, ${y}px)`
            };
        },

        initializeFilterPositions() {
            const minF = Math.log10(20);
            const maxF = Math.log10(this.nyquist);
            const step = (maxF - minF) / (this.filters.length - 1);

            const newFilters = this.filters.map((filter, index) => {
                const frequency = Math.pow(10, minF + step * index);
                return {
                    ...filter,
                    frequency,
                    gain: 0,
                    Q: filter.Q || 1,
                    bypass: false
                };
            });

            // Emit the updated filters back to parent
            this.$emit('update:filters', newFilters);
        },

        getFilterLabel(filter) {
            return `${this.formatFrequency(filter.frequency)} ${this.formatFrequencyUnit(filter.frequency)}`;
        },

        formatFrequency(freq, keepHz = false) {
            if (freq >= 1000 && !keepHz) {
                return (freq / 1000).toFixed(2);
            }
            return freq.toFixed(0);
        },

        formatFrequencyUnit(freq, keepHz = false) {
            if (freq >= 1000 && !keepHz) {
                return "kHz";
            }
            return "Hz";
        },
    },
    mounted() {
        this.canvas = this.$el.parentElement;
        this.initializeFilterPositions();
    }
}
</script>

<template>
    <div class="filter-handles-container">
        <div v-for="(filter, index) in filters" :key="index" class="filter-handle absolute z-40 -translate-x-1/2 -translate-y-1/2 w-6 h-6 
      bg-indigo-600/80 border-2 border-white-800 border-2 rounded-full cursor-grab select-none 
      backdrop-blur shadow-lg flex items-center justify-center" :class="{
        'selected': selectedPoint === index,
        'bypassed': filter.bypass,
        'has-gain': equalizerStore.filterHasGain(filter.type),
        'has-q': equalizerStore.filterHasQ(filter.type)
    }" :style="getFilterPosition(filter)" @pointerdown="$emit('pointerdown', $event, index)"
            @pointermove="$emit('pointermove', $event)" @pointerup="$emit('pointerup', $event)"
            @pointercancel="$emit('pointercancel', $event)" @wheel.prevent="$emit('wheel', $event, index)">
            <span class="filter-number text-white">{{ index + 1 }}</span>
            <span class="filter-tooltip filter-freq absolute">{{ getFilterLabel(filter) }}</span>
            <span v-if="equalizerStore.filterHasQ(filter.type)" class="filter-tooltip filter-q">Q: {{
                filter.Q.toFixed(1) }}</span>
        </div>
    </div>
</template>

<style scoped>
.filter-handle {
    margin: -12px 0 0 -12px;
}

.filter-handle.selected {
    background: rgba(255, 204, 0, 0.8);
    transform: scale(1.1);
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.4),
        0 6px 12px rgba(255, 204, 0, 0.3);
}

.filter-handle.bypassed {
    background: rgba(125, 125, 125, 0.6);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: none;
}

.filter-handle:active {
    cursor: grabbing;
}

.filter-tooltip {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    padding: 1px 4px;
    border-radius: 6px;
    color: white;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-q {
    bottom: -24px;
}

.filter-freq {
    top: -24px;
}

.filter-handle:hover .filter-q {
    opacity: 1;
}

.filter-handle:hover .filter-freq,
.filter-handle.selected .filter-freq {
    opacity: 1;
}
</style>
