<script>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { useAuthStore } from '../stores/authStore';

export default {
  name: 'AuthDialog',
  components: {
    Button,
    Dialog,
    InputText,
    Message,
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      validator: (value) => ['login', 'register'].includes(value),
    },
  },
  emits: ['update:visible', 'loginSuccess', 'registerSuccess'],
  data() {
    return {
      internalVisible: this.visible,
      currentMode: this.mode,
      loginForm: { email: '', password: '' },
      registerForm: { name: '', email: '', password: '', password_confirmation: '' },
    };
  },
  computed: {
    errorMessage() {
      return this.authStore.error;
    },
    isLoading() {
      return this.authStore.isLoading;
    }
  },
  watch: {
    visible(newValue) {
      this.internalVisible = newValue;
      if (newValue) {
        this.resetForms();
      }
    },
    mode(newValue) {
      if (this.internalVisible && this.currentMode !== newValue) {
        this.errorMessage = null;
        this.currentMode = newValue;
        this.resetForms();
      } else {
        this.currentMode = newValue;
      }
    },
    internalVisible(newValue) {
      // Emit update back to parent
      if (!newValue) {
        this.$emit('update:visible', false);
      }
    }
  },
  methods: {
    resetForms() {
      this.loginForm = { email: '', password: '' };
      this.authStore.clearError();
      this.registerForm = { name: '', email: '', password: '', password_confirmation: '' };
    },
    closeDialog() {
      this.$emit('update:visible', false);
    },
    switchToRegister() {
      this.currentMode = 'register';
      this.resetForms();
    },
    switchToLogin() {
      this.currentMode = 'login';
      this.resetForms();
    },
    async handleLogin() {
      const result = await this.authStore.login(this.loginForm);

      if (result.success) {
        this.$emit('loginSuccess', result.user);
        this.closeDialog();
      }
    },
    async handleRegister() {
      const result = await this.authStore.register(this.registerForm);

      if (result.success) {
        this.$emit('registerSuccess', result.user);
        this.closeDialog();
      }
    },
  },
};
</script>

