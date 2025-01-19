<script>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'


export default {
    name: 'PresetsGallery',
    components: {
        Card,
        Button,
        Dropdown,
        InputText,
        Tag,
        Badge,
    },
    props: {
        isDarkMode: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            searchQuery: '',
            selectedCategory: null,
            selectedSort: null,
            selectedDevices: [],
            categories: [
                { name: 'All Presets', value: null },
                { name: 'Gaming', value: 'gaming' },
                { name: 'Music', value: 'music' },
                { name: 'Headphone Correction', value: 'correction' }
            ],
            sortOptions: [
                { name: 'Popular', value: 'popular' },
                { name: 'New', value: 'new' },
                { name: 'Trending', value: 'trending' }
            ],
            devices: [
                'HD 600',
                'HD 650',
                'DT 990 Pro',
                'Apple AirPods Pro',
                'Sony WH-1000XM4'
            ],
            presets: [
                {
                    id: 1,
                    name: 'Competitive FPS Pro',
                    creator: 'AudioWizard',
                    category: 'gaming',
                    tags: ['FPS', 'Competitive', 'HD600'],
                    usageCount: 15420,
                    rating: 4.8,
                    isStaffPick: true,
                    chartData: {
                        labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
                        datasets: [{
                            label: 'EQ Curve',
                            data: [-2, -1, 0, 3, 2],
                            borderColor: '#22c55e',
                            tension: 0.4
                        }]
                    }
                },
            ]
        }
    },
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
        },
        filteredPresets() {
            return this.presets.filter(preset => {
                const matchesSearch = preset.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    preset.creator.toLowerCase().includes(this.searchQuery.toLowerCase())
                const matchesCategory = !this.selectedCategory || preset.category === this.selectedCategory
                const matchesDevices = this.selectedDevices.length === 0 ||
                    preset.tags.some(tag => this.selectedDevices.includes(tag))
                return matchesSearch && matchesCategory && matchesDevices
            })
        }
    },
    methods: {
        applyPreset(preset) {
            console.log('Applying preset:', preset.name)
        },
        downloadPreset(preset) {
            console.log('Downloading preset:', preset.name)
        }
    }
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br transition-colors duration-300 flex-1 pt-24 px-6 lg:px-20">
        <div class="container mx-auto px-4 py-8">
            <!-- Filters Section -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <InputText v-model="searchQuery" placeholder="Search presets..." class="input" />
                <Dropdown v-model="selectedCategory" :options="categories" optionLabel="name" placeholder="Category"
                    class="w-full" />
                <Dropdown v-model="selectedSort" :options="sortOptions" optionLabel="name" placeholder="Sort by"
                    class="w-full" />
                <MultiSelect v-model="selectedDevices" :options="devices" placeholder="Compatible devices"
                    class="w-full" />
            </div>

            <!-- Presets Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="preset in filteredPresets" :key="preset.id"
                    class="preset-card transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
                    <Card class="card h-full">
                        <template #header>
                            <div class="relative h-32">
                                <Chart type="line" :data="preset.chartData" :options="chartOptions"
                                    class="w-full h-full" />
                                <Badge v-if="preset.isStaffPick" value="Staff Pick" class="absolute top-2 right-2"
                                    severity="success" />
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
                                        <Button icon="pi pi-play" class="p-button-rounded p-button-outlined"
                                            @click="applyPreset(preset)" tooltip="Quick Apply" />
                                        <Button icon="pi pi-download" class="p-button-rounded p-button-outlined"
                                            @click="downloadPreset(preset)" tooltip="Download" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

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

:deep(.p-dropdown),
:deep(.p-multiselect) {
    @apply w-full;
    background: var(--color-input-bg);
}

:deep(.p-dropdown-panel),
:deep(.p-multiselect-panel) {
    background: var(--color-card-bg);
    border-color: var(--color-border);
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