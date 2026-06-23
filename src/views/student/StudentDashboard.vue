<template>
  <div class="page-shell">

    <!-- DESKTOP SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-mark">DG</div>
        <span class="sidebar-logo-text">DormGym</span>
      </div>

      <div class="sidebar-user">
        <div class="sidebar-avatar" style="background: var(--blue);">{{ auth.profile?.avatarInitials || 'ST' }}</div>
        <div>
          <div class="sidebar-user-name">{{ auth.profile?.name }}</div>
          <div class="sidebar-user-role">Student</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="sidebar-item"
          :class="{ active: route.path === item.path }"
          @click="router.push(item.path)"
        >
          <component :is="item.icon" />
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <!-- MOBILE TOP HEADER -->
    <header class="page-header">
      <div class="header-left">
        <div class="avatar-circle">{{ auth.profile?.avatarInitials || 'ST' }}</div>
        <div>
          <div class="header-name">{{ auth.profile?.name }}</div>
          <div class="header-role">Student</div>
        </div>
      </div>
      <div class="header-right">
        <span class="logo-badge">DormGym</span>
      </div>
    </header>

    <!-- PAGE CONTENT -->
    <RouterView />

    <!-- MOBILE BOTTOM NAV -->
    <nav class="bottom-nav">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: route.path === item.path }"
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

const IconCalendar = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }),
  h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }),
  h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }),
  h('line', { x1: 3, y1: 10, x2: 21, y2: 10 }),
])
const IconMyRes = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M9 11l3 3L22 4' }),
  h('path', { d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' }),
])
const IconGuide = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
  h('line', { x1: 12, y1: 17, x2: 12.01, y2: 17 }),
])
const IconProfil = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 12, cy: 7, r: 4 }),
])

const navItems = [
  { path: '/student/rezervacije', label: 'Rezervacije', icon: IconCalendar },
  { path: '/student/moje',        label: 'Moje',        icon: IconMyRes },
  { path: '/student/guide',       label: 'Upute',       icon: IconGuide },
  { path: '/student/profil',      label: 'Profil',      icon: IconProfil },
]
</script>

<style scoped>
.header-left { display: flex; align-items: center; gap: 10px; }
.avatar-circle {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--blue); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px;
}
.header-name { font-size: 14px; font-weight: 700; color: var(--text); }
.header-role { font-size: 11px; color: var(--muted); }
.logo-badge {
  background: var(--blue-light);
  color: var(--blue);
  font-size: 12px; font-weight: 800;
  padding: 4px 10px; border-radius: 8px;
}
</style>
