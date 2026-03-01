<script>
import { mapStores } from 'pinia'
import { useThemeStore } from '@/stores/themeStore'

export default {
  name: 'ParticleHeader',
  data() {
    return {
      particles: [],
      animationId: null,
      waves: [
        { frequency: 0.006, amplitude: 60, speed: 0.004, offset: 0 },
        { frequency: 0.012, amplitude: 45, speed: -0.002, offset: 5 },
        { frequency: 0.009, amplitude: 30, speed: 0.005, offset: -5 },
        { frequency: 0.004, amplitude: 70, speed: 0.0015, offset: 10 }
      ],
      time: 0,
      mouse: { x: null, y: null },
      containerWidth: 0,
      containerHeight: 0
    }
  },
  computed: {
    ...mapStores(useThemeStore),
    isDarkMode() {
      return this.themeStore.isDarkMode;
    }
  },
  mounted() {
    this.initCanvas()
  },
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', this.resizeCanvas)
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.waveCanvas;
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', this.resizeCanvas);
      this.generateParticles();
      this.animate();
    },
    resizeCanvas() {
      if (this.canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        
        this.containerWidth = rect.width;
        this.containerHeight = rect.height;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
      }
    },
    handleMouseMove(e) {
      if (!this.canvas) return;
      
      const rect = this.$refs.waveCanvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width / (window.devicePixelRatio || 1);
      const scaleY = this.canvas.height / rect.height / (window.devicePixelRatio || 1);
      
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    },
    handleMouseLeave() {
      this.mouse.x = null;
      this.mouse.y = null;
    },
    generateParticles() {
      const particleCount = 45; 
      this.particles = [];
      
      if (!this.containerWidth || !this.containerHeight) {
          const rect = this.$el.getBoundingClientRect();
          this.containerWidth = rect.width;
          this.containerHeight = rect.height;
      }
      
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.containerWidth,
          y: Math.random() * this.containerHeight,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2, 
          size: Math.random() * 2 + 1, 
          opacity: Math.random() * 0.5 + 0.1
        })
      }
    },
    animate() {
      if (!this.canvas || !this.ctx) return;
      
      const width = this.canvas.width / window.devicePixelRatio;
      const height = this.canvas.height / window.devicePixelRatio;
      const centerY = height * 0.85;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.save();
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const isDark = this.isDarkMode;

      this.particles.forEach(p => {
        if (this.mouse.x !== null) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repulsionRadius = 200;

          if (distance < repulsionRadius) {
            const force = (1 - distance / repulsionRadius);
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.15;
            p.vy += Math.sin(angle) * force * 0.15;
          }
        }
        
        const maxSpeed = 0.2;
        p.vx *= 0.96;
        p.vy *= 0.96;
        
        if (Math.abs(p.vx) < maxSpeed && Math.abs(p.vx) > 0.01) p.vx = (p.vx > 0 ? 1 : -1) * maxSpeed; 
        if (Math.abs(p.vy) < maxSpeed && Math.abs(p.vy) > 0.01) p.vy = (p.vy > 0 ? 1 : -1) * maxSpeed;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        this.ctx.beginPath();
        const r = isDark ? 74 : 50; 
        const g = isDark ? 222 : 180; 
        const b = isDark ? 128 : 120;
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      });

      this.waves.forEach((wave, index) => {
        this.ctx.beginPath();
        
        const r = isDark ? 74 : 30; 
        const g = isDark ? 222 : 160; 
        const b = isDark ? 128 : 100;
        const baseAlpha = isDark ? 0.3 : 0.15;
        
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha - (index * 0.05)})`;
        this.ctx.lineWidth = isDark ? 2 : 1.5;

        const waveBaseY = centerY + wave.offset;

        for (let x = 0; x <= width; x += 5) {
          const relativeX = x / width;
          const attenuation = 4 * relativeX * (1 - relativeX);
          
          let y = waveBaseY + 
            (Math.sin(x * wave.frequency + this.time * wave.speed) + 
             Math.sin(x * wave.frequency * 2.3 + this.time * wave.speed * 1.5) * 0.4) * 
            (wave.amplitude * attenuation);

          if (this.mouse.x !== null) {
             const dx = x - this.mouse.x;
             const dist = Math.abs(dx);
             const interactionRadius = 250;
             
             if (dist < interactionRadius) {
                 const normDist = dist / interactionRadius;
                 const influence = 0.5 * (1 + Math.cos(normDist * Math.PI));
                 const distY = waveBaseY - this.mouse.y;
                 const dir = (distY > 0) ? 1 : -1;
                 const verticalFade = Math.min(1, Math.abs(distY) / 80);
                 
                 y += dir * influence * verticalFade * 8;
             }
          }

          if (x === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.stroke();
      });

      this.ctx.restore();
      this.time += 0.2;
      this.animationId = requestAnimationFrame(this.animate);
    }
  }
}
</script>

<template>
  <div 
    :class="['particle-header-container', { 'is-dark': isDarkMode }]"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <canvas ref="waveCanvas" class="wave-canvas"></canvas>
    <div class="header-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.particle-header-container {
  position: relative;
  width: 100%;
  padding: 6rem 1rem 4rem 1rem;
  background: radial-gradient(circle at center, var(--p-surface-50) 0%, var(--p-surface-200) 100%);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--p-surface-200);
  cursor: default;
}

.particle-header-container.is-dark {
  background: radial-gradient(circle at center, var(--p-surface-800) 0%, var(--p-surface-950) 100%);
  border-bottom: 1px solid var(--p-surface-800);
}

.header-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 800px;
  pointer-events: none;
}

.header-content :deep(*) {
  pointer-events: auto;
}

.wave-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  opacity: 1;
  pointer-events: none;
}
</style>