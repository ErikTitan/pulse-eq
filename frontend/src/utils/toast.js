import { ref } from 'vue'

export const toast = ref(null)

export function useToast() {
  return toast.value
}

export default {
  install: (app) => {
    const toastService = app.config.globalProperties.$toast
    if (toastService) {
      toast.value = toastService
    } else {
      console.error(
        'Toast service is not available. Did you forget to install it with app.use(ToastService)?',
      )
    }

    // Make it available in all components
    app.config.globalProperties.$toast = toastService
  },
}
