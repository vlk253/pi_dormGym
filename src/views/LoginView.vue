<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <div class="logo-icon">DG</div>
        <div>
          <div class="logo-name">DoreGym</div>
          <div class="logo-sub">Rezervacijski sustav</div>
        </div>
      </div>

      <h1 class="login-title">{{ isRegister ? 'Registracija' : 'Prijava u DormGym' }}</h1>
      <p class="login-desc">
        {{ isRegister ? 'Kreiraj novi račun' : 'Dobrodošao natrag! Prijavi se za nastavak.' }}
      </p>

      <div v-if="isRegister" class="register-info">
        <div class="info-item">📧 @scpu.hr → 👨‍💼 Admin</div>
        <div class="info-item">📧 @student.unipu.hr → 👨‍🎓 Student</div>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="isRegister" class="field">
          <label>Ime i prezime</label>
          <input v-model="name" type="text" placeholder="Marko Marković" required />
        </div>
        <div class="field">
          <label>Email adresa</label>
          <input v-model="email" type="email" placeholder="marko@example.com" required />
          <div v-if="isRegister && email" class="email-hint">
            <span v-if="getRoleHint()" class="role-badge">{{ getRoleHint() }}</span>
            <span v-else class="role-default">Zadana uloga: Student</span>
          </div>
        </div>
        <div class="field">
          <label>Lozinka</label>
          <div class="pass-wrap">
            <input v-model="password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" required />
            <button type="button" class="show-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="btn-spinner" />
          <span v-else>{{ isRegister ? 'Registriraj se' : 'Prijavi se' }}</span>
        </button>
      </form>

      <button class="toggle-mode" @click="isRegister = !isRegister">
        {{ isRegister ? 'Već imaš račun? Prijavi se' : 'Nemaš račun? Registriraj se' }}
      </button>

      <p class="login-footer">© {{ new Date().getFullYear() }} DoreGym · Reservations System</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const isRegister = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    let role
    if (isRegister.value) {
      role = await auth.register(email.value, password.value, name.value)
    } else {
      role = await auth.login(email.value, password.value)
    }
    router.push(role === 'admin' ? '/admin' : '/student')
  } catch (e) {
    error.value = mapFirebaseError(e.code)
  } finally {
    loading.value = false
  }
}

function mapFirebaseError(code) {
  const map = {
    'auth/user-not-found': 'Korisnik ne postoji.',
    'auth/wrong-password': 'Pogrešna lozinka.',
    'auth/email-already-in-use': 'Email je već registriran.',
    'auth/weak-password': 'Lozinka mora imati najmanje 6 znakova.',
    'auth/invalid-email': 'Nevažeći email format.',
    'auth/invalid-credential': 'Pogrešni podaci za prijavu.',
    'auth/profile-not-found': 'Greška pri učitavanju profila korisnika. Osvježi stranicu ili pokušaj ponovno.',
  }
  return map[code] || 'Došlo je do greške. Pokušaj ponovo.'
}

function getRoleHint() {
  const domain = email.value.split('@')[1]?.toLowerCase()
  if (domain === 'scpu.hr') return '👨‍💼 Admin'
  if (domain === 'student.unipu.hr') return '👨‍🎓 Student'
  return ''
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0f1e 0%, #1a2550 100%);
  padding: 20px;
}
.login-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px 28px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.login-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.logo-icon {
  width: 44px; height: 44px;
  background: var(--blue);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 16px; color: #fff;
}
.logo-name { font-size: 18px; font-weight: 800; color: var(--text); }
.logo-sub { font-size: 12px; color: var(--muted); }

.login-title { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
.login-desc { font-size: 13px; color: var(--muted); margin-bottom: 24px; }

.register-info {
  background: #f0f4ff;
  border-left: 3px solid var(--blue);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-item {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.login-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; font-weight: 700; color: var(--muted); letter-spacing: 0.5px; }
.field input {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: var(--blue); }
.email-hint {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; margin-top: 4px;
}
.role-badge {
  background: linear-gradient(135deg, var(--blue), #4f8eff);
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11px;
}
.role-default {
  color: var(--muted);
  font-size: 11px;
  font-style: italic;
}
.pass-wrap { position: relative; }
.pass-wrap input { width: 100%; padding-right: 44px; }
.show-pass {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 16px; cursor: pointer;
}
.btn-spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.toggle-mode {
  display: block; width: 100%; background: none; border: none;
  color: var(--blue); font-size: 13px; font-weight: 600;
  cursor: pointer; text-align: center; padding: 4px;
}
.toggle-mode:hover { text-decoration: underline; }
.login-footer {
  text-align: center; font-size: 11px; color: #ccc; margin-top: 20px;
}
</style>
