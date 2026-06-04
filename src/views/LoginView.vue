<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <div class="logo-icon">DG</div>
        <div>
          <div class="logo-name">dormGym</div>
          <div class="logo-sub">Rezervacijski sustav</div>
        </div>
      </div>

      <h1 class="login-title">{{ isRegister ? 'Registracija' : 'Prijava u dormGym' }}</h1>
      <p class="login-desc">
        {{ isRegister ? 'Kreiraj novi račun' : 'Dobrodošao natrag! Prijavi se za nastavak.' }}
      </p>

      <!-- Quick fill for saved emails -->
      <div v-if="!isRegister && savedEmails.length > 0" class="saved-emails">
        <button v-for="saved in savedEmails" :key="saved" type="button" class="email-btn" @click="quickFill(saved)">
          {{ saved }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="isRegister" class="field">
          <label>Ime i prezime</label>
          <input v-model="name" type="text" placeholder="Marko Marković" required />
        </div>
        <div class="field">
          <label>Email adresa</label>
          <input v-model="email" type="email" placeholder="marko@example.com" required />
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

        <div v-if="!isRegister" class="checkbox-field">
          <input v-model="rememberMe" type="checkbox" id="remember" />
          <label for="remember">Zapamti me</label>
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

      <p class="login-footer">© {{ new Date().getFullYear() }} dormGym · Reservations System</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const isRegister = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const showPass = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')
const savedEmails = ref([])

// Učitaj zapamćene emaile pri mountanju
onMounted(() => {
  const saved = localStorage.getItem('dormgym_emails')
  if (saved) {
    savedEmails.value = JSON.parse(saved)
    if (savedEmails.value.length > 0) {
      email.value = savedEmails.value[0]
      rememberMe.value = true
    }
  }
})

function quickFill(savedEmail) {
  email.value = savedEmail
  password.value = ''
  rememberMe.value = true
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    let role
    if (isRegister.value) {
      role = await auth.register(email.value, password.value, name.value)
    } else {
      role = await auth.login(email.value, password.value)
      // Zapamti email ako je checked
      if (rememberMe.value) {
        const saved = JSON.parse(localStorage.getItem('dormgym_emails') || '[]')
        if (!saved.includes(email.value)) {
          saved.unshift(email.value)
        }
        localStorage.setItem('dormgym_emails', JSON.stringify(saved.slice(0, 5)))
      }
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
    'auth/invalid-email-domain': 'Email mora biti @student.unipu.hr ili @scpu.hr',
  }
  return map[code] || 'Došlo je do greške. Pokušaj ponovo.'
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

.saved-emails { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.email-btn {
  background: var(--blue-light);
  border: 1.5px solid var(--blue);
  color: var(--blue);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.email-btn:hover { background: var(--blue); color: #fff; }

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
.pass-wrap { position: relative; }
.pass-wrap input { width: 100%; padding-right: 44px; }
.show-pass {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 16px; cursor: pointer;
}
.checkbox-field {
  display: flex; align-items: center; gap: 8px; margin: 4px 0;
}
.checkbox-field input[type="checkbox"] {
  width: 16px; height: 16px; cursor: pointer;
  accent-color: var(--blue);
}
.checkbox-field label {
  font-size: 13px; color: var(--text); cursor: pointer; margin: 0;
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
