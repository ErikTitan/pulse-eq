<script>
export default {
    name: 'ResponseCanvas',
    props: {
        weq8: {
            type: Object,
            required: false
        },
        filters: {
            type: Array,
            required: true
        },
        nyquist: {
            type: Number,
            required: true
        },
        devicePixelRatio: {
            type: Number,
            default: () => window.devicePixelRatio || 1
        }
    },
    emits: ['pointermove', 'pointerup', 'pointerleave'],
    data() {
        return {
            resizeObserver: null
        }
    },
    methods: {
        drawFrequencyResponse() {
            if (!this.weq8 || !this.filters || !this.filters.length) return;

            const canvas = this.$refs.responseCanvas;
            const ctx = canvas.getContext('2d');
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            ctx.clearRect(0, 0, displayWidth, displayHeight);

            // Calculate frequency response
            const frequencies = new Float32Array(displayWidth);
            const magResponse = new Float32Array(displayWidth);
            const phaseResponse = new Float32Array(displayWidth);

            // Generate logarithmically spaced frequencies
            for (let i = 0; i < frequencies.length; i++) {
                const logScale = i / displayWidth;
                frequencies[i] = Math.pow(10, Math.log10(20) + logScale * (Math.log10(this.nyquist) - Math.log10(20)));
            }

            // Calculate combined response
            let combinedResponse = new Float32Array(frequencies.length).fill(1);

            this.filters.forEach((filter, index) => {
                if (!filter.bypass && filter.type !== 'noop') {
                    this.weq8.getFrequencyResponse(
                        index,
                        0,
                        frequencies,
                        magResponse,
                        phaseResponse
                    );

                    for (let i = 0; i < frequencies.length; i++) {
                        combinedResponse[i] *= magResponse[i];
                    }
                }
            });

            // Draw response curve
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;

            for (let i = 0; i < frequencies.length; i++) {
                const gain = combinedResponse[i];
                const db = 20 * Math.log10(gain);
                const x = (i / frequencies.length) * displayWidth;
                const y = displayHeight - ((db + 15) / 30) * displayHeight;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
        },

        setupCanvas() {
            const canvas = this.$refs.responseCanvas;
            if (!canvas) return;

            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            canvas.width = displayWidth * this.devicePixelRatio;
            canvas.height = displayHeight * this.devicePixelRatio;

            const ctx = canvas.getContext('2d');
            ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
        }
    },
    mounted() {
        this.setupCanvas();
        this.drawFrequencyResponse();

        this.resizeObserver = new ResizeObserver(() => {
            this.setupCanvas();
            this.drawFrequencyResponse();
        });

        if (this.$refs.responseCanvas) {
            this.resizeObserver.observe(this.$refs.responseCanvas);
        }
    },
    beforeUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    },
    watch: {
        filters: {
            deep: true,
            handler() {
                this.drawFrequencyResponse();
            }
        }
    }
}
</script>

<template>
    <canvas ref="responseCanvas" class="absolute inset-0 w-full h-full z-30" @pointermove="$emit('pointermove', $event)"
        @pointerup="$emit('pointerup', $event)" @pointerleave="$emit('pointerleave', $event)"></canvas>
</template>

<style scoped>
canvas {
    image-rendering: pixelated;
    background: transparent;
}
</style>
