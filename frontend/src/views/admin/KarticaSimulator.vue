<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Simulator Kartice</h1>
      <p class="page-desc">Simulacija RFID čitača kartica studentskog doma. U produkciji bi čitač slao HTTP request automatski.</p>
    </div>

    <!-- Unos kartice -->
    <div class="card scanner-card">
      <div class="scanner-icon" :class="statusClass">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
          <line x1="6" y1="15" x2="10" y2="15"/>
          <line x1="6" y1="15" x2="10" y2="15"/>
          <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      <div class="scanner-body">
        <label class="field-label">KOD KARTICE</label>
        <div class="input-row">
          <input
            v-model="karticaKod"
            class="kod-input"
            placeholder="npr. A214"
            @keyup.enter="provjeriPristup"
            :disabled="checking"
          />
          <button class="btn-scan" @click="provjeriPristup" :disabled="checking || !karticaKod">
            {{ checking ? 'Provjera...' : 'Skeniraj' }}
          </button>
        </div>
        <p class="input-hint">Format: [Paviljon][Soba] — npr. <strong>A214</strong>, <strong>B103</strong></p>
      </div>
    </div>

    <!-- Rezultat -->
    <transition name="fade">
      <div v-if="result" class="card result-card" :class="result.access ? 'result-allow' : 'result-deny'">
        <div class="result-icon">{{ result.access ? '✓' : '✗' }}</div>
        <div class="result-body">
          <div class="result-status">{{ result.access ? 'PRISTUP DOZVOLJEN' : 'PRISTUP ODBIJEN' }}</div>
          <div class="result-name">{{ result.name }}</div>
          <div class="result-detail">{{ result.detail }}</div>
        </div>
        <div v-if="result.access" class="result-slot">
          <span class="slot-badge">{{ result.slotTime }}</span>
        </div>
      </div>
    </transition>

    <!-- Log pristupa -->
    <div class="card">
      <div class="card-title">Log Pristupa</div>
      <div v-if="log.length === 0" class="empty-row">Nema zabilježenih pristupa.</div>
      <div v-else class="log-list">
        <div v-for="(entry, i) in log" :key="i" class="log-row">
          <span class="log-dot" :class="entry.access ? 'dot-green' : 'dot-red'" />
          <div class="log-info">
            <span class="log-name">{{ entry.name }}</span>
            <span class="log-detail">{{ entry.detail }}</span>
          </div>
          <span class="log-time">{{ entry.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'

const karticaKod = ref('')
const checking = ref(false)
const result = ref(null)
const log = ref([])

const statusClass = ref('')

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function nowTime() {
  const d = new Date()
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0')
}

async function provjeriPristup() {
  if (!karticaKod.value) return
  checking.value = true
  result.value = null
  statusClass.value = ''

  try {
    const kod = karticaKod.value.trim().toUpperCase()
    const paviljon = kod[0]
    const soba = kod.slice(1)

    if (!paviljon || !soba) {
      result.value = { access: false, name: 'Nepoznata kartica', detail: 'Neispravan format koda.', time: nowTime() }
      statusClass.value = 'icon-deny'
      logEntry(result.value)
      return
    }

    // Pronađi usera po paviljonu i sobi
    const userQ = query(
      collection(db, 'users'),
      where('paviljon', '==', paviljon),
      where('soba', '==', soba)
    )
    const userSnap = await getDocs(userQ)

    if (userSnap.empty) {
      result.value = { access: false, name: `Kartica: ${kod}`, detail: 'Student nije pronađen u sustavu.', time: nowTime() }
      statusClass.value = 'icon-deny'
      logEntry(result.value)
      return
    }

    const userDoc = userSnap.docs[0]
    const user = userDoc.data()
    const uid = userDoc.id

    // Provjeri je li approved
    if (!user.approved) {
      result.value = { access: false, name: user.name, detail: 'Korisnički račun nije odobren.', time: nowTime() }
      statusClass.value = 'icon-deny'
      logEntry(result.value)
      return
    }

    // Provjeri termin ±15 minuta
    const today = formatLocalDate(new Date())
    const slotsQ = query(
      collection(db, 'slots'),
      where('date', '==', today),
      where('enrolled', 'array-contains', uid)
    )
    const slotsSnap = await getDocs(slotsQ)

    if (slotsSnap.empty) {
      result.value = { access: false, name: user.name, detail: 'Nema rezervacije za danas.', time: nowTime() }
      statusClass.value = 'icon-deny'
      logEntry(result.value)
      return
    }

    const now = new Date()
    let matchedSlot = null

    for (const doc of slotsSnap.docs) {
      const { startTime, endTime } = doc.data()
      const [sh, sm] = startTime.split(':').map(Number)
      const slotStart = new Date()
      slotStart.setHours(sh, sm, 0, 0)
      const diffMin = (now - slotStart) / 60000

      if (diffMin >= -15 && diffMin <= 75) {
        matchedSlot = { startTime, endTime }
        break
      }
    }

    if (!matchedSlot) {
      result.value = { access: false, name: user.name, detail: 'Rezervacija postoji, ali nije u rasponu ±15 min od početka termina.', time: nowTime() }
      statusClass.value = 'icon-deny'
      logEntry(result.value)
      return
    }

    result.value = {
      access: true,
      name: user.name,
      detail: `Paviljon ${user.paviljon}, soba ${user.soba}`,
      slotTime: `${matchedSlot.startTime}–${matchedSlot.endTime}`,
      time: nowTime()
    }
    statusClass.value = 'icon-allow'
    logEntry(result.value)

  } catch (err) {
    console.error('Greška pri provjeri pristupa:', err)
    result.value = { access: false, name: '—', detail: 'Greška pri provjeri. Pokušaj ponovo.', time: nowTime() }
  } finally {
    checking.value = false
  }
}

function logEntry(entry) {
  log.value.unshift({ ...entry, time: nowTime() })
  if (log.value.length > 20) log.value.pop()
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 900; color: var(--text); margin: 0 0 4px; }
.page-desc { font-size: 12px; color: var(--muted); margin: 0; }

.scanner-card { display: flex; align-items: center; gap: 20px; }
.scanner-icon {
  width: 72px; height: 72px; border-radius: 16px;
  background: var(--bg); display: flex; align-items: center; justify-content: center;
  color: var(--muted); flex-shrink: 0; transition: background 0.3s, color 0.3s;
}
.scanner-icon.icon-allow { background: #e6f9f0; color: #22c55e; }
.scanner-icon.icon-deny { background: #fdecea; color: var(--red); }

.scanner-body { flex: 1; }
.field-label { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; color: var(--muted); text-transform: uppercase; display: block; margin-bottom: 8px; }
.input-row { display: flex; gap: 8px; }
.kod-input {
  flex: 1; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 10px 14px; font-size: 18px; font-weight: 700; letter-spacing: 0.1em;
  background: var(--bg); color: var(--text); outline: none; text-transform: uppercase;
}
.kod-input:focus { border-color: var(--blue); }
.btn-scan {
  background: var(--blue); color: #fff; border: none; border-radius: 10px;
  padding: 10px 20px; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: opacity 0.2s;
}
.btn-scan:disabled { opacity: 0.5; cursor: not-allowed; }
.input-hint { font-size: 11px; color: var(--muted); margin: 6px 0 0; }

/* Result card */
.result-card { display: flex; align-items: center; gap: 16px; border-left: 4px solid; }
.result-allow { border-color: #22c55e; background: #f0fdf4; }
.result-deny { border-color: var(--red); background: #fef2f2; }
.result-icon { font-size: 32px; font-weight: 900; width: 44px; text-align: center; flex-shrink: 0; }
.result-allow .result-icon { color: #22c55e; }
.result-deny .result-icon { color: var(--red); }
.result-body { flex: 1; }
.result-status { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
.result-allow .result-status { color: #16a34a; }
.result-deny .result-status { color: var(--red); }
.result-name { font-size: 16px; font-weight: 800; color: var(--text); }
.result-detail { font-size: 12px; color: var(--muted); margin-top: 2px; }
.slot-badge {
  background: #22c55e; color: #fff; border-radius: 8px;
  padding: 4px 10px; font-size: 12px; font-weight: 700; white-space: nowrap;
}

/* Log */
.card-title { font-size: 15px; font-weight: 700; margin-bottom: 14px; }
.log-list { display: flex; flex-direction: column; gap: 8px; }
.log-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.log-row:last-child { border-bottom: none; }
.log-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-green { background: #22c55e; }
.dot-red { background: var(--red); }
.log-info { flex: 1; display: flex; flex-direction: column; }
.log-name { font-size: 13px; font-weight: 700; color: var(--text); }
.log-detail { font-size: 11px; color: var(--muted); }
.log-time { font-size: 11px; color: var(--muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
.empty-row { font-size: 13px; color: #ccc; text-align: center; padding: 12px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
