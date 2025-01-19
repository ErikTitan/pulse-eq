<script>
import NavBar from './components/NavBar.vue'
import FooterComponent from './components/FooterComponent.vue';
import ScrollTop from 'primevue/scrolltop';

export default {
  components: {
    NavBar,
    FooterComponent,
    ScrollTop,
  }
}
</script>

<template>
  <div>
    <NavBar />
    <RouterView />
    <ScrollTop :threshold="100" />
    <FooterComponent />
  </div>
</template>

<style scoped></style>