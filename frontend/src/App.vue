<script>
import { mapStores } from 'pinia';
import NavBar from './components/NavBar.vue';
import FooterComponent from './components/FooterComponent.vue';
import ScrollTop from 'primevue/scrolltop';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { usePresetCategoryStore } from './stores/presetCategoryStore';

export default {
  components: {
    NavBar,
    FooterComponent,
    ScrollTop,
  },
  computed: {
    ...mapStores(useThemeStore, useAuthStore, usePresetCategoryStore),
  },
  methods: {
    handleShowLogin() {
      this.$refs.navbar.showLoginDialog();
    },
    handleShowRegister() {
      this.$refs.navbar.showRegisterDialog();
    },
  },
  mounted() {
    // Initialize theme on app startup
    this.themeStore.initializeTheme();
    this.authStore.validateSessionOnStartup();
  },
};
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