<template>
  <Dialog v-model:visible="internalVisible" @update:visible="closeDialog" modal
    :header="currentMode === 'login' ? 'Login' : 'Register'" :style="{ width: '25rem' }"
    pt:root:class="!border-0 !bg-transparent" pt:mask:class="backdrop-blur-sm">
    <template #container="{ closeCallback }">
      <Message v-if="errorMessage" severity="error" :closable="false" class="mb-4 mx-8 !mt-0">{{ errorMessage }}
      </Message>

      <!-- Login Form -->
      <form v-if="currentMode === 'login'" @submit.prevent="handleLogin"
        class="flex flex-col px-8 py-8 gap-6 rounded-2xl"
        style="background-image: radial-gradient(circle at left top, var(--p-primary-400), var(--p-primary-700))">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26"
          class="block mx-auto text-primary-50 fill-current w-16 h-16 mb-2">
          <path
            d="M18,1.25H6A4.756,4.756,0,0,0,1.25,6V18A4.756,4.756,0,0,0,6,22.75H18A4.756,4.756,0,0,0,22.75,18V6A4.756,4.756,0,0,0,18,1.25ZM21.25,18A3.254,3.254,0,0,1,18,21.25H6A3.254,3.254,0,0,1,2.75,18V6A3.254,3.254,0,0,1,6,2.75H18A3.254,3.254,0,0,1,21.25,6ZM15,8.75a.75.75,0,0,0-.75.75v5a.75.75,0,0,0,1.5,0v-5A.75.75,0,0,0,15,8.75ZM18,6.75a.75.75,0,0,0-.75.75v9a.75.75,0,0,0,1.5,0v-9A.75.75,0,0,0,18,6.75ZM6,9.25a.75.75,0,0,0-.75.75v4a.75.75,0,0,0,1.5,0V10A.75.75,0,0,0,6,9.25ZM9,7.25A.75.75,0,0,0,8.25,8v8a.75.75,0,0,0,1.5,0V8A.75.75,0,0,0,9,7.25ZM12,4.25a.75.75,0,0,0-.75.75V19a.75.75,0,0,0,1.5,0V5A.75.75,0,0,0,12,4.25Z" />
        </svg>
        <div class="inline-flex flex-col gap-2">
          <label for="login-email" class="text-primary-50 font-semibold">Email</label>
          <InputText id="login-email" v-model="loginForm.email" type="email" required
            class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-full"></InputText>
        </div>
        <div class="inline-flex flex-col gap-2">
          <label for="login-password" class="text-primary-50 font-semibold">Password</label>
          <InputText id="login-password" v-model="loginForm.password" type="password" required
            class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-full"></InputText>
        </div>
        <div class="flex items-center gap-4 mt-2">
          <Button label="Cancel" @click="closeCallback" text :disabled="isLoading"
            class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>
          <Button label="Sign-In" type="submit" text :loading="isLoading"
            class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>
        </div>
        <div class="text-center mt-2">
          <a href="#" @click.prevent="switchToRegister" class="text-primary-100 hover:text-primary-50 text-sm">Don't
            have an account? Register</a>
        </div>
      </form>

      <!-- Registration Form -->
      <form v-if="currentMode === 'register'" @submit.prevent="handleRegister"
        class="flex flex-col px-8 py-8 gap-6 rounded-2xl"
        style="background-image: radial-gradient(circle at left top, var(--p-primary-400), var(--p-primary-700))">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26"
          class="block mx-auto text-primary-50 fill-current w-16 h-16 mb-2">
          <path
            d="M18,1.25H6A4.756,4.756,0,0,0,1.25,6V18A4.756,4.756,0,0,0,6,22.75H18A4.756,4.756,0,0,0,22.75,18V6A4.756,4.756,0,0,0,18,1.25ZM21.25,18A3.254,3.254,0,0,1,18,21.25H6A3.254,3.254,0,0,1,2.75,18V6A3.254,3.254,0,0,1,6,2.75H18A3.254,3.254,0,0,1,21.25,6ZM15,8.75a.75.75,0,0,0-.75.75v5a.75.75,0,0,0,1.5,0v-5A.75.75,0,0,0,15,8.75ZM18,6.75a.75.75,0,0,0-.75.75v9a.75.75,0,0,0,1.5,0v-9A.75.75,0,0,0,18,6.75ZM6,9.25a.75.75,0,0,0-.75.75v4a.75.75,0,0,0,1.5,0V10A.75.75,0,0,0,6,9.25ZM9,7.25A.75.75,0,0,0,8.25,8v8a.75.75,0,0,0,1.5,0V8A.75.75,0,0,0,9,7.25ZM12,4.25a.75.75,0,0,0-.75.75V19a.75.75,0,0,0,1.5,0V5A.75.75,0,0,0,12,4.25Z" />
        </svg>
        <div class="inline-flex flex-col gap-2">
          <label for="register-name" class="text-primary-50 font-semibold">Name</label>
          <InputText id="register-name" v-model="registerForm.name" type="text" required
            class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-full"></InputText>
        </div>
        <div class="inline-flex flex-col gap-2">
          <label for="register-email" class="text-primary-50 font-semibold">Email</label>
          <InputText id="register-email" v-model="registerForm.email" type="email" required
            class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-full"></InputText>
        </div>
        <div class="inline-flex flex-col gap-2">
          <label for="register-password" class="text-primary-50 font-semibold">Password</label>
          <InputText id="register-password" v-model="registerForm.password" type="password" required
            class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-full"></InputText>
        </div>
        <div class="inline-flex flex-col gap-2">
          <label for="register-password-confirm" class="text-primary-50 font-semibold">Confirm Password</label>
          <InputText id="register-password-confirm" v-model="registerForm.password_confirmation" type="password"
            required class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-full"></InputText>
        </div>
        <div class="flex items-center gap-4 mt-2">
          <Button label="Cancel" @click="closeCallback" text :disabled="isLoading"
            class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>
          <Button label="Register" type="submit" text :loading="isLoading"
            class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>
        </div>
        <div class="text-center mt-2">
          <a href="#" @click.prevent="switchToLogin" class="text-primary-100 hover:text-primary-50 text-sm">Already have
            an account? Login</a>
        </div>
      </form>
    </template>
  </Dialog>
</template>

<style scoped></style>
