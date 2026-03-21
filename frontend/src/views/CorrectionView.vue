<script>
import AutoComplete from 'primevue/autocomplete'
import Card from 'primevue/card'
import Button from 'primevue/button'
import MiniEqPreview from '@/components/MiniEqPreview.vue'
import ParticleHeader from '@/components/ParticleHeader.vue'
import Tooltip from 'primevue/tooltip'
import { mapStores } from 'pinia'
import { useEqualizerStore } from '@/stores/equalizerStore'
import { useThemeStore } from '@/stores/themeStore'
import axios from 'axios'

export default {
  name: 'CorrectionView',
  components: {
    AutoComplete,
    Card,
    Button,
    MiniEqPreview,
    ParticleHeader,
  },
  directives: {
    tooltip: Tooltip,
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      selectedHeadphone: null,
      headphoneProfile: null,
      loading: false,
      showFilters: false,
    }
  },
  computed: {
    ...mapStores(useEqualizerStore, useThemeStore),
    isDarkMode() {
      return this.themeStore.isDarkMode
    },
    previewPreset() {
      if (!this.headphoneProfile || !this.headphoneProfile.filters) return null
      return {
        settings: this.headphoneProfile.filters,
        color: '#4ade80',
      }
    },
  },
  watch: {
    selectedHeadphone(newVal) {
      if (newVal && newVal.id) {
        this.fetchHeadphoneProfile(newVal.id)
      } else {
        this.headphoneProfile = null
      }
    },
  },
  methods: {
    async search(event) {
      try {
        const response = await axios.get('/api/headphones', {
          params: { query: event.query },
        })
        this.suggestions = response.data.data.map((h) => ({
          ...h,
          displayName: `${h.brand} ${h.model !== h.brand ? h.model : ''}`.trim(),
        }))
      } catch (error) {
        console.error('Failed to search headphones', error)
      }
    },
    async fetchHeadphoneProfile(id) {
      this.loading = true
      try {
        const response = await axios.get(`/api/headphones/${id}`)
        this.headphoneProfile = response.data
      } catch (error) {
        console.error('Failed to fetch profile', error)
      } finally {
        this.loading = false
      }
    },
    applyCorrection() {
      if (!this.headphoneProfile) return
      this.equalizerStore.loadPreset(this.headphoneProfile.filters, this.headphoneProfile.preamp)
      this.$router.push('/equalizer')
    },
  },
}
</script>

