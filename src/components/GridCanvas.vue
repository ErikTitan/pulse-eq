<script>
export default {
    name: 'GridCanvas',
    props: {
        nyquist: {
            type: Number,
            required: true
        },
        devicePixelRatio: {
            type: Number,
            default: () => window.devicePixelRatio || 1
        }
    },
    data() {
        return {
            resizeObserver: null
        }
    },
    methods: {
        calculateGridLines() {
            const xLevelsOfScale = Math.floor(Math.log10(this.nyquist));
            const gridXs = [];

            for (let los = 0; los < xLevelsOfScale; los++) {
                let step = Math.pow(10, los + 1);
                for (let i = 1; i < 10; i++) {
                    let freq = step * i;
                    if (freq > this.nyquist) break;
                    gridXs.push(((Math.log10(freq) - 1) / (Math.log10(this.nyquist) - 1)) * 100);
                }
            }

            return gridXs;
        },

        drawGrid() {
            const canvas = this.$refs.gridCanvas;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;

            // Draw vertical frequency lines
            const gridXs = this.calculateGridLines();
            gridXs.forEach(x => {
                const xPos = (x / 100) * width;
                ctx.beginPath();
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, height);
                ctx.stroke();
            });

            // Draw horizontal dB lines
            [-12, -6, 0, 6, 12].forEach(db => {
                const y = height - ((db + 15) / 30) * height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            });
        },

        setupCanvas() {
            const canvas = this.$refs.gridCanvas;
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
        this.drawGrid();

        this.resizeObserver = new ResizeObserver(() => {
            this.setupCanvas();
            this.drawGrid();
        });

        if (this.$refs.gridCanvas) {
            this.resizeObserver.observe(this.$refs.gridCanvas);
        }
    },
    beforeUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
</script>

<template>
    <canvas ref="gridCanvas" class="absolute top-0 left-0 w-full h-full z-10"></canvas>
</template>

<style scoped>
canvas {
    image-rendering: pixelated;
    background: transparent;
}
</style>
