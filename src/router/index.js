// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Auth
import LoginView from '@/views/LoginView.vue'

// Student views
import StudentDashboard from '@/views/student/StudentDashboard.vue'
import RezervacijeView from '@/views/student/RezervacijeView.vue'
import MojeRezervacije from '@/views/student/MojeRezervacije.vue'
import UserGuide from '@/views/student/UserGuide.vue'
import KvaroviView from '@/views/student/KvaroviView.vue'
import StudentProfil from '@/views/student/StudentProfil.vue'

// Admin views
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import StatistikaView from '@/views/admin/StatistikaView.vue'
import AdminProfil from '@/views/admin/AdminProfil.vue'
import NadzorPage from '@/views/admin/NadzorPage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, meta: { guest: true } },

  // ── Student ──────────────────────────────────────────────
  {
    path: '/student',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: '', redirect: '/student/rezervacije' },
      { path: 'rezervacije', component: RezervacijeView },
      { path: 'moje', component: MojeRezervacije },
      { path: 'guide', component: UserGuide },
      { path: 'kvarovi', component: KvaroviView },
      { path: 'profil', component: StudentProfil },
    ]
  },

  // ── Admin ─────────────────────────────────────────────────
  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/nadzor' },
      { path: 'nadzor', component: NadzorPage },
      { path: 'statistika', component: StatistikaView },
      { path: 'profil', component: AdminProfil },
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Wait for auth to initialise on first load
  if (auth.loading) {
    await auth.initAuth()
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }
  if (to.meta.role && auth.profile?.role !== to.meta.role) {
    return next('/login')
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return next(auth.isAdmin ? '/admin' : '/student')
  }
  next()
})

export default router
