<script>
import Button from 'primevue/button';

export default {
    name: "AudioVisualizerHeader",
    components: {
        Button
    },
    data() {
        return {
            bars: Array.from({ length: 32 }, (_, i) => ({
                id: i,
                height: Math.random() * 100
            }))
        }
    },
    mounted() {
        this.startAnimation();
    },
    methods: {
        startAnimation() {
            const updateBars = () => {
                this.bars = this.bars.map(bar => ({
                    ...bar,
                    height: 20 + Math.random() * 50
                }));
            };

            // Slowed down to 150ms for smoother animation
            setInterval(updateBars, 150);
        }
    }
};
</script>

<template>
    <div class="audio-visualizer-header">
        <div class="visualizer-container">
            <div class="bars-container">
                <div v-for="bar in bars" :key="bar.id" class="bar" :style="{ height: `${bar.height}%` }">
                </div>
            </div>
            <div class="bars-container reflection">
                <div v-for="bar in bars" :key="bar.id" class="bar" :style="{ height: `${bar.height}%` }">
                </div>
            </div>
        </div>

        <div class="content-wrapper flex flex-col pt-24 px-6 lg:px-20">
            <div class="mx-6 md:mx-20 mt-0 md:mt-6 drop-shadow-md">
                <h1 class="text-6xl font-bold text-white leading-tight drop-shadow-lg">
                    <span class="font-light block drop-shadow-lg">Shape Your Sound</span>
                    Perfect Audio For Every Moment
                </h1>
                <p class="font-normal text-3xl leading-relaxed md:mt-4 text-white drop-shadow-lg">
                    Create, share, and discover custom audio equalizer presets. Transform your gaming experience,
                    optimize your headphones, and enhance your music listening with precision controls.
                </p>
                <Button as="router-link" label="Create Your First Preset" to="equalizer" severity="primary"
                    class="!text-2xl mt-8 !px-6 rounded-full hover:shadow-md">
                </Button>
            </div>
            <div class="flex justify-center md:justify-end bg-scroll relative drop-shadow-md">
                <img src="../assets/images/Peace_image.png" class="md:w-[700px]" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.audio-visualizer-header {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    background: linear-gradient(to right,
            var(--p-purple-400),
            var(--p-indigo-400) 50%,
            var(--p-cyan-400));
    clip-path: ellipse(133% 75% at 93% 13%);
}

.visualizer-container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: 0.6;
    pointer-events: none;
    margin-top: 10vh;
    /* Moved down */
}

.bars-container {
    display: flex;
    justify-content: space-evenly;
    align-items: flex-end;
    height: 30%;
    width: 100%;
    padding: 0 5%;
}

.bars-container.reflection {
    transform: scaleY(-1);
    opacity: 0.4;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
}

.bar {
    width: 1.5%;
    min-height: 20%;
    background: linear-gradient(to top,
            rgba(255, 255, 255, 0.9),
            var(--p-cyan-200) 30%,
            var(--p-blue-300) 60%,
            var(--p-purple-300));
    border-radius: 4px;
    transition: height 0.15s ease-in-out;
}

.content-wrapper {
    position: relative;
    z-index: 2;
}

/* Dark mode adjustments */
:root[class='my-app-dark'] .audio-visualizer-header {
    background: linear-gradient(to right,
            var(--p-blue-950),
            var(--p-indigo-950) 50%,
            var(--p-purple-950));
}

:root[class='my-app-dark'] .bar {
    background: linear-gradient(to top,
            var(--p-cyan-500),
            var(--p-blue-500) 50%,
            var(--p-purple-500));
}

:root[class='my-app-dark'] .visualizer-container {
    opacity: 0.4;
}
</style>