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
      default: 'bauhaus',
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
  },
};
</script>

<template>
  <div class="avatar-wrapper">
    <Avatar :size="avatarSize" :name="userName" :variant="variant" :colors="colorPalette" :title="true" />
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
