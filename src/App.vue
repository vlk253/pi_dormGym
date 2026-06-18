<template>
  <div v-if="!authStore.loading">
    <RouterView />
  </div>
  <div v-else class="app-loading">
    <div class="logo-pulse">DG</div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
onMounted(() => authStore.initAuth())
</script>

<style>
.app-loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0f1e;
}
.logo-pulse {
  font-size: 32px;
  font-weight: 900;
  color: #3b6cf7;
  animation: pulse 1.2s ease-in-out infinite;
  font-family: 'DM Sans', sans-serif;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.92); }
}
</style>
