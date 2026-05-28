<template>
  <div class="login-page">
    <div class="login-card">

      <!-- Logo -->
      <header class="login-header">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8h3M17 8h3M7 8v8M17 8v8M7 12h10M4 16h3M17 16h3" stroke="#1a6fd4" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <span class="logo-text">DormGym</span>
        </div>
        <p class="logo-subtitle">Vaša destinacija za snagu i zdravlje u domu.</p>
      </header>

      <!-- Gym Image with Status -->
      <div class="gym-preview">
        <div class="gym-image-wrap">
          <div class="gym-image-placeholder">
            <div class="gym-rack-visual">
              <div class="rack-bar"></div>
              <div class="rack-post left"></div>
              <div class="rack-post right"></div>
              <div class="rack-weights">
                <div class="weight"></div>
                <div class="weight sm"></div>
                <div class="weight"></div>
              </div>
            </div>
            <div class="gym-floor"></div>
          </div>
        </div>
        <div class="status-bar">
          <span class="status-label">TRENUTNI STATUS</span>
          <div class="status-value">
            <span class="status-dot" :class="gymOpen ? 'open' : 'closed'"></span>
            <span>{{ gymOpen ? 'Teretana je otvorena' : 'Teretana je zatvorena' }}</span>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <div class="login-form-section">
        <!-- Info message: tab selection hidden (handled by backend) -->
        <p class="role-info">
          Tip prijave određuje se automatski prema vašim pristupnim podacima.
        </p>

        <form class="login-form" @submit.prevent="handleLogin" novalidate>
          <!-- Email -->
          <div class="field-group">
            <label class="field-label">SLUŽBENI EMAIL</label>
            <div class="input-wrap" :class="{ error: fieldErrors.email }">
              <span class="input-icon">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9z" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M2.5 6l7.5 5 7.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </span>
              <input
                v-model="form.email"
                type="email"
                placeholder="ime.prezime@sczg.hr"
                autocomplete="email"
                @input="clearFieldError('email')"
                :disabled="auth.isLoading"
              />
            </div>
            <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
          </div>

          <!-- Password -->
          <div class="field-group">
            <label class="field-label">LOZINKA</label>
            <div class="input-wrap" :class="{ error: fieldErrors.password }">
              <span class="input-icon">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="10" cy="13" r="1.2" fill="currentColor"/>
                </svg>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                @input="clearFieldError('password')"
                :disabled="auth.isLoading"
              />
              <button
                type="button"
                class="toggle-pw"
                @click="showPassword = !showPassword"
                tabindex="-1"
                :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
              >
                <svg v-if="!showPassword" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="none">
                  <path d="M3 3l14 14M8.6 8.6A2.5 2.5 0 0012.4 12.4M6 6C3.9 7.4 2.4 9.5 2 10c1.2 2.7 4.5 6 8 6 1.4 0 2.7-.4 3.8-1.1M14.5 14.5C16.3 13.1 17.7 11.1 18 10c-1.2-2.7-4.5-6-8-6-.7 0-1.4.1-2 .3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
          </div>

          <!-- API Error -->
          <transition name="shake">
            <div v-if="auth.error" class="api-error">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 6v5M10 13.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              {{ auth.error }}
            </div>
          </transition>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-login"
            :class="{ loading: auth.isLoading }"
            :disabled="auth.isLoading"
          >
            <span v-if="!auth.isLoading" class="btn-content">
              Prijavi se
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span v-else class="btn-spinner">
              <svg class="spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40" stroke-dashoffset="10"/>
              </svg>
              Prijava u tijeku...
            </span>
          </button>
        </form>
      </div>

      <!-- Footer link -->
      <div class="footer-link">
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 9v6M10 6.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <a href="#">Upute za nove korisnike</a>
      </div>

      <!-- System label -->
      <div class="system-label">DORMGYM SUSTAV UPRAVLJANJA V2.4</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const gymOpen = ref(true)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const fieldErrors = reactive({
  email: '',
  password: ''
})

function clearFieldError(field) {
  fieldErrors[field] = ''
  auth.clearError()
}

function validate() {
  let valid = true

  if (!form.email.trim()) {
    fieldErrors.email = 'Email je obavezan.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = 'Unesite valjanu email adresu.'
    valid = false
  }

  if (!form.password.trim()) {
    fieldErrors.password = 'Lozinka je obavezna.'
    valid = false
  } else if (form.password.length < 6) {
    fieldErrors.password = 'Lozinka mora imati najmanje 6 znakova.'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validate()) return

  const result = await auth.login(form.email, form.password)

  if (result.success) {
    // Backend je vratio role — router guard preusmjerava na pravo sučelje
    if (result.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/student')
    }
  }
}

