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
    },
    highlightedRange: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      resizeObserver: null
    }
  },
  watch: {
    highlightedRange() {
      this.drawGrid();
    }
  },
  methods: {
    calculateGridLines() {
      const minFreq = 20;
      const xLevelsOfScale = Math.floor(Math.log10(this.nyquist));
      const gridLines = [];

      for (let los = 0; los < xLevelsOfScale; los++) {
        let step = Math.pow(10, los + 1);
        for (let i = 1; i < 10; i++) {
          let freq = step * i;
          if (freq < minFreq || freq > this.nyquist) continue;
          const position = ((Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(this.nyquist) - Math.log10(minFreq))) * 100;
          gridLines.push({ freq, position });
        }
      }

      return gridLines;
    },

    getFrequencyPosition(freq) {
      const minFreq = 20;
      return ((Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(this.nyquist) - Math.log10(minFreq))) * 100;
    },

    formatFrequency(freq) {
      if (freq >= 1000) {
        return `${freq / 1000}k`;
      }
      return `${freq}`;
    },

    isEmphasizedFrequency(freq) {
      const emphasizedFreqs = [80, 300, 1000, 4000, 6000, 10000];
      return emphasizedFreqs.includes(freq);
    },

    drawGrid() {
      const canvas = this.$refs.gridCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (this.highlightedRange) {
        this.drawHighlight(ctx, width, height);
      }

      const gridLines = this.calculateGridLines();
      const displayWidth = width / this.devicePixelRatio;
      const displayHeight = height / this.devicePixelRatio;

      gridLines.forEach(({ freq, position }) => {
        const xPos = (position / 100) * width;
        const displayXPos = (position / 100) * displayWidth;
        const isEmphasized = this.isEmphasizedFrequency(freq);

        ctx.strokeStyle = isEmphasized ? '#555555' : '#333333';
        ctx.lineWidth = isEmphasized ? 2 : 1;

        const emphasizedFreqs = [20, 80, 300, 1000, 4000, 6000, 10000, 20000];
        const hasLabel = emphasizedFreqs.includes(freq) && freq <= this.nyquist;

        ctx.beginPath();
        if (hasLabel && displayXPos >= 0 && displayXPos <= displayWidth) {
          ctx.moveTo(xPos, 0);
          ctx.lineTo(xPos, height - (25 * this.devicePixelRatio));
        } else {
          ctx.moveTo(xPos, 0);
          ctx.lineTo(xPos, height);
        }
        ctx.stroke();
      });

      const dbValues = [-18, -12, -6, 0, 6, 12, 18];
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;

      dbValues.forEach(db => {
        const y = height - ((db + 18) / 36) * height;
        const displayY = displayHeight - ((db + 18) / 36) * displayHeight;

        if (displayY > 10 && displayY < displayHeight - 10) {
          const labelText = `${db > 0 ? '+' : ''}${db}`;
          ctx.font = '12px Arial';
          const labelWidth = ctx.measureText(labelText).width;
          const cutoutWidth = (labelWidth + 16) * this.devicePixelRatio;

          ctx.beginPath();
          ctx.moveTo(cutoutWidth, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      });

      this.drawAxisLabels(ctx, width, height, dbValues);
    },

    drawHighlight(ctx, width, height) {
      const { minFreq, maxFreq } = this.highlightedRange;
      const startPos = this.getFrequencyPosition(minFreq);
      const endPos = this.getFrequencyPosition(maxFreq);

      const startX = (startPos / 100) * width;
      const endX = (endPos / 100) * width;

      ctx.fillStyle = 'rgba(79, 70, 229, 0.1)';
      ctx.fillRect(startX, 0, endX - startX, height);
    },

    drawAxisLabels(ctx, width, height, dbValues) {
      const displayWidth = width / this.devicePixelRatio;
      const displayHeight = height / this.devicePixelRatio;

      ctx.fillStyle = '#888888';
      ctx.font = '12px Arial';

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const emphasizedFreqs = [20, 80, 300, 1000, 4000, 6000, 10000, 20000];
      emphasizedFreqs.forEach(freq => {
        if (freq <= this.nyquist) {
          const position = this.getFrequencyPosition(freq);
          const xPos = (position / 100) * displayWidth;

          const labelWidth = ctx.measureText(this.formatFrequency(freq)).width;
          const halfLabelWidth = labelWidth / 2;
          const padding = 8;

          let adjustedXPos = xPos;
          if (xPos - halfLabelWidth < padding) {
            adjustedXPos = halfLabelWidth + padding;
          } else if (xPos + halfLabelWidth > displayWidth - padding) {
            adjustedXPos = displayWidth - halfLabelWidth - padding;
          }

          if (adjustedXPos >= halfLabelWidth + padding && adjustedXPos <= displayWidth - halfLabelWidth - padding) {
            ctx.fillStyle = '#888888';
            ctx.fillText(this.formatFrequency(freq), adjustedXPos, displayHeight - 20);
          }
        }
      });

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Arial';

      dbValues.forEach(db => {
        const y = displayHeight - ((db + 18) / 36) * displayHeight;
        if (y > 10 && y < displayHeight - 10) {
          const labelText = `${db > 0 ? '+' : ''}${db}`;
          ctx.fillStyle = '#888888';
          ctx.fillText(labelText, 8, y);
        }
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
