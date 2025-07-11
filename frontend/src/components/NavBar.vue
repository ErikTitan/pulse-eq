<script>
import Menubar from 'primevue/menubar';
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import AuthDialog from './AuthDialog.vue';
import UserAvatar from './UserAvatar.vue';
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
    UserAvatar,
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
      isAvatarMenuOpen: false,
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
    itemsWithAuth() {
      return this.items.map(item => ({
        ...item,
        requiresAuth: this.getRouteAuthRequirement(item.route)
      }));
    }
  },
  methods: {
    // Get auth requirement from router meta
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
    },
    toggleAvatarMenu(event) {
      event.stopPropagation();
      this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
    },
    closeAvatarMenu() {
      this.isAvatarMenuOpen = false;
    },
    handleClickOutside(event) {
      if (this.$refs.avatarContainer && !this.$refs.avatarContainer.contains(event.target)) {
        this.closeAvatarMenu();
      }
    },
    navigateToMyPresets() {
      this.$router.push('/my-presets');
      this.closeAvatarMenu();
    },
    toggleThemeFromMenu() {
      this.themeStore.toggleDarkMode();
      this.closeAvatarMenu();
    },
    async logoutFromMenu() {
      await this.authStore.logout();
      this.closeAvatarMenu();
    }
  },
  mounted() {
    // Initialize theme from store
    this.themeStore.initializeTheme();

    window.addEventListener('scroll', this.handleScroll);
    document.addEventListener('click', this.handleClickOutside);

    // Check if user was redirected here for login
    if (this.$route.query.showLogin === 'true') {
      this.showLoginDialog();
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('click', this.handleClickOutside);
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
        <div class="flex items-center gap-1">
          <!-- Dark Mode Toggle -->
          <Button @click="toggleDarkMode" :icon="isDarkMode ? 'pi pi-moon' : 'pi pi-sun'" text :rounded="isScrolled"
            class="control-btn !p-2 !w-9 !h-9" v-tooltip.bottom="isDarkMode ? 'Light Mode' : 'Dark Mode'" />

          <!-- Conditional Auth Buttons / Avatar -->
          <template v-if="!isAuthenticated">
            <Button label="Login" icon="pi pi-user" @click="showLoginDialog" text :rounded="isScrolled"
              class="control-btn !px-3 !py-2 !h-9" />
            <Button label="Register" icon="pi pi-user-plus" @click="showRegisterDialog" text :rounded="isScrolled"
              class="control-btn !px-3 !py-2 !h-9" />
          </template>
          <template v-else>
            <!-- Avatar with dropdown menu -->
            <div ref="avatarContainer" class="avatar-container relative">
              <button @click="toggleAvatarMenu"
                class="avatar-btn !w-9 !h-9 overflow-hidden flex items-center justify-center"
                :class="isScrolled ? 'rounded-lg' : 'rounded-none'">
                <UserAvatar :user="userData" size="small" :variant="authStore.avatarVariant" />
              </button>

              <!-- Avatar dropdown menu -->
              <div v-if="isAvatarMenuOpen" :class="[
                'absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg py-1 z-50',
                isDarkMode ? 'bg-surface-900 border-primary-900' : 'bg-white border-gray-200'
              ]">
                <button @click="navigateToMyPresets" :class="[
                  'w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-150',
                  isDarkMode ? 'text-gray-200 hover:bg-surface-800' : 'text-gray-700 hover:bg-gray-50'
                ]">
                  <i class="pi pi-sliders-h text-sm"></i>
                  <span>My Presets</span>
                </button>

                <button @click="toggleThemeFromMenu" :class="[
                  'w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-150',
                  isDarkMode ? 'text-gray-200 hover:bg-surface-800' : 'text-gray-700 hover:bg-gray-50'
                ]">
                  <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" class="text-sm"></i>
                  <span>Toggle Theme</span>
                </button>

                <hr :class="['my-1', isDarkMode ? 'border-gray-600' : 'border-gray-200']" />

                <button @click="logoutFromMenu" :class="[
                  'w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-150',
                  isDarkMode ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                ]">
                  <i class="pi pi-sign-out text-sm"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </template>
        </div>
      </template>
    </Menubar>
  </div>

  <!-- Authentication Dialog -->
  <AuthDialog v-model:visible="authDialogVisible" :mode="authDialogMode" @login-success="onLoginSuccess"
    @register-success="onRegisterSuccess" />
</template>
<style scoped>
.control-btn {
  @apply hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200;
}

.avatar-btn {
  @apply transition-transform duration-150 ease-in-out hover:scale-110;
}
</style>

<style>
/* Global tooltip styling - tooltips are rendered at document root */
.p-tooltip {
  --p-tooltip-max-width: 8rem !important;
  --p-tooltip-padding: 0.375rem 0.625rem !important;
}

.p-tooltip-text {
  font-size: 0.75rem !important;
}
</style>