<template>
  <div class="min-h-screen flex flex-col transition-colors duration-300">
    <ParticleHeader>
      <div class="text-center">
        <h1
          :class="[
            'text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-sm tracking-tight',
            isDarkMode ? 'text-white' : 'text-surface-900',
          ]"
        >
          One-Click EQ to Neutral
        </h1>
        <p
          :class="[
            'text-xl md:text-2xl font-light max-w-2xl mx-auto mb-10 leading-relaxed',
            isDarkMode ? 'text-surface-300' : 'text-surface-700',
          ]"
        >
          Unlock the true potential of your gear. Instantly apply professional correction profiles
          measured by audiophiles.
        </p>

        <div class="max-w-xl mx-auto w-full relative z-20 group mb-6">
          <div
            class="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"
          ></div>
          <div class="relative w-full">
            <span
              class="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500 z-10 pointer-events-none"
            >
              <i class="pi pi-search text-xl"></i>
            </span>
            <AutoComplete
              v-model="selectedHeadphone"
              :suggestions="suggestions"
              @complete="search"
              optionLabel="displayName"
              placeholder="e.g. Sennheiser HD 600"
              class="w-full"
              :delay="300"
              :inputClass="[
                'w-full !pl-14 !pr-4 !py-4 !rounded-xl !border !shadow-2xl !text-lg !font-medium focus:!ring-0 transition-colors',
                isDarkMode
                  ? '!bg-surface-900 !border-surface-700 !text-white placeholder:!text-surface-500'
                  : '!bg-surface-0 !border-surface-200 !text-surface-900 placeholder:!text-surface-400',
              ]"
              :panelClass="[
                'border shadow-xl rounded-xl mt-2 overflow-hidden w-full max-w-xl',
                isDarkMode
                  ? 'bg-surface-800 border-surface-700'
                  : 'bg-surface-0 border-surface-200',
              ]"
            >
              <template #option="slotProps">
                <div
                  :class="[
                    'flex flex-col py-2 px-1 rounded-lg transition-colors w-full',
                    isDarkMode ? 'hover:bg-surface-700' : 'hover:bg-surface-100',
                  ]"
                >
                  <span
                    :class="[
                      'font-bold text-lg block',
                      isDarkMode ? 'text-surface-0' : 'text-surface-900',
                    ]"
                    >{{ slotProps.option.brand }}</span
                  >
                  <span
                    :class="[
                      'text-sm font-medium mt-1 flex items-center gap-2',
                      isDarkMode ? 'text-surface-400' : 'text-surface-500',
                    ]"
                  >
                    {{ slotProps.option.model }}
                    <span
                      :class="[
                        'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap',
                        isDarkMode
                          ? 'bg-surface-700 text-surface-300'
                          : 'bg-surface-200 text-surface-600',
                      ]"
                    >
                      {{ slotProps.option.source }}
                    </span>
                  </span>
                </div>
              </template>
            </AutoComplete>
          </div>
        </div>
      </div>
    </ParticleHeader>

    <div class="px-4 py-16 flex-grow flex flex-col items-center">
      <div v-if="loading" class="flex justify-center my-12">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>

      <div
        v-else-if="headphoneProfile"
        class="max-w-4xl mx-auto w-full mb-12 flex-grow animate-fade-in-up"
      >
        <div class="text-center mb-10">
          <h2
            :class="[
              'text-3xl md:text-4xl font-extrabold tracking-tight mb-4',
              isDarkMode ? 'text-white' : 'text-surface-900',
            ]"
          >
            <span class="text-primary-500">{{ headphoneProfile.brand }}</span>
            {{ headphoneProfile.model }}
          </h2>
          <div class="flex justify-center">
            <span
              :class="[
                'text-sm font-semibold px-4 py-2 rounded-full shadow-sm border flex items-center gap-2',
                isDarkMode
                  ? 'bg-surface-800 text-surface-300 border-surface-700'
                  : 'bg-surface-50 text-surface-700 border-surface-200',
              ]"
            >
              <i class="pi pi-database text-xs"></i> Source: {{ headphoneProfile.source }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto w-full">
          <div
            :class="[
              'p-6 rounded-2xl text-center border shadow-lg flex flex-col justify-center items-center group hover:border-primary-500/50 transition-all',
              isDarkMode ? 'bg-surface-800 border-surface-700' : 'bg-surface-0 border-surface-200',
            ]"
          >
            <div
              :class="[
                'text-xs font-bold mb-2 uppercase tracking-widest flex items-center gap-2',
                isDarkMode ? 'text-surface-500' : 'text-surface-400',
              ]"
            >
              Recommended Preamp
              <i
                class="pi pi-info-circle text-[10px] opacity-50 cursor-help"
                v-tooltip.top="
                  'This attenuation prevents digital clipping by balancing the EQ boosts.'
                "
              ></i>
            </div>
            <div
              class="text-5xl font-black text-primary-500 group-hover:scale-110 transition-transform"
            >
              {{ headphoneProfile.preamp }}
              <span class="text-2xl text-surface-400 font-bold">dB</span>
            </div>
          </div>

          <div class="flex items-center justify-center">
            <Button
              @click="applyCorrection"
              label="Apply Correction"
              icon="pi pi-sliders-h"
              severity="primary"
              size="large"
              class="w-full h-full shadow-xl hover:shadow-primary-500/40 hover:-translate-y-1 transition-all duration-300 font-bold text-xl rounded-2xl p-6"
            />
          </div>
        </div>

        <div
          :class="[
            'rounded-3xl p-1 bg-gradient-to-b shadow-2xl mb-8',
            isDarkMode ? 'from-surface-800 to-surface-900' : 'from-surface-100 to-surface-50',
          ]"
        >
          <div
            :class="['rounded-[1.3rem] p-6 md:p-8', isDarkMode ? 'bg-surface-900' : 'bg-surface-0']"
          >
            <h3
              :class="[
                'text-lg font-bold mb-8 flex items-center gap-3',
                isDarkMode ? 'text-surface-300' : 'text-surface-600',
              ]"
            >
              <i class="pi pi-chart-line text-primary-500"></i> Correction Curve Preview
            </h3>
            <MiniEqPreview :preset="previewPreset" />
          </div>
        </div>

        <div class="w-full max-w-3xl mx-auto mt-4">
          <div
            class="flex items-center justify-center gap-2 cursor-pointer group py-3 px-6 rounded-full transition-all duration-300 hover:bg-surface-100 dark:hover:bg-surface-800 w-fit mx-auto"
            @click="showFilters = !showFilters"
          >
            <span
              :class="[
                'text-sm font-bold tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity',
                isDarkMode ? 'text-surface-300' : 'text-surface-600',
              ]"
            >
              {{ showFilters ? 'Hide' : 'Show' }} Detailed Parameters
            </span>
            <i
              :class="[
                'pi pi-chevron-down text-xs transition-transform duration-500 opacity-40 group-hover:opacity-100',
                { 'rotate-180': showFilters },
              ]"
            ></i>
          </div>

          <transition name="expand">
            <div v-if="showFilters" class="overflow-hidden mt-4">
              <div
                :class="[
                  'rounded-2xl border p-4 shadow-xl',
                  isDarkMode
                    ? 'bg-surface-900 border-surface-800'
                    : 'bg-surface-0 border-surface-200',
                ]"
              >
                <div class="overflow-x-auto">
                  <table class="min-w-full">
                    <thead>
                      <tr
                        :class="[
                          'border-b',
                          isDarkMode ? 'border-surface-800' : 'border-surface-100',
                        ]"
                      >
                        <th
                          scope="col"
                          :class="[
                            'px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em]',
                            isDarkMode ? 'text-surface-500' : 'text-surface-400',
                          ]"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          :class="[
                            'px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em]',
                            isDarkMode ? 'text-surface-500' : 'text-surface-400',
                          ]"
                        >
                          Freq
                        </th>
                        <th
                          scope="col"
                          :class="[
                            'px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em]',
                            isDarkMode ? 'text-surface-500' : 'text-surface-400',
                          ]"
                        >
                          Gain
                        </th>
                        <th
                          scope="col"
                          :class="[
                            'px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em]',
                            isDarkMode ? 'text-surface-500' : 'text-surface-400',
                          ]"
                        >
                          Q
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      :class="[
                        'divide-y',
                        isDarkMode ? 'divide-surface-800/50' : 'divide-surface-100',
                      ]"
                    >
                      <tr
                        v-for="(filter, index) in headphoneProfile.filters"
                        :key="index"
                        class="group transition-colors"
                      >
                        <td class="px-4 py-3 whitespace-nowrap">
                          <span
                            :class="[
                              'text-[11px] font-black uppercase tracking-tight',
                              isDarkMode ? 'text-surface-300' : 'text-surface-700',
                            ]"
                          >
                            {{
                              filter.type.includes('peaking')
                                ? 'Peak'
                                : filter.type.includes('lowshelf')
                                  ? 'L-Shelf'
                                  : filter.type.includes('highshelf')
                                    ? 'H-Shelf'
                                    : 'Other'
                            }}
                          </span>
                        </td>
                        <td
                          class="px-4 py-3 whitespace-nowrap text-right font-mono text-xs font-bold"
                        >
                          {{ Math.round(filter.frequency)
                          }}<span class="opacity-40 ml-0.5">Hz</span>
                        </td>
                        <td
                          :class="[
                            'px-4 py-3 whitespace-nowrap text-right font-mono text-xs font-bold',
                            filter.gain > 0
                              ? 'text-green-400'
                              : filter.gain < 0
                                ? 'text-red-400'
                                : 'opacity-40',
                          ]"
                        >
                          {{ filter.gain > 0 ? '+' : '' }}{{ filter.gain.toFixed(1)
                          }}<span class="opacity-60 ml-0.5">dB</span>
                        </td>
                        <td
                          class="px-4 py-3 whitespace-nowrap text-right font-mono text-xs font-bold opacity-60"
                        >
                          {{ filter.Q || filter.q }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="mt-6 text-center">
          <p
            :class="[
              'text-[10px] font-medium tracking-wide opacity-50',
              isDarkMode ? 'text-surface-500' : 'text-surface-400',
            ]"
          >
            MEASUREMENTS VIA
            <a
              href="https://github.com/jaakkopasanen/AutoEq"
              target="_blank"
              class="hover:text-primary-500 transition-colors"
              >AUTOEQ</a
            >
          </p>
        </div>
      </div>
      <div v-else class="max-w-5xl mx-auto w-full mb-12 flex-grow">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div
            :class="[
              'group text-center p-8 rounded-3xl border shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 relative overflow-hidden',
              isDarkMode ? 'bg-surface-800 border-surface-700' : 'bg-surface-0 border-surface-200',
            ]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <div
              :class="[
                'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 text-primary-500 shadow-inner group-hover:rotate-12 transition-transform duration-500 border',
                isDarkMode
                  ? 'bg-surface-900 border-primary-900/30'
                  : 'bg-primary-50 border-primary-100',
              ]"
            >
              <i class="pi pi-search text-3xl"></i>
            </div>
            <h3
              :class="['text-2xl font-bold mb-3', isDarkMode ? 'text-white' : 'text-surface-900']"
            >
              1. Find Your Gear
            </h3>
            <p
              :class="[
                'leading-relaxed font-medium',
                isDarkMode ? 'text-surface-400' : 'text-surface-600',
              ]"
            >
              Search from over 8,000 professionally measured headphones and IEMs.
            </p>
          </div>
          <div
            :class="[
              'group text-center p-8 rounded-3xl border shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 relative overflow-hidden',
              isDarkMode ? 'bg-surface-800 border-surface-700' : 'bg-surface-0 border-surface-200',
            ]"
            style="animation-delay: 100ms"
          >
            <div
              class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <div
              :class="[
                'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 text-primary-500 shadow-inner group-hover:scale-110 transition-transform duration-500 border',
                isDarkMode
                  ? 'bg-surface-900 border-primary-900/30'
                  : 'bg-primary-50 border-primary-100',
              ]"
            >
              <i class="pi pi-chart-line text-3xl"></i>
            </div>
            <h3
              :class="['text-2xl font-bold mb-3', isDarkMode ? 'text-white' : 'text-surface-900']"
            >
              2. Preview the Curve
            </h3>
            <p
              :class="[
                'leading-relaxed font-medium',
                isDarkMode ? 'text-surface-400' : 'text-surface-600',
              ]"
            >
              See the exact parametric EQ filters needed to reach the perfect neutral target.
            </p>
          </div>
          <div
            :class="[
              'group text-center p-8 rounded-3xl border shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 relative overflow-hidden',
              isDarkMode ? 'bg-surface-800 border-surface-700' : 'bg-surface-0 border-surface-200',
            ]"
            style="animation-delay: 200ms"
          >
            <div
              class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <div
              :class="[
                'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 text-primary-500 shadow-inner group-hover:-rotate-12 transition-transform duration-500 border',
                isDarkMode
                  ? 'bg-surface-900 border-primary-900/30'
                  : 'bg-primary-50 border-primary-100',
              ]"
            >
              <i class="pi pi-sliders-h text-3xl"></i>
            </div>
            <h3
              :class="['text-2xl font-bold mb-3', isDarkMode ? 'text-white' : 'text-surface-900']"
            >
              3. Apply & Listen
            </h3>
            <p
              :class="[
                'leading-relaxed font-medium',
                isDarkMode ? 'text-surface-400' : 'text-surface-600',
              ]"
            >
              One click loads the precise correction profile directly into your active equalizer.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-autocomplete-panel) {
  min-width: 100% !important;
  left: 0 !important;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
