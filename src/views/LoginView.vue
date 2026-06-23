<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <div class="logo-icon">DG</div>
        <div>
          <div class="logo-name">DormGym</div>
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
        <!-- Ime i prezime -->
        <div v-if="isRegister" class="field">
          <label>Ime i prezime</label>
          <input v-model="name" type="text" placeholder="Marko Marković" required />
        </div>

        <!-- Email -->
        <div class="field">
          <label>Email adresa</label>
          <input v-model="email" type="email" placeholder="marko@example.com" required />
          <div v-if="isRegister && email" class="email-hint">
            <span v-if="getRoleHint()" class="role-badge">{{ getRoleHint() }}</span>
            <span v-else class="role-default">Zadana uloga: Student</span>
          </div>
        </div>

        <!-- SCPU: identifikacijski broj ustanove -->
        <div v-if="isRegister && emailDomain === 'scpu.hr'" class="field">
          <label>Identifikacijski broj ustanove</label>
          <input v-model="ustanovaId" type="text" placeholder="npr. SCPU-2024-001" required />
        </div>

        <!-- Student: paviljon i soba -->
        <template v-if="isRegister && emailDomain === 'student.unipu.hr'">
          <div class="field">
            <label>Paviljon</label>
            <select v-model="paviljon" required class="field-select">
              <option value="" disabled>Odaberi paviljon</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>
          <div class="field">
            <label>Broj sobe</label>
            <input
              v-model="soba"
              type="text"
              placeholder="npr. 214"
              pattern="^\d{3}$"
              maxlength="3"
              required
            />
            <span class="field-hint">Format: 001 – 450</span>
          </div>
        </template>

        <!-- Lozinka -->
        <div class="field">
          <label>Lozinka</label>
          <div class="pass-wrap">
            <input v-model="password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" required />
            <button type="button" class="show-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="field remember-field">
          <label>
            <input type="checkbox" v-model="rememberMe" /> Zapamti email i lozinku
          </label>
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

      <p class="login-footer">© {{ new Date().getFullYear() }} DormGym · Reservations System</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const STORAGE_KEY = 'dormgym-credentials'
const isRegister = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const ustanovaId = ref('')
const paviljon = ref('')
const soba = ref('')
const rememberMe = ref(false)
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

const emailDomain = computed(() => email.value.split('@')[1]?.toLowerCase() ?? '')

function loadSavedCredentials() {
  if (typeof window === 'undefined') return
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const creds = JSON.parse(saved)
    email.value = creds.email || ''
    password.value = creds.password || ''
    rememberMe.value = !!creds.email && !!creds.password
  } catch (err) {
    console.warn('Ne mogu učitati spremljene kredencijale:', err)
  }
}

function saveCredentials() {
  if (typeof window === 'undefined') return
  if (!rememberMe.value) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    email: email.value,
    password: password.value
  }))
}

onMounted(() => loadSavedCredentials())

async function handleSubmit() {
  error.value = ''
  // Provjera domene pri registraciji
  if (isRegister.value && !['scpu.hr', 'student.unipu.hr'].includes(emailDomain.value)) {
    error.value = 'Registracija je dozvoljena samo za @scpu.hr i @student.unipu.hr email adrese.'
    return
  }

  // Validacija paviljona i sobe
  if (isRegister.value && emailDomain.value === 'student.unipu.hr') {
    if (!['A', 'B', 'C'].includes(paviljon.value)) {
      error.value = 'Paviljon mora biti A, B ili C.'
      return
    }
    const sobaNum = parseInt(soba.value)
    if (!/^\d{3}$/.test(soba.value) || sobaNum < 1 || sobaNum > 450) {
      error.value = 'Broj sobe mora biti u formatu 001–450.'
      return
    }
  }

  loading.value = true
  try {
    let role
    if (isRegister.value) {
      role = await auth.register(email.value, password.value, name.value, {
        ustanovaId: ustanovaId.value,
        paviljon: paviljon.value,
        soba: soba.value
      })
    } else {
      role = await auth.login(email.value, password.value)
    }
    saveCredentials()
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
.info-item { font-size: 12px; color: #333; font-weight: 500; }

.login-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; font-weight: 700; color: var(--muted); letter-spacing: 0.5px; }
.field input, .field-select {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.field input:focus, .field-select:focus { border-color: var(--blue); }
.field-select { background: #fff; color: var(--text); cursor: pointer; }
.field-hint { font-size: 11px; color: var(--muted); }

.email-hint { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-top: 4px; }
.role-badge {
  background: linear-gradient(135deg, var(--blue), #4f8eff);
  color: #fff; padding: 4px 10px; border-radius: 6px;
  font-weight: 700; font-size: 11px;
}
.role-default { color: var(--muted); font-size: 11px; font-style: italic; }

.remember-field {
  margin-top: 6px;
  width: 100%;
}
  .remember-field label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

.pass-wrap { position: relative; }
.pass-wrap input { width: 100%; padding-right: 44px; box-sizing: border-box; }
.show-pass {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 16px; cursor: pointer;
}
.btn-primary {
  width: 100%; padding: 13px;
  background: var(--blue); color: #fff;
  border: none; border-radius: 10px;
  font-size: 15px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  min-height: 46px;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-msg {
  background: #fff0f0; border: 1px solid #ffcccc;
  color: #cc0000; border-radius: 8px;
  padding: 10px 12px; font-size: 13px;
}
.toggle-mode {
  display: block; width: 100%; background: none; border: none;
  color: var(--blue); font-size: 13px; font-weight: 600;
  cursor: pointer; text-align: center; padding: 4px;
}
.toggle-mode:hover { text-decoration: underline; }
.login-footer { text-align: center; font-size: 11px; color: #ccc; margin-top: 20px; }

[data-theme="dark"] .login-page {
  background: linear-gradient(135deg, #050810 0%, #0d1530 100%);
}
[data-theme="dark"] .login-card {
  background: #1a1d27;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
[data-theme="dark"] .login-title { color: #f0f2ff; }
[data-theme="dark"] .login-desc { color: #8b92a8; }
[data-theme="dark"] .logo-name { color: #f0f2ff; }
[data-theme="dark"] .logo-sub { color: #8b92a8; }
[data-theme="dark"] .register-info { background: #12152a; border-color: var(--blue); }
[data-theme="dark"] .info-item { color: #c0c8e0; }
[data-theme="dark"] .field label { color: #8b92a8; }
[data-theme="dark"] .field input,
[data-theme="dark"] .field-select {
  background: #12152a;
  border-color: #2a2d3a;
  color: #f0f2ff;
}
[data-theme="dark"] .field input::placeholder { color: #4a5068; }
[data-theme="dark"] .field-hint { color: #6b7280; }
[data-theme="dark"] .role-default { color: #6b7280; }
[data-theme="dark"] .remember-field label { color: #8b92a8; }
[data-theme="dark"] .login-footer { color: #4a5068; }
[data-theme="dark"] .toggle-mode { color: #6b9fff; }

</style>
