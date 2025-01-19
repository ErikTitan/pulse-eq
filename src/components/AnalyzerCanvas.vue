<script>
export default {
    name: 'AnalyzerCanvas',
    props: {
        analyserNode: {
            type: Object,
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
    data() {
        return {
            resizeObserver: null,
            animationFrame: null,
            disposed: false,
            analysisData: null,
            analysisXs: []
        }
    },
    methods: {
        updateAnalysisPositions() {
            const canvas = this.$refs.analyzerCanvas;
            if (!canvas) return;

            canvas.width = canvas.offsetWidth * this.devicePixelRatio;
            canvas.height = canvas.offsetHeight * this.devicePixelRatio;

            const maxLog = Math.log10(this.nyquist) - 1;

            this.analysisXs = Array.from(this.analysisData).map((_, i) => {
                const freq = (i / this.analysisData.length) * this.nyquist;
                return Math.floor(((Math.log10(freq) - 1) / maxLog) * canvas.width);
            });
        },

        drawAnalyzer() {
            if (this.disposed) return;

            const canvas = this.$refs.analyzerCanvas;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            this.analyserNode.getByteFrequencyData(this.analysisData);

            const w = canvas.width;
            const h = canvas.height;
            const yScale = h / 255;

            ctx.clearRect(0, 0, w, h);

            let path = new Path2D();
            path.moveTo(0, h);

            for (let i = 0; i < this.analysisData.length; i++) {
                const rawY = this.analysisData[i];
                const smoothedY = Math.floor(h - rawY * yScale);
                path.lineTo(this.analysisXs[i], smoothedY);
            }

            path.lineTo(w, h);

            ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
            ctx.fill(path);

            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke(path);
            ctx.shadowBlur = 0;

            this.animationFrame = requestAnimationFrame(() => this.drawAnalyzer());
        },

        setupCanvas() {
            const canvas = this.$refs.analyzerCanvas;
            if (!canvas) return;

            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            canvas.width = displayWidth * this.devicePixelRatio;
            canvas.height = displayHeight * this.devicePixelRatio;

            const ctx = canvas.getContext('2d');
            ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
        },

        initializeAnalyzer() {
            this.analysisData = new Uint8Array(this.analyserNode.frequencyBinCount);
            this.updateAnalysisPositions();

            if (this.$refs.analyzerCanvas) {
                this.resizeObserver = new ResizeObserver(() => {
                    this.updateAnalysisPositions();
                });
                this.resizeObserver.observe(this.$refs.analyzerCanvas);
            }

            this.drawAnalyzer();
        }
    },
    mounted() {
        this.setupCanvas();
        if (this.analyserNode) {
            this.initializeAnalyzer();
        }
    },
    beforeUnmount() {
        this.disposed = true;
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    },
    watch: {
        analyserNode: {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    this.initializeAnalyzer();
                }
            }
        }
    }
}
</script>

<template>
    <canvas ref="analyzerCanvas" class="absolute top-0 left-0 w-full h-full z-20"></canvas>
</template>

<style scoped>
canvas {
    image-rendering: pixelated;
    background: transparent;
}
</style>
