<script>
import Button from 'primevue/button';
export default {
    name: "AnimatedGradientHeader",
    components: {
        Button
    },
    mounted() {
        const interBubble = this.$refs.interactiveBubble;
        let curX = 0;
        let curY = 0;
        let tgX = 0;
        let tgY = 0;

        const move = () => {
            curX += (tgX - curX) / 20;
            curY += (tgY - curY) / 20;
            interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
            requestAnimationFrame(move);
        };

        window.addEventListener('mousemove', (event) => {
            tgX = event.clientX;
            tgY = event.clientY;
        });

        move();
    }
};
</script>


<template>
    <div class="animated-gradient-header">
        <svg xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -8"
                        result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </defs>
        </svg>
        <div class="gradients-container">
            <div class="g1"></div>
            <div class="g2"></div>
            <div class="g3"></div>
            <div class="g4"></div>
            <div class="g5"></div>
            <div ref="interactiveBubble" class="interactive"></div>
        </div>
        <div class="content-wrapper flex flex-col pt-24 px-6 lg:px-20">
            <div class="mx-6 md:mx-20 mt-0 md:mt-6 drop-shadow-md">
                <h1 class="text-6xl font-bold text-white leading-tight">
                    <span class="font-light block">Shape Your Sound</span>Perfect Audio For Every Moment
                </h1>
                <p class="font-normal text-3xl leading-relaxed md:mt-4 text-white">
                    Create, share, and discover custom audio equalizer presets. Transform your gaming experience,
                    optimize your
                    headphones, and enhance your music listening with precision controls.
                </p>
                <Button as="router-link" label="Create Your First Preset" to="equalizer" severity="primary"
                    class="!text-2xl mt-8 !px- rounded-full"></Button>
            </div>
            <div class="flex justify-center md:justify-end bg-scroll relative top- drop-shadow-md">
                <img src="../assets/images/Peace_image.png" class="md:w-[700px]" />
            </div>
        </div>
    </div>
</template>



<style scoped>
.content-wrapper {
    position: relative;
    z-index: 2;
}

.animated-gradient-header {
    --circle-size: 200%;
    --blending: hard-light;
    --color1: var(--p-purple-300);
    --color2: var(--p-blue-300);
    --color3: var(--p-cyan-300);
    --color4: var(--p-pink-300);
    --color5: var(--p-green-300);
    --color-interactive: var(--p-cyan-300);

    --gradient-start: var(--p-blue-300);
    --gradient-end: var(--p-teal-300);

    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    background: linear-gradient(40deg, var(--gradient-start), var(--gradient-end));
    clip-path: ellipse(133% 75% at 93% 13%);
}

.animated-gradient-header svg {
    position: absolute;
    width: 0;
    height: 0;
}

.gradients-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: url(#goo) blur(40px);
    pointer-events: none;
    z-index: 1;
}

.g1,
.g2,
.g3,
.g4,
.g5,
.interactive {
    position: absolute;
    mix-blend-mode: var(--blending);
    pointer-events: none;
}

.g1 {
    background: radial-gradient(circle at center, var(--color1) 0, transparent 50%) no-repeat;
    width: var(--circle-size);
    height: var(--circle-size);
    top: calc(50% - var(--circle-size) / 2);
    left: calc(50% - var(--circle-size) / 2);
    transform-origin: center center;
    animation: moveVertical 30s ease infinite;
    opacity: 1;
}

.g2 {
    background: radial-gradient(circle at center, var(--color2) 0, transparent 50%) no-repeat;
    width: var(--circle-size);
    height: var(--circle-size);
    top: calc(50% - var(--circle-size) / 2);
    left: calc(50% - var(--circle-size) / 2);
    transform-origin: calc(50% - 400px);
    animation: moveInCircle 20s reverse infinite;
    opacity: 0.8;
}

.g3 {
    background: radial-gradient(circle at center, var(--color3) 0, transparent 50%) no-repeat;
    width: var(--circle-size);
    height: var(--circle-size);
    top: calc(50% - var(--circle-size) / 2 + 200px);
    left: calc(50% - var(--circle-size) / 2 - 500px);
    transform-origin: calc(50% + 400px);
    animation: moveInCircle 40s linear infinite;
    opacity: 1;
}

.g4 {
    background: radial-gradient(circle at center, var(--color4) 0, transparent 50%) no-repeat;
    width: var(--circle-size);
    height: var(--circle-size);
    top: calc(50% - var(--circle-size) / 2);
    left: calc(50% - var(--circle-size) / 2);
    transform-origin: calc(50% - 200px);
    animation: moveHorizontal 40s ease infinite;
    opacity: 0.7;
}

.g5 {
    background: radial-gradient(circle at center, var(--color5) 0, transparent 50%) no-repeat;
    width: calc(var(--circle-size) * 2);
    height: calc(var(--circle-size) * 2);
    top: calc(50% - var(--circle-size));
    left: calc(50% - var(--circle-size));
    transform-origin: calc(50% - 800px) calc(50% + 200px);
    animation: moveInCircle 20s ease infinite;
    opacity: 1;
}

.interactive {
    background: radial-gradient(circle at center, var(--color-interactive) 0, transparent 50%) no-repeat;
    width: 100%;
    height: 100%;
    top: -50%;
    left: -50%;
    opacity: 0.8;
}

:root[class='my-app-dark'] .animated-gradient-header {
    --color1: var(--p-purple-500);
    --color2: var(--p-blue-500);
    --color3: var(--p-cyan-500);
    --color4: var(--p-pink-500);
    --color5: var(--p-green-400);
    --color-interactive: var(--p-indigo-500);
    --gradient-start: var(--p-blue-500);
    --gradient-end: var(--p-teal-500);
}

@keyframes moveInCircle {
    0% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(180deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes moveVertical {
    0% {
        transform: translateY(-50%);
    }

    50% {
        transform: translateY(50%);
    }

    100% {
        transform: translateY(-50%);
    }
}

@keyframes moveHorizontal {
    0% {
        transform: translateX(-50%) translateY(-10%);
    }

    50% {
        transform: translateX(50%) translateY(10%);
    }

    100% {
        transform: translateX(-50%) translateY(-10%);
    }
}
</style>
