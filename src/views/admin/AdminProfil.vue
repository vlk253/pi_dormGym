<template>
  <div class="page-content">
    <div class="card profil-hero">
      <div class="profil-avatar">{{ auth.profile?.avatarInitials }}</div>
      <div class="profil-name">{{ auth.profile?.name }}</div>
      <div class="profil-email">{{ auth.profile?.email }}</div>
      <span class="badge badge-blue" style="margin-top:8px">Administrator</span>
    </div>

    <div class="card">
      <div class="section-title">Osobni podaci</div>
      <div class="settings-list">
        <div class="setting-row">
          <span>Ime</span>
          <strong>{{ auth.profile?.name }}</strong>
        </div>
        <div class="setting-row">
          <span>Email</span>
          <strong>{{ auth.profile?.email }}</strong>
        </div>
        <div class="setting-row">
          <span>Uloga</span>
          <strong>Admin</strong>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">Upravljanje sustavom</div>
      <div class="settings-list">
        <div class="setting-row">
          <span>Slanje obavijesti studentima</span>
          <span class="badge badge-green">Aktivno</span>
        </div>
        <div class="setting-row">
          <span>Automatski termini</span>
          <label class="toggle">
            <input type="checkbox" v-model="autoSlots" />
            <span class="toggle-track"/>
          </label>
        </div>
        <div class="setting-row">
          <span>Email upozorenja</span>
          <label class="toggle">
            <input type="checkbox" v-model="emailAlert" />
            <span class="toggle-track"/>
          </label>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const autoSlots = ref(true)
const emailAlert = ref(true)

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.profil-hero { text-align: center; padding: 28px; }
.profil-avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: #1a1a2e; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 900; margin: 0 auto 12px;
}
.profil-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
.profil-email { font-size: 13px; color: var(--muted); }

.section-title { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
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
.toggle input:checked + .toggle-track { background: #1a1a2e; }
.toggle input:checked + .toggle-track::before { transform: translateX(18px); }

.btn-logout {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--red-light); color: var(--red);
  border: none; border-radius: 12px; padding: 14px;
  font-size: 14px; font-weight: 700; cursor: pointer; width: 100%;
  transition: background 0.15s;
}
.btn-logout:hover { background: #ffc5c5; }
</style>
