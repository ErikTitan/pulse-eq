<script>
import Button from 'primevue/button';
import Card from 'primevue/card';
export default {
    name: 'Features',
    components: {
        Card,
        Button,
    },
    data() {
        return {
            equalizer: [
                { freq: 32, value: 0 },
                { freq: 64, value: 0 },
                { freq: 125, value: 0 },
                { freq: 250, value: 0 },
                { freq: 500, value: 0 },
                { freq: '1k', value: 0 },
                { freq: '2k', value: 0 },
                { freq: '4k', value: 0 },
                { freq: '8k', value: 0 },
                { freq: '16k', value: 0 },
            ],
            features: [
                {
                    icon: 'pi pi-share-alt',
                    title: 'Share Your Presets',
                    description:
                        'Create and share your perfect audio presets with the community. Download presets from other audiophiles.',
                },
                {
                    icon: 'pi pi-volume-up',
                    title: 'Enhance Your Audio',
                    description:
                        'Fix lacking headphone tuning and enhance your audio experience with precision controls.',
                },
                {
                    icon: 'pi pi-headphones',
                    title: 'Genre-Specific Tuning',
                    description:
                        'Discover and apply presets optimized for different music genres, from classical to electronic.',
                },
                {
                    icon: 'pi pi-desktop',
                    title: 'Gaming Audio',
                    description:
                        'Enhance your gaming experience with presets designed for competitive and immersive gaming.',
                },
                {
                    icon: 'pi pi-cloud',
                    title: 'Cloud Sync',
                    description: 'Your presets are automatically synced across all your devices.',
                },
                {
                    icon: 'pi pi-chart-line',
                    title: 'Real-time Analysis',
                    description:
                        'Visualize your audio adjustments with real-time frequency response graphs.',
                },
            ],
        };
    },
    methods: {
        activateBand(index) {
            const randomValue = Math.floor(Math.random() * 24) - 12;
            this.equalizer[index].value = randomValue;
        },
        resetBand(index) {
            this.equalizer[index].value = 0;
        },
    },
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-surface-ground to-white py-12 px-4">
        <!-- Hero Section -->
        <div class="max-w-6xl mx-auto text-center mb-16 mt-16">
            <h1 class="text-5xl font-bold mb-6 ">
                Transform Your Audio Experience
            </h1>
            <p class="text-xl max-w-2xl mx-auto">
                Create, share, and discover audio presets that elevate your listening experience
            </p>

            <!-- Equalizer Animation -->
            <div class="equalizer-demo mt-8">
                <div class="flex justify-center gap-2">
                    <div v-for="(band, index) in equalizer" :key="index" class="equalizer-band"
                        @mouseover="activateBand(index)" @mouseout="resetBand(index)">
                        <div class="band-value">{{ band.value }}dB</div>
                        <div class="band-bar" :style="{ height: `${band.value + 100}px` }"></div>
                        <div class="band-freq">{{ band.freq }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Grid -->
        <div class="max-w-6xl mx-auto grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            <Card v-for="(feature, index) in features" :key="index"
                class="feature-card transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <template #header>
                    <div class="feature-icon hover:animate-pulse">
                        <i :class="feature.icon + ' text-4xl text-primary'"></i>
                    </div>
                </template>
                <template #title>
                    <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
                </template>
                <template #content>
                    <p class="text-gray-600">{{ feature.description }}</p>
                </template>
            </Card>
        </div>

        <!-- Call to Action -->
        <div class="text-center mt-16">
            <Button as="router-link" to="equalizer" label="Start Equalizing" icon="pi pi-play" severity="primary"
                class="p-button-rounded p-button-lg hover:bg-primary-light hover:shadow-md" />
        </div>
    </div>
</template>

<style scoped>
.equalizer-demo {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2rem 0;
}

.equalizer-band {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 4px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.equalizer-band:hover {
    transform: translateY(-10px);
}

.band-value {
    font-size: 0.75rem;
    color: var(--p-text-color-secondary);
    height: 20px;
}

.band-bar {
    width: 8px;
    background: var(--p-primary-color);
    border-radius: 4px;
    transition: height 0.3s ease;
}

.band-freq {
    font-size: 0.75rem;
    color: var(--p-text-color);
    margin-top: 0.5rem;
}

/* Feature Card Styles */
.feature-card {
    border: 1px solid var(--p-surface-200);
    border-radius: 1rem;
    overflow: hidden;
}

.feature-icon {
    background: var(--p-surface);
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid var(--p-surface-500);
}

.feature-card:hover .feature-icon i {
    animation: float 2s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}
</style>
