<script>
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import FloatLabel from 'primevue/floatlabel';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';

export default {
  name: 'BandControls',
  components: {
    Card,
    Button,
    InputNumber,
    Slider,
    FloatLabel,
    Select,
    Checkbox
  },
  props: {
    filters: {
      type: Array,
      required: true
    },
    filterTypes: {
      type: Array,
      required: true
    },
    nyquist: {
      type: Number,
      required: true
    },
    weq8: {
      type: Object,
      required: false
    }
  },
  emits: ['update-filter'],
  methods: {
    async updateFrequency(index, value) {
      const clampedValue = Math.max(20, Math.min(value, this.nyquist));

      // Update the WEQ8 runtime directly
      if (this.weq8) {
        this.weq8.setFilterFrequency(index, clampedValue);
      }

      // Emit the update for parent component
      this.$emit('update-filter', index, 'frequency', clampedValue);
    },

    updateFilter(index, property, value) {
      if (property === 'frequency') {
        this.updateFrequency(index, value);
      } else {
        this.$emit('update-filter', index, property, value);
      }
    }
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-4 justify-center">
    <div v-for="(filter, index) in filters" :key="index"
      class="p-4 rounded-lg border border-surface-border flex-grow basis-48">
      <div class="font-semibold mb-4 text-center">Band {{ index + 1 }}</div>

      <div class="mb-4">
        <FloatLabel>
          <Select v-model="filter.type" @change="updateFilter(index, 'type', $event.value)" :options="filterTypes"
            optionLabel="label" optionValue="value" class="w-full" />
          <label>Type</label>
        </FloatLabel>
      </div>

      <div class="mb-4">
        <FloatLabel>
          <InputNumber v-model="filter.frequency"
            @update:modelValue="updateFilter(index, 'frequency', Math.max(20, Math.min($event, nyquist)))" :min="20"
            :max="nyquist" :step="1" mode="decimal" class="w-full" />
          <label>Frequency</label>
        </FloatLabel>
      </div>

      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <label>Gain</label>
          <span class="text-sm text-surface-500 dark:text-surface-400">{{ filter.gain.toFixed(1) }} dB</span>
        </div>
        <Slider v-model="filter.gain" @update:modelValue="updateFilter(index, 'gain', $event)" :min="-15" :max="15"
          :step="0.1" class="w-full" />
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="filter.bypass" @update:modelValue="updateFilter(index, 'bypass', $event)" :binary="true"
          :inputId="`bypass-${index}`" />
        <label :for="`bypass-${index}`">Bypass</label>
      </div>
    </div>
  </div>
</template>
