<script>
import Button from 'primevue/button';
import Footer from '@/components/FooterComponent.vue';
import AnimatedGradientHeader from '@/components/AnimatedGradientHeader.vue';
export default {
  name: 'home',
  components: {
    Button,
    Footer,
    AnimatedGradientHeader,
  },
};
</script>

<template>
  <AnimatedGradientHeader />

  <div class="px-6 lg:px-20 mx-0 my-12 lg:mx-20">
    <div class="text-center">
      <div class="font-normal mb-2 text-4xl" style="color: var(--p-text-hover-color)">Audio
        Excellence Anywhere</div>
      <span class=" text-2xl">Professional-grade equalizer in your browser. No
        downloads
        needed.</span>
    </div>

    <div class="grid grid-cols-12 gap-4 mt-20 pb-2 md:pb-20">
      <div class="flex justify-center col-span-12 lg:col-span-6 p-0 order-1 lg:order-none rounded-lg"
        style="background: var(--gradient-gaming)">
        <img src="../assets/images/hyperx_transparent.png" class="w-11/12" />
      </div>

      <div class="col-span-12 lg:col-span-6 my-auto flex flex-col lg:items-end text-center lg:text-right gap-4">
        <div class="flex items-center justify-center self-center lg:self-end rounded-xl"
          style="width: 4.2rem; height: 4.2rem; background: var(--gradient-gaming)">
          <i class="pi pi-fw pi-trophy !text-4xl text-white"></i>
        </div>
        <div class="leading-none text-3xl font-normal" style="color: var(--p-text-hover-color)">Gaming-Optimized Presets
        </div>
        <span class="text-2xl leading-normal ml-0 md:ml-2 text-color" style="max-width: 650px;">
          Gain the competitive edge with crystal-clear footsteps and rich explosions. Our gaming presets enhance spatial
          awareness and bring your favorite titles to life with precision-tuned frequencies.
        </span>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4 my-20 pt-2 md:pt-20">
      <div class="col-span-12 lg:col-span-6 my-auto flex flex-col text-center lg:text-left lg:items-start gap-4">
        <div class="flex items-center justify-center self-center lg:self-start rounded-xl"
          style="width: 4.2rem; height: 4.2rem; background: var(--gradient-audio)">
          <i class="pi pi-fw pi-headphones !text-3xl text-white"></i>
        </div>
        <div class="leading-none text-3xl font-normal" style="color: var(--p-text-hover-color)">
          Headphone Perfection
        </div>
        <span class="text-2xl leading-normal mr-0 md:mr-2" style="max-width: 650px; color: var(--p-text-color)">
          Transform any headphones into your ideal listening device. Fix frequency imbalances, boost lacking bass, and
          achieve the perfect sound signature for your unique preferences.
        </span>
      </div>
      <div class="flex justify-center order-1 sm:order-2 col-span-12 lg:col-span-6 rounded-lg"
        style="background: var(--gradient-audio)">
        <img src="../assets/images/sennheiser_transparent.png" class="w-11/12" />
      </div>
    </div>
  </div>

  <div class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20 rounded-[20px] " style="background: linear-gradient(0deg, 
            var(--overlay),
            var(--overlay)),
            var(--gradient-testimonial)">
    <div class="flex flex-col justify-center items-center text-center px-4 py-4 md:py-0">
      <div class="mb-2 text-3xl font-semibold text-color">Andrej Šima</div>
      <span class="text-2xl" style="color: var(--p-text-color)">Professional War Thunder Player</span>
      <p class="sm:line-height-2 md:line-height-4 text-2xl mt-6 text-color" style="max-width: 1000px;">
        "PULSE-EQ has revolutionized how I approach audio tuning. The ability to create and share presets instantly has
        made it my go-to tool for quick adjustments during gaming sessions and music production. The precision and ease
        of use are unmatched in the browser-based audio space."
      </p>

    </div>
    <div class="flex flex-col justify-center items-center text-center pt-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 25 25"
        class="text-color fill-current">
        <path
          d="M18,1.25H6A4.756,4.756,0,0,0,1.25,6V18A4.756,4.756,0,0,0,6,22.75H18A4.756,4.756,0,0,0,22.75,18V6A4.756,4.756,0,0,0,18,1.25ZM21.25,18A3.254,3.254,0,0,1,18,21.25H6A3.254,3.254,0,0,1,2.75,18V6A3.254,3.254,0,0,1,6,2.75H18A3.254,3.254,0,0,1,21.25,6ZM15,8.75a.75.75,0,0,0-.75.75v5a.75.75,0,0,0,1.5,0v-5A.75.75,0,0,0,15,8.75ZM18,6.75a.75.75,0,0,0-.75.75v9a.75.75,0,0,0,1.5,0v-9A.75.75,0,0,0,18,6.75ZM6,9.25a.75.75,0,0,0-.75.75v4a.75.75,0,0,0,1.5,0V10A.75.75,0,0,0,6,9.25ZM9,7.25A.75.75,0,0,0,8.25,8v8a.75.75,0,0,0,1.5,0V8A.75.75,0,0,0,9,7.25ZM12,4.25a.75.75,0,0,0-.75.75V19a.75.75,0,0,0,1.5,0V5A.75.75,0,0,0,12,4.25Z" />
      </svg>
    </div>
  </div>

</template>