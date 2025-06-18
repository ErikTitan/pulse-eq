<script>
import Menubar from 'primevue/menubar';
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import AuthDialog from './AuthDialog.vue';
import Tooltip from 'primevue/tooltip';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

export default {
  name: 'NavBar',
  components: {
    Menubar,
    InputText,
    Avatar,
    Badge,
    Button,
    AuthDialog,
  },
  directives: {
    'tooltip': Tooltip
  },
  setup() {
    const authStore = useAuthStore();
    const themeStore = useThemeStore();
    return { authStore, themeStore };
  },
  data() {
    return {
      items: [
        { label: 'Home', icon: 'pi pi-fw pi-home', route: '/' },
        { label: 'Equalizer', icon: 'pi pi-fw pi-wave-pulse', route: '/equalizer' },
        { label: 'Presets', icon: 'pi pi-sliders-h', route: '/presets' },
        { label: 'Features', icon: 'pi pi-objects-column', route: '/features' },
        { label: 'Contact', icon: 'pi pi-fw pi-envelope', route: '/contact' },
      ],
      isScrolled: false,
      authDialogVisible: false,
      authDialogMode: 'login',
    };
  },
  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated;
    },
    userData() {
      return this.authStore.user;
    },
    avatarLabel() {
      return this.authStore.avatarLabel;
    },
    isDarkMode() {
      return this.themeStore.isDarkMode;
    },
    // Derive auth requirements from router - single source of truth
    itemsWithAuth() {
      return this.items.map(item => ({
        ...item,
        requiresAuth: this.getRouteAuthRequirement(item.route)
      }));
    }
  },
  methods: {
    // Get auth requirement from router meta - single source of truth
    getRouteAuthRequirement(routePath) {
      try {
        const route = this.$router.resolve(routePath);
        return route.meta?.requiresAuth || false;
      } catch (error) {
        console.warn(`Could not resolve route: ${routePath}`);
        return false;
      }
    },
    toggleDarkMode() {
      this.themeStore.toggleDarkMode();
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 100;
    },
    showLoginDialog() {
      this.authDialogMode = 'login';
      this.authDialogVisible = true;
    },
    showRegisterDialog() {
      this.authDialogMode = 'register';
      this.authDialogVisible = true;
    },
    onLoginSuccess() {
      this.authDialogVisible = false;

      // Redirect to originally requested page if user was redirected here
      if (this.$route.query.redirect) {
        this.$router.push(this.$route.query.redirect);
      }
    },
    onRegisterSuccess() {
      this.authDialogVisible = false;

      // Redirect to originally requested page if user was redirected here
      if (this.$route.query.redirect) {
        this.$router.push(this.$route.query.redirect);
      }
    },
    async handleLogout() {
      await this.authStore.logout();
    }
  },
  mounted() {
    // Initialize theme from store
    this.themeStore.initializeTheme();

    window.addEventListener('scroll', this.handleScroll);
    this.authStore.checkAuthOnMount();

    // Check if user was redirected here for login
    if (this.$route.query.showLogin === 'true') {
      this.showLoginDialog();
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
};
</script>

<template>
  <div class="fixed w-full z-50 transition-all duration-400 ease-in-out pb-5" :class="{
    'lg:top-3': isScrolled,
    'top-0': !isScrolled
  }">
    <Menubar :model="items" class="transition-all duration-400 ease-in-out mx-auto" :class="{
      'container rounded-lg': isScrolled,
      'w-full max-w-full rounded-none border-none': !isScrolled
    }">
      <template #start>
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 26 26"
            class="text-primary-400 fill-current">
            <path
              d="M18,1.25H6A4.756,4.756,0,0,0,1.25,6V18A4.756,4.756,0,0,0,6,22.75H18A4.756,4.756,0,0,0,22.75,18V6A4.756,4.756,0,0,0,18,1.25ZM21.25,18A3.254,3.254,0,0,1,18,21.25H6A3.254,3.254,0,0,1,2.75,18V6A3.254,3.254,0,0,1,6,2.75H18A3.254,3.254,0,0,1,21.25,6ZM15,8.75a.75.75,0,0,0-.75.75v5a.75.75,0,0,0,1.5,0v-5A.75.75,0,0,0,15,8.75ZM18,6.75a.75.75,0,0,0-.75.75v9a.75.75,0,0,0,1.5,0v-9A.75.75,0,0,0,18,6.75ZM6,9.25a.75.75,0,0,0-.75.75v4a.75.75,0,0,0,1.5,0V10A.75.75,0,0,0,6,9.25ZM9,7.25A.75.75,0,0,0,8.25,8v8a.75.75,0,0,0,1.5,0V8A.75.75,0,0,0,9,7.25ZM12,4.25a.75.75,0,0,0-.75.75V19a.75.75,0,0,0,1.5,0V5A.75.75,0,0,0,12,4.25Z" />
          </svg>
        </a>
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate" class="flex items-center">
            <i :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
            <i v-if="item.requiresAuth && !isAuthenticated" class="pi pi-lock ml-auto text-yellow-500"
              v-tooltip.bottom="'Login required'"></i>
          </a>
        </router-link>
        <a v-else v-ripple class="flex items-center" v-bind="props.action">
          <i :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <i v-if="item.requiresAuth && !isAuthenticated" class="pi pi-lock ml-auto text-yellow-500"
            v-tooltip.bottom="'Login required'"></i>
        </a>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <Button class="v-ripple transition-all duration-400 ease-in-out" @click="toggleDarkMode"
            :icon="isDarkMode ? 'pi pi-moon' : 'pi pi-sun'" :rounded="isScrolled" />
          <InputText placeholder="Search" type="text" class="w-32 sm:w-auto" />

          <!-- Conditional Auth Buttons / Avatar -->
          <template v-if="!isAuthenticated">
            <Button label="Login" icon="pi pi-user" @click="showLoginDialog" text :rounded="isScrolled"
              class="!px-4 !py-2" />
            <Button label="Register" icon="pi pi-user-plus" @click="showRegisterDialog" text :rounded="isScrolled"
              class="!px-4 !py-2" />
          </template>
          <template v-else>
            <Avatar :label="avatarLabel" class="mr-2" shape="circle" @click="handleLogout" style="cursor: pointer;"
              v-tooltip.bottom="'Logout'" />
            <!-- Add dropdown menu here later if needed -->
          </template>
        </div>
      </template>
    </Menubar>
  </div>

  <!-- Authentication Dialog -->
  <AuthDialog v-model:visible="authDialogVisible" :mode="authDialogMode" @login-success="onLoginSuccess"
    @register-success="onRegisterSuccess" />
</template>
<style scoped></style>
