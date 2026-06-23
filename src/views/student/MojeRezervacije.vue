<template>
  <div class="page-content">
    <div v-if="loading" class="center-spinner"><div class="spinner" /></div>

    <template v-else>
      <!-- Prijava kvara - samo za studente -->
      <div v-if="auth.isStudent" class="report-kvar-section">
        <button class="btn-primary" @click="showKvar = !showKvar" style="margin-bottom:10px">
          {{ showKvar ? 'Zatvori prijavu kvara' : 'Prijavi kvar' }}
        </button>
        <div v-if="showKvar">
          <AktivniKvarovi :studentOnly="true" :studentId="auth.user.uid" />
        </div>
      </div>

      <!-- Rezervacije -->
      <div v-if="reservations.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>Nemaš rezerviranih termina.</p>
        <button class="btn-primary" style="margin-top:12px" @click="router.push('/student/rezervacije')">
          Rezerviraj termin
        </button>
      </div>

      <template v-else>
        <!-- Upcoming -->
        <div class="section-label">Nadolazeći termini</div>
        <div v-if="upcoming.length === 0" class="no-section">Nema nadolazećih termina.</div>
        <div v-for="res in upcoming" :key="res.id" class="res-card upcoming">
          <div class="res-date-col">
            <div class="res-day">{{ formatDay(res.date) }}</div>
            <div class="res-num">{{ formatDateNum(res.date) }}</div>
            <div class="res-month">{{ formatMonth(res.date) }}</div>
          </div>
          <div class="res-body">
            <div class="res-time">{{ res.startTime }} – {{ res.endTime }}</div>
            <div class="res-fill">{{ res.enrolled.length }}/{{ res.capacity }} polaznika</div>
          </div>
          <button class="res-cancel" @click="cancelRes(res)" :disabled="canceling === res.id">
            <span v-if="canceling === res.id" class="btn-spinner-dark"/>
            <span v-else>Odjava</span>
          </button>
        </div>

        <!-- Past -->
        <div class="section-label" style="margin-top:8px">Prošli termini</div>
        <div v-if="past.length === 0" class="no-section">Nema prošlih termina.</div>
        <div v-for="res in past" :key="res.id" class="res-card past">
          <div class="res-date-col muted">
            <div class="res-day">{{ formatDay(res.date) }}</div>
            <div class="res-num">{{ formatDateNum(res.date) }}</div>
            <div class="res-month">{{ formatMonth(res.date) }}</div>
          </div>
          <div class="res-body">
            <div class="res-time muted">{{ res.startTime }} – {{ res.endTime }}</div>
            <div class="res-fill muted">Završeno</div>
          </div>
          <span class="badge badge-green" style="font-size:11px">✓</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSlotsStore } from '@/stores/slots'
import { useAuthStore } from '@/stores/auth'
import AktivniKvarovi from '@/components/AktivniKvarovi.vue'

const slotsStore = useSlotsStore()
const auth = useAuthStore()
const router = useRouter()
const reservations = ref([])
const loading = ref(true)
const canceling = ref(null)
const showKvar = ref(false)

onMounted(async () => {
  reservations.value = await slotsStore.fetchMyReservations(auth.user.uid)
  loading.value = false
})

watch(() => slotsStore.slots.map(s => s.enrolled.join(',')), async () => {
  if (!auth.user?.uid) return
  reservations.value = await slotsStore.fetchMyReservations(auth.user.uid)
})

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = formatLocalDate(new Date())
const upcoming = computed(() => reservations.value.filter(r => r.date >= today))
const past = computed(() => reservations.value.filter(r => r.date < today))

async function cancelRes(res) {
  canceling.value = res.id
  await slotsStore.unenrollSlot(res.id, auth.user.uid)
  reservations.value = await slotsStore.fetchMyReservations(auth.user.uid)
  canceling.value = null
}

function formatDay(dateStr) {
  return new Date(dateStr).toLocaleDateString('hr', { weekday: 'short' })
}
function formatDateNum(dateStr) { return new Date(dateStr).getDate() }
function formatMonth(dateStr) {
  return new Date(dateStr).toLocaleDateString('hr', { month: 'short' })
}
</script>

<style scoped>
.center-spinner { display: flex; justify-content: center; padding: 40px; }
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 48px 20px; color: #bbb; font-size: 14px; text-align: center;
}
.section-label {
  font-size: 11px; font-weight: 800; color: var(--muted);
  letter-spacing: 1px; text-transform: uppercase; padding: 0 2px;
}
.no-section { font-size: 13px; color: #ccc; padding: 8px 2px; }

.res-card {
  background: var(--surface); border-radius: 12px;
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; box-shadow: var(--shadow);
  border-left: 4px solid var(--blue);
  margin-bottom: 10px;
}
.res-card.past { border-left-color: var(--border); }

.res-date-col { text-align: center; min-width: 36px; }
.res-date-col.muted { opacity: 0.45; }
.res-day { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: capitalize; }
.res-num { font-size: 22px; font-weight: 900; color: var(--text); line-height: 1; }
.res-month { font-size: 10px; color: var(--muted); text-transform: capitalize; }

.res-body { flex: 1; }
.res-time { font-size: 15px; font-weight: 800; color: var(--text); }
.res-time.muted { color: var(--muted); }
.res-fill { font-size: 12px; color: var(--muted); margin-top: 2px; }
.res-fill.muted { color: #ccc; }

.res-cancel {
  background: var(--red-light); color: var(--red);
  border: none; border-radius: 8px;
  padding: 7px 12px; font-size: 12px; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
}
.res-cancel:hover { background: #ffc5c5; }
.res-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-spinner-dark {
  display: inline-block; width: 12px; height: 12px;
  border: 2px solid rgba(229,62,62,0.3); border-top-color: var(--red);
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.report-kvar-section { margin: 12px 0; }
</style>
