<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="header-left">
        <div class="avatar-circle admin">{{ auth.profile?.avatarInitials || 'AD' }}</div>
        <div>
          <div class="header-name">{{ auth.profile?.name }}</div>
          <div class="header-role">Administrator</div>
        </div>
      </div>
      <span class="logo-badge admin">DoreGym</span>
    </header>

    <RouterView />

    <nav class="bottom-nav">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: route.path.startsWith(item.path) }"
        @click="router.push(item.path)"
      >
        <component :is="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { useRoute, useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { h } from 'vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const IconNadzor = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 3, y: 3, width: 7, height: 7 }), h('rect', { x: 14, y: 3, width: 7, height: 7 }),
  h('rect', { x: 14, y: 14, width: 7, height: 7 }), h('rect', { x: 3, y: 14, width: 7, height: 7 }),
])
const IconStats = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }), h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
  h('line', { x1: 6, y1: 20, x2: 6, y2: 14 }),
])
const IconProfil = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 12, cy: 7, r: 4 }),
])

const navItems = [
  { path: '/admin/nadzor', label: 'Upravljanje', icon: IconNadzor },
  { path: '/admin/statistika', label: 'Statistika', icon: IconStats },
  { path: '/admin/profil', label: 'Profil', icon: IconProfil },
]
</script>

<style scoped>
.header-left { display: flex; align-items: center; gap: 10px; }
.avatar-circle {
  width: 36px; height: 36px; border-radius: 50%;
  background: #1a1a2e; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px;
}
.header-name { font-size: 14px; font-weight: 700; }
.header-role { font-size: 11px; color: var(--muted); }
.logo-badge.admin {
  background: #1a1a2e; color: #fff;
  font-size: 12px; font-weight: 800;
  padding: 4px 10px; border-radius: 8px;
}
</style>
