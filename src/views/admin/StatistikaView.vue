<template>
  <div class="page-content">
    <!-- Summary cards -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon blue">👥</div>
        <div class="stat-val">{{ stats.totalStudents }}</div>
        <div class="stat-lbl">Ukupno studenata</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon green">📅</div>
        <div class="stat-val">{{ stats.totalReservations }}</div>
        <div class="stat-lbl">Rezervacija danas</div>
      </div>
    </div>

    <!-- Popunjenost po terminu -->
    <div class="card">
      <div class="card-title">Dnevna popunjenost termina</div>
      <div class="bar-chart">
        <div v-for="slot in todaySlots" :key="slot.id" class="bar-row">
          <div class="bar-label">{{ slot.startTime }}</div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: fillPct(slot) + '%',
                background: fillColor(slot)
              }"
            />
          </div>
          <div class="bar-count">{{ slot.enrolled.length }}/{{ slot.capacity }}</div>
        </div>
      </div>
    </div>

    <!-- Trenutno prijavljeni studenti -->
    <div class="card">
      <div class="card-title">Trenutno prijavljeni studenti</div>
      <div v-if="loadingStudents" class="center-spinner"><div class="spinner"/></div>
      <div v-else class="student-list">
        <div v-for="s in enrolledStudents" :key="s.uid" class="student-row">
          <div class="student-avatar">{{ s.initials }}</div>
          <div class="student-info">
            <div class="student-name">{{ s.name }}</div>
            <div class="student-email">{{ s.email }}</div>
          </div>
          <span class="badge badge-blue">{{ s.slotTime }}</span>
        </div>
        <div v-if="enrolledStudents.length === 0" class="empty-row">Nema prijavljenih za danas.</div>
      </div>
    </div>

    <!-- Tjedna statistika (mock chart) -->
    <div class="card">
      <div class="card-title">Tjedna statistika</div>
      <div class="week-chart">
        <div v-for="day in weekData" :key="day.label" class="week-bar-wrap">
          <div class="week-bar-col">
            <div
              class="week-bar"
              :style="{ height: day.pct + '%', background: day.pct > 70 ? 'var(--blue)' : '#c7d4fc' }"
            />
          </div>
          <div class="week-label">{{ day.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSlotsStore } from '@/stores/slots'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

const slotsStore = useSlotsStore()
const todaySlots = ref([])
const loadingStudents = ref(true)
const enrolledStudents = ref([])

const today = new Date().toISOString().split('T')[0]

const stats = ref({ totalStudents: 0, totalReservations: 0 })
let refreshInterval = null
let users = []

// Mock week data
const weekData = [
  { label: 'Pon', pct: 80 },
  { label: 'Uto', pct: 55 },
  { label: 'Sri', pct: 90 },
  { label: 'Čet', pct: 40 },
  { label: 'Pet', pct: 75 },
  { label: 'Sub', pct: 60 },
  { label: 'Ned', pct: 20 },
]

function fillPct(slot) { return Math.min((slot.enrolled.length / slot.capacity) * 100, 100) }
function fillColor(slot) {
  const p = fillPct(slot)
  if (p >= 90) return 'var(--red)'
  if (p >= 60) return 'var(--orange)'
  return 'var(--green)'
}

function updateStudentData() {
  todaySlots.value = slotsStore.slots
  const allEnrolled = slotsStore.slots.flatMap(slot =>
    slot.enrolled.map(uid => ({ uid, slotTime: `${slot.startTime}–${slot.endTime}` }))
  )
  stats.value.totalReservations = allEnrolled.length

  enrolledStudents.value = allEnrolled.map(e => {
    const u = users.find(u => u.uid === e.uid)
    return {
      uid: e.uid,
      name: u?.name || 'Nepoznat',
      email: u?.email || '',
      initials: u?.avatarInitials || '?',
      slotTime: e.slotTime
    }
  })
  loadingStudents.value = false
}

onMounted(async () => {
  try {
    // Fetch all users once
    const usersSnap = await getDocs(collection(db, 'users'))
    users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }))
    stats.value.totalStudents = users.filter(u => u.role === 'student').length

    // Start listening to today's slots
    slotsStore.listenToDate(today)

    // Refresh student data every 500ms
    refreshInterval = setInterval(updateStudentData, 500)
  } catch (err) {
    console.error('StatistikaView mounted error:', err)
    loadingStudents.value = false
  }
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  slotsStore.stopListening()
})
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-card { text-align: center; padding: 20px 12px; }
.stat-icon { font-size: 28px; margin-bottom: 8px; }
.stat-val { font-size: 32px; font-weight: 900; color: var(--text); }
.stat-lbl { font-size: 11px; color: var(--muted); margin-top: 4px; }

.card-title { font-size: 15px; font-weight: 700; margin-bottom: 14px; }

.bar-chart { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-label { font-size: 12px; font-weight: 700; color: var(--muted); width: 36px; flex-shrink: 0; }
.bar-track { flex: 1; height: 8px; background: var(--bg); border-radius: 8px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 8px; transition: width 0.5s; }
.bar-count { font-size: 11px; color: var(--muted); width: 40px; text-align: right; flex-shrink: 0; }

.center-spinner { display: flex; justify-content: center; padding: 24px; }
.student-list { display: flex; flex-direction: column; gap: 10px; }
.student-row { display: flex; align-items: center; gap: 10px; }
.student-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--blue-light); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; flex-shrink: 0;
}
.student-info { flex: 1; }
.student-name { font-size: 13px; font-weight: 700; }
.student-email { font-size: 11px; color: var(--muted); }
.empty-row { font-size: 13px; color: #ccc; text-align: center; padding: 12px; }

.week-chart {
  display: flex; gap: 8px; align-items: flex-end;
  height: 100px; padding: 0 4px;
}
.week-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
.week-bar-col { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.week-bar {
  width: 100%; border-radius: 4px 4px 0 0;
  min-height: 4px; transition: height 0.4s;
}
.week-label { font-size: 10px; font-weight: 700; color: var(--muted); }
</style>
