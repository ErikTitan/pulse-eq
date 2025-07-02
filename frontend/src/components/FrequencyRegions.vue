<script>
import Button from 'primevue/button';

export default {
  name: 'FrequencyRegions',
  components: {
    Button
  },
  data() {
    return {
      selectedRegion: null,
      frequencyRegions: [
        {
          id: 'sub-bass',
          name: 'Sub Bass',
          range: '20-80Hz',
          minFreq: 20,
          maxFreq: 80,
          description: 'Sub Bass provides the deepest, most felt frequencies that give music its foundation and physical impact. These frequencies are more felt than heard, creating the rumble and weight that makes music feel powerful and immersive. While essential for genres like electronic music and hip-hop, too much sub bass can make music sound muddy and overwhelm smaller speakers.'
        },
        {
          id: 'mid-bass',
          name: 'Mid Bass',
          range: '80-300Hz',
          minFreq: 80,
          maxFreq: 300,
          description: 'Mid Bass is responsible for a sense of punch and body in music. In contrast to sub bass, mid bass is typically more percussive and energetic, feeling like it\'s literally pushing air, and can lend a sense of fullness to a sound. Listeners craving a "bassy" sound will commonly be more satisfied by mid bass emphasis, as it will add punch to most common music. However, too much mid bass can give the sound a sense of bloat, or even yield midrange "bleed" in which lower midrange notes are masked and smeared by excessive mid bass presence.'
        },
        {
          id: 'lower-mid',
          name: 'Lower Midrange',
          range: '300Hz-1kHz',
          minFreq: 300,
          maxFreq: 1000,
          description: 'Lower Midrange contains the fundamental frequencies of most instruments and vocals, providing warmth and body to music. This region is crucial for the natural sound of male vocals, guitars, and many acoustic instruments. Too much emphasis here can make music sound boxy or congested, while too little can make it sound thin and lacking in substance. Proper balance in this region is essential for musical coherence.'
        },
        {
          id: 'upper-mid',
          name: 'Upper Midrange',
          range: '1kHz-4kHz',
          minFreq: 1000,
          maxFreq: 4000,
          description: 'Upper Midrange is critical for speech intelligibility and musical clarity. This region contains the harmonics that help distinguish between different instruments and make vocals cut through a mix. It\'s where the "presence" of most sounds lives. However, this region can become fatiguing if overemphasized, leading to harsh or aggressive sound. Proper control here is essential for long listening sessions without fatigue.'
        },
        {
          id: 'presence',
          name: 'Presence Region',
          range: '4kHz-6kHz',
          minFreq: 4000,
          maxFreq: 6000,
          description: 'Presence Region is where sounds "cut through" and grab attention. This region adds clarity and definition to vocals and instruments, making them stand out in a mix. It\'s particularly important for vocal intelligibility and the attack of percussive instruments. Too much emphasis here can make music sound bright or even harsh, while too little can make it sound dull and distant. This region is highly sensitive to our hearing.'
        },
        {
          id: 'mid-treble',
          name: 'Mid Treble',
          range: '6kHz-10kHz',
          minFreq: 6000,
          maxFreq: 10000,
          description: 'Mid Treble adds sparkle and detail to music, enhancing the perception of clarity and openness. This region contains important harmonics for cymbals, string instruments, and vocal consonants. It can make music sound more detailed and "hi-fi" when properly balanced. However, excessive mid treble can lead to sibilance in vocals and make cymbals sound harsh or metallic. This region requires careful tuning for optimal musical enjoyment.'
        },
        {
          id: 'air',
          name: 'Air',
          range: '10kHz-20kHz',
          minFreq: 10000,
          maxFreq: 20000,
          description: 'Air frequencies create the sense of space, openness, and "airiness" in music. These ultra-high frequencies contain the subtle harmonics and ambience that make music feel spacious and live. While not all listeners can hear the highest frequencies in this range, the presence of these frequencies can still contribute to the overall perception of sound quality. Proper extension here can make music feel more natural and immersive, though excessive emphasis may cause fatigue in sensitive listeners.'
        }
      ]
    }
  },
  methods: {
    selectRegion(region) {
      this.selectedRegion = region;
      this.$emit('highlight-region', {
        minFreq: region.minFreq,
        maxFreq: region.maxFreq,
        name: region.name
      });
    },
    clearSelection() {
      this.selectedRegion = null;
      this.$emit('highlight-region', null);
    }
  }
}
</script>

<template>
  <div class="frequency-regions">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Frequency Regions</h3>
      <Button label="Clear Selection" severity="secondary" size="small" @click="clearSelection"
        :disabled="!selectedRegion" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
      <div v-for="region in frequencyRegions" :key="region.id"
        class="region-card p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md" :class="{
          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedRegion?.id === region.id,
          'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600': selectedRegion?.id !== region.id
        }" @click="selectRegion(region)">
        <div class="font-medium text-sm mb-1">{{ region.name }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">{{ region.range }}</div>
      </div>
    </div>

    <div v-if="selectedRegion" class="explanation-section">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="font-semibold mb-2 text-blue-600 dark:text-blue-400">
          {{ selectedRegion.name }} ({{ selectedRegion.range }})
        </h4>
        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {{ selectedRegion.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.region-card {
  transition: all 0.2s ease-in-out;
}

.region-card:hover {
  transform: translateY(-1px);
}

.explanation-section {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
