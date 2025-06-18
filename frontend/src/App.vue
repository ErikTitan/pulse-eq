<script>
import NavBar from './components/NavBar.vue'
import FooterComponent from './components/FooterComponent.vue';
import ScrollTop from 'primevue/scrolltop';
import { useThemeStore } from './stores/themeStore';

export default {
  components: {
    NavBar,
    FooterComponent,
    ScrollTop,
  },
  setup() {
    const themeStore = useThemeStore();
    return { themeStore };
  },
  methods: {
    handleShowLogin() {
      this.$refs.navbar.showLoginDialog();
    },
    handleShowRegister() {
      this.$refs.navbar.showRegisterDialog();
    }
  },
  mounted() {
    // Initialize theme on app startup
    this.themeStore.initializeTheme();
  }
}
</script>

<template>
  <div>
    <NavBar ref="navbar" />
    <RouterView @showLogin="handleShowLogin" @showRegister="handleShowRegister" />
    <ScrollTop :threshold="100" />
    <FooterComponent />
  </div>
</template>

<style scoped></style>
