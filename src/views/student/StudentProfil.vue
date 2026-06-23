<template>
  <div class="page-content">
    <div class="card profil-hero">
      <div class="profil-avatar">{{ auth.profile?.avatarInitials }}</div>
      <div class="profil-name">{{ auth.profile?.name }}</div>
      <div class="profil-email">{{ auth.profile?.email }}</div>
    </div>

    <div class="card">
      <div class="section-title" style="margin-bottom:12px">Postavke</div>
      <div class="settings-list">
        <div class="setting-row">
          <span>Prijava na termin</span>
          <span class="badge badge-green">Aktivno</span>
        </div>
        <div class="setting-row">
          <span>Email obavijesti</span>
          <label class="toggle">
            <input type="checkbox" v-model="emailNotifs" />
            <span class="toggle-track"/>
          </label>
        </div>
        <div class="setting-row">
          <span>Push obavijesti</span>
          <label class="toggle">
            <input type="checkbox" v-model="pushNotifs" />
            <span class="toggle-track"/>
          </label>
        </div>
        <div class="setting-row">
          <span>Tamna tema</span>
          <label class="toggle">
            <input type="checkbox" :checked="isDark" @change="toggleTheme" />
            <span class="toggle-track"/>
          </label>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title" style="margin-bottom:12px">Moje aktivnosti</div>
      <div class="stat-row">
        <div class="stat-box">
          <div class="stat-num">{{ stats.total }}</div>
          <div class="stat-label">Ukupno termina</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">{{ stats.thisMonth }}</div>
          <div class="stat-label">Ovaj mjesec</div>
        </div>
      </div>
    </div>

    <button class="btn-logout" @click="handleLogout">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Odjavi se
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSlotsStore } from '@/stores/slots'

const auth = useAuthStore()
const slotsStore = useSlotsStore()
const router = useRouter()
const emailNotifs = ref(true)
const pushNotifs = ref(false)
const isDark = ref(false)
const stats = ref({ total: 0, thisMonth: 0 })

onMounted(async () => {
  // Učitaj temu
  const saved = localStorage.getItem('theme') || 'light'
  isDark.value = saved === 'dark'
  document.documentElement.setAttribute('data-theme', saved)

  // Učitaj statistiku
  const res = await slotsStore.fetchMyReservations(auth.user.uid)
  const thisMonth = new Date().toISOString().slice(0, 7)
  stats.value = {
    total: res.length,
    thisMonth: res.filter(r => r.date.startsWith(thisMonth)).length
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.profil-hero { text-align: center; padding: 28px; }
.profil-avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--blue); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 900; margin: 0 auto 12px;
}
.profil-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
.profil-email { font-size: 13px; color: var(--muted); }

.section-title { font-size: 15px; font-weight: 700; }
.settings-list { display: flex; flex-direction: column; }
.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px;
}
.setting-row:last-child { border-bottom: none; }

.toggle { position: relative; display: inline-block; width: 40px; height: 22px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-track {
  position: absolute; inset: 0; background: #ddd; border-radius: 22px; cursor: pointer; transition: 0.2s;
}
.toggle-track::before {
  content: ''; position: absolute; left: 3px; top: 3px;
  width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.2s;
}
.toggle input:checked + .toggle-track { background: var(--blue); }
.toggle input:checked + .toggle-track::before { transform: translateX(18px); }

.stat-row { display: flex; gap: 12px; }
.stat-box {
  flex: 1; text-align: center; background: var(--bg);
  border-radius: 10px; padding: 16px;
}
.stat-num { font-size: 28px; font-weight: 900; color: var(--blue); }
.stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

.btn-logout {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--red-light); color: var(--red);
  border: none; border-radius: 12px; padding: 14px;
  font-size: 14px; font-weight: 700; cursor: pointer; width: 100%;
  transition: background 0.15s;
}
.btn-logout:hover { background: #ffc5c5; }
</style>
