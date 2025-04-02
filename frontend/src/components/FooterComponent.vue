<script>
import Button from 'primevue/button';

export default {
    name: 'Footer',
    components: {
        Button
    },
    data() {
        return {
            links: {
                product: [
                    { label: 'Equalizer', url: '/equalizer' },
                    { label: 'Presets', url: '/presets' },
                ],
                company: [
                    { label: 'Features', url: '/features' },
                    { label: 'Contact', url: '/contact' }
                ],
                resources: [
                    { label: 'Documentation', url: 'https://github.com/ErikTitan/web-eq/blob/main/README.md' },
                    { label: 'Github', url: 'https://github.com/ErikTitan/web-eq' }
                ]
            },
            socialIcons: [
                { icon: 'pi pi-facebook', url: '#', color: '#1877F2' },
                { icon: 'pi pi-twitter', url: '#', color: '#1DA1F2' },
                { icon: 'pi pi-instagram', url: '#', color: '#E4405F' },
                { icon: 'pi pi-github', url: 'https://github.com/ErikTitan/web-eq', color: '#333333' }
            ],
            audioWaves: Array(8).fill(0)
        }
    },
    mounted() {
        this.startWaveAnimation();
    },
    methods: {
        startWaveAnimation() {
            setInterval(() => {
                this.audioWaves = this.audioWaves.map(() => Math.random() * 100);
            }, 1000);
        }
    }
}
</script>

<template>
    <footer class="mt-auto px-6 lg:px-20 mb-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <!-- Brand Section -->
            <div class="col-span-1">
                <div class="flex items-center gap-3 mb-2 group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 26 26" fill="none">
                        <path
                            d="M18,1.25H6A4.756,4.756,0,0,0,1.25,6V18A4.756,4.756,0,0,0,6,22.75H18A4.756,4.756,0,0,0,22.75,18V6A4.756,4.756,0,0,0,18,1.25ZM21.25,18A3.254,3.254,0,0,1,18,21.25H6A3.254,3.254,0,0,1,2.75,18V6A3.254,3.254,0,0,1,6,2.75H18A3.254,3.254,0,0,1,21.25,6ZM15,8.75a.75.75,0,0,0-.75.75v5a.75.75,0,0,0,1.5,0v-5A.75.75,0,0,0,15,8.75ZM18,6.75a.75.75,0,0,0-.75.75v9a.75.75,0,0,0,1.5,0v-9A.75.75,0,0,0,18,6.75ZM6,9.25a.75.75,0,0,0-.75.75v4a.75.75,0,0,0,1.5,0V10A.75.75,0,0,0,6,9.25ZM9,7.25A.75.75,0,0,0,8.25,8v8a.75.75,0,0,0,1.5,0V8A.75.75,0,0,0,9,7.25ZM12,4.25a.75.75,0,0,0-.75.75V19a.75.75,0,0,0,1.5,0V5A.75.75,0,0,0,12,4.25Z"
                            fill="var(--p-primary-400)" />
                    </svg>
                    <span class="text-2xl">
                        Pulse-EQ
                    </span>
                </div>
                <p class="text-md leading-relaxed mb-3">
                    Transform your audio experience with professional-grade equalization tools right in your browser.
                </p>
            </div>

            <!-- Navigation Links -->
            <div v-for="(section, key) in links" :key="key" class="col-span-1">
                <h3 class="text-lg font-semibold mb-3 relative link-header">
                    {{ key.charAt(0).toUpperCase() + key.slice(1) }}
                </h3>
                <ul class="space-y-3">
                    <li v-for="link in section" :key="link.label" class="transform transition-all hover:translate-x-2">
                        <a :href="link.url" class="text-md hover:text-primary transition-colors">
                            {{ link.label }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Bottom Section -->
        <div class="mt-6 border-t border-gray-200">
            <div class="flex flex-col mt-6 md:flex-row justify-between items-end">
                <div class="text-sm text-gray-500">
                    © 2025 Pulse-EQ. All rights reserved.
                </div>
                <div class="audio-wave flex items-end gap-1 h-12">
                    <div v-for="(wave, index) in audioWaves" :key="index" class="wave-bar"
                        :style="{ height: `${wave}%` }">
                    </div>
                </div>
                <div class="flex gap-4">
                    <a v-for="social in socialIcons" :key="social.icon" :href="social.url" class="social-icon-wrapper"
                        :style="{ '--hover-color': social.color }">
                        <Button :icon="social.icon" text rounded class="p-button-text social-icon" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.primary-color {
    color: var(--p-primary-color);
}

.wave-bar {
    width: 3px;
    background: var(--p-primary-color);
    border-radius: 2px;
    transition: height 0.5s ease;
    opacity: 0.7;
}

.wave-bar:nth-child(odd) {
    animation: pulse 2s infinite;
}

.wave-bar:nth-child(even) {
    animation: pulse 2s infinite 0.5s;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.7;
    }

    50% {
        opacity: 0.3;
    }
}

.link-header::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--p-primary-color);
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.link-header:hover::before {
    opacity: 1;
}

.social-icon-wrapper {
    position: relative;
    transition: transform 0.3s ease;
}

.social-icon-wrapper:hover {
    transform: translateY(-2px);
}

.social-icon-wrapper::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--hover-color);
    transform: translateX(-50%);
    transition: width 0.3s ease;
}

.social-icon-wrapper:hover::after {
    width: 100%;
}

.social-icon:hover {
    color: var(--p-hover-color) !important;
}
</style>