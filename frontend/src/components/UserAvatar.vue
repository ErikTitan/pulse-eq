<script>
import Avatar from 'vue-boring-avatars';

export default {
  name: 'UserAvatar',
  components: {
    Avatar,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    size: {
      type: String,
      default: 'normal',
      validator: (value) => ['small', 'normal', 'large', 'xlarge'].includes(value),
    },
    variant: {
      type: String,
      validator: (value) => ['bauhaus', 'beam', 'marble', 'pixel', 'ring', 'sunset'].includes(value),
    },
  },
  computed: {
    avatarSize() {
      const sizes = {
        small: 32,
        normal: 40,
        large: 48,
        xlarge: 64
      };
      return sizes[this.size] || sizes.normal;
    },
    userName() {
      return this.user?.name || 'Anonymous User';
    },
    colorPalette() {
      return [
        '#3B82F6', // blue-500
        '#10B981', // emerald-500
        '#8B5CF6', // violet-500
        '#F59E0B', // amber-500
        '#EF4444', // red-500
        '#06B6D4', // cyan-500
        '#84CC16', // lime-500
        '#F97316', // orange-500
        '#EC4899', // pink-500
        '#6366F1'  // indigo-500
      ];
    },
    finalVariant() {
      if (this.variant) {
        return this.variant;
      }
      const variants = ['bauhaus', 'beam', 'marble', 'pixel', 'ring', 'sunset'];
      const name = this.userName;
      if (name === 'Anonymous User') {
        return 'marble';
      }
      const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = hash % variants.length;
      return variants[index];
    },
  },
};
</script>

<template>
  <div class="relative">
    <button @click="toggleMenu" class="avatar-wrapper">
      <Avatar :size="avatarSize" :name="userName" :variant="finalVariant" :colors="colorPalette" :title="true" />
    </button>

    <!-- Custom dropdown menu -->
    <div v-if="isMenuOpen"
      class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
      <template v-for="(item, index) in menuItems" :key="index">
        <hr v-if="item.separator" class="my-1 border-gray-200 dark:border-gray-700" />
        <button v-else @click="item.action"
          class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors duration-150">
          <i :class="item.icon" class="text-sm"></i>
          <span>{{ item.label }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.avatar-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