onMounted(() => {
  // Provjeri status teretane - može se dovući s API-ja
  // gymOpen.value = await fetchGymStatus()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--gray-bg);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.login-header {
  text-align: center;
  padding: 32px 24px 20px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 28px;
  height: 28px;
}

.logo-text {
  font-size: 26px;
  font-weight: 700;
  color: var(--blue-primary);
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: 13.5px;
  color: var(--gray-text);
  font-weight: 400;
}

/* ── Gym Preview ── */
.gym-preview {
  margin: 0 20px 4px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--gray-border);
}

.gym-image-wrap {
  height: 160px;
  background: linear-gradient(160deg, #0d1b2e 0%, #122640 40%, #0e2236 70%, #0a1a2e 100%);
  position: relative;
  overflow: hidden;
}

/* Stylized gym visual */
.gym-image-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.gym-rack-visual {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 90px;
}

.rack-bar {
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 8px;
  background: linear-gradient(90deg, #2a4a7a, #4a7ab8, #2a4a7a);
  border-radius: 4px;
  box-shadow: 0 0 12px rgba(74, 122, 184, 0.6);
}

.rack-post {
  position: absolute;
  top: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, #3a6090, #1a3a5c);
  border-radius: 3px;
}

.rack-post.left { left: 10%; }
.rack-post.right { right: 10%; }

.rack-weights {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

.weight {
  width: 18px;
  height: 30px;
  background: linear-gradient(180deg, #2a4a6a, #1a2a3a);
  border-radius: 3px;
  border: 1px solid #3a5a7a;
}

.weight.sm {
  height: 20px;
  width: 12px;
}

.gym-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(180deg, #1a2a3a, #0d1520);
}

/* Ambient light effect */
.gym-image-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%, rgba(26,111,212,0.18) 0%, transparent 70%);
  pointer-events: none;
}

.status-bar {
  background: var(--white);
  padding: 10px 16px 12px;
}

.status-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: var(--blue-primary);
  margin-bottom: 4px;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-dark);
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.open {
  background: var(--green);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  animation: pulse 2s infinite;
}

.status-dot.closed {
  background: var(--error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2); }
  50% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.1); }
}

/* ── Form Section ── */
.login-form-section {
  padding: 20px 24px 0;
}

.role-info {
  font-size: 12px;
  color: var(--gray-text);
  background: var(--blue-light);
  border: 1px solid rgba(26, 111, 212, 0.15);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  margin-bottom: 18px;
  text-align: center;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.7px;
  color: var(--gray-text);
}

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm);
  background: var(--white);
  transition: border-color 0.18s, box-shadow 0.18s;
  overflow: hidden;
}

.input-wrap:focus-within {
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.1);
}

.input-wrap.error {
  border-color: var(--error);
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: var(--gray-text);
  flex-shrink: 0;
}

.input-icon svg {
  width: 17px;
  height: 17px;
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 12px 12px 0;
  font-size: 14.5px;
  color: var(--gray-dark);
  background: transparent;
  min-width: 0;
}

.input-wrap input::placeholder {
  color: #b0bec5;
}

.input-wrap input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-pw {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 12px;
  color: var(--gray-text);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.15s;
}

.toggle-pw:hover { color: var(--blue-primary); }

.toggle-pw svg {
  width: 17px;
  height: 17px;
}

.field-error {
  font-size: 11.5px;
  color: var(--error);
  padding-left: 2px;
}

/* API Error */
.api-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  color: #b91c1c;
}

.api-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Login Button */
.btn-login {
  width: 100%;
  padding: 13px 20px;
  background: linear-gradient(135deg, var(--blue-primary) 0%, var(--blue-dark) 100%);
  color: var(--white);
  border: none;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  box-shadow: 0 4px 14px rgba(26, 111, 212, 0.4);
  margin-top: 4px;
  margin-bottom: 4px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(26, 111, 212, 0.5);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-content svg {
  width: 18px;
  height: 18px;
}

.btn-spinner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spin {
  width: 20px;
  height: 20px;
  animation: spin 0.8s linear infinite;
  opacity: 0.9;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Shake animation for errors */
.shake-enter-active {
  animation: shake 0.35s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* ── Footer ── */
.footer-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 24px 8px;
  font-size: 13px;
  color: var(--blue-primary);
}

.footer-link svg {
  width: 15px;
  height: 15px;
}

.footer-link a:hover {
  text-decoration: underline;
}

.system-label {
  text-align: center;
  font-size: 10px;
  letter-spacing: 1px;
  color: #b0bec5;
  padding: 8px 24px 20px;
  font-weight: 500;
}
</style>
