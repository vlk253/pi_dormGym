<template>
  <div class="page-content">
    <!-- Date picker -->
    <div class="card date-card">
      <div class="date-strip">
        <button
          v-for="d in dateOptions"
          :key="d.value"
          class="date-btn"
          :class="{ active: selectedDate === d.value }"
          @click="selectDate(d.value)"
        >
          <span class="date-day">{{ d.day }}</span>
          <span class="date-num">{{ d.num }}</span>
        </button>
      </div>
    </div>

    <!-- Slots -->
    <div v-if="slotsStore.loading" class="center-spinner">
      <div class="spinner" />
    </div>

    <div v-else-if="slotsStore.slots.length === 0" class="empty-card">
      Nema dostupnih termina za ovaj dan.
    </div>

    <div v-else class="slots-list">
      <div
        v-for="slot in slotsStore.slots"
        :key="slot.id"
        class="slot-card"
        :class="slotStatus(slot)"
      >
        <div class="slot-left">
          <div class="slot-time">{{ slot.startTime }} – {{ slot.endTime }}</div>
          <div class="slot-info">
            <span class="fill-bar-wrap">
              <span class="fill-bar" :style="{ width: fillPct(slot) + '%', background: fillColor(slot) }" />
            </span>
            <span class="slot-count">{{ slot.enrolled.length }}/{{ slot.capacity }} mjesta popunjeno</span>
          </div>
        </div>
        <div class="slot-right">
          <span class="slot-badge" :class="slotStatus(slot)">
            {{ slotStatus(slot) === 'full' ? 'Popunjeno' : slotStatus(slot) === 'enrolled' ? 'Prijavljeno' : 'Slobodno' }}
          </span>
          <button
            class="slot-btn"
            :class="slotStatus(slot)"
            :disabled="slotStatus(slot) === 'full' || actionLoading === slot.id"
            @click="toggleSlot(slot)"
          >
            <span v-if="actionLoading === slot.id" class="btn-spinner" />
            <span v-else-if="slotStatus(slot) === 'enrolled'">Odjavi se</span>
            <span v-else-if="slotStatus(slot) === 'full'">Popunjeno</span>
            <span v-else>Prijavi se</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSlotsStore } from '@/stores/slots'
import { useAuthStore } from '@/stores/auth'

const slotsStore = useSlotsStore()
const auth = useAuthStore()
const actionLoading = ref(null)
const toast = ref(null)

// Build 7-day date strip
const dateOptions = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return {
    value: d.toISOString().split('T')[0],
    day: d.toLocaleDateString('hr', { weekday: 'short' }),
    num: d.getDate()
  }
})
const selectedDate = ref(dateOptions[0].value)

function selectDate(date) {
  selectedDate.value = date
  slotsStore.listenToDate(date)
}

onMounted(() => slotsStore.listenToDate(selectedDate.value))
onUnmounted(() => slotsStore.stopListening())

function slotStatus(slot) {
  if (slot.enrolled.includes(auth.user?.uid)) return 'enrolled'
  if (slot.enrolled.length >= slot.capacity) return 'full'
  return 'free'
}
function fillPct(slot) { return Math.min((slot.enrolled.length / slot.capacity) * 100, 100) }
function fillColor(slot) {
  const p = fillPct(slot)
  if (p >= 90) return 'var(--red)'
  if (p >= 60) return 'var(--orange)'
  return 'var(--green)'
}

async function toggleSlot(slot) {
  actionLoading.value = slot.id
  try {
    if (slotStatus(slot) === 'enrolled') {
      await slotsStore.unenrollSlot(slot.id)
      showToast('Odjavljen si s termina.', 'info')
    } else {
      await slotsStore.enrollSlot(slot.id)
      showToast('Uspješno prijavljen na termin!', 'success')
    }
  } catch (e) {
    showToast('Greška. Pokušaj ponovo.', 'error')
  } finally {
    actionLoading.value = null
  }
}

function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 3000)
}
</script>

<style scoped>
.date-card { padding: 12px 14px; }
.date-strip { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
.date-btn {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 10px; padding: 8px 10px;
  font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer;
  transition: all 0.15s; min-width: 44px;
}
.date-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; }
.date-day { text-transform: capitalize; font-size: 10px; }
.date-num { font-size: 16px; font-weight: 800; }

.center-spinner { display: flex; justify-content: center; padding: 32px; }
.empty-card { text-align: center; color: var(--muted); font-size: 14px; padding: 32px; }

.slots-list { display: flex; flex-direction: column; gap: 10px; }
.slot-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-left: 4px solid var(--border);
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.slot-card.enrolled { border-left-color: var(--blue); }
.slot-card.full { border-left-color: var(--red); opacity: 0.7; }

.slot-left { flex: 1; min-width: 0; }
.slot-time { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 6px; }
.slot-info { display: flex; flex-direction: column; gap: 4px; }
.fill-bar-wrap { height: 4px; background: var(--bg); border-radius: 4px; display: block; }
.fill-bar { height: 4px; border-radius: 4px; display: block; transition: width 0.3s; }
.slot-count { font-size: 11px; color: var(--muted); }

.slot-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.slot-badge { font-size: 10px; font-weight: 700; }
.slot-badge.free { color: var(--green); }
.slot-badge.enrolled { color: var(--blue); }
.slot-badge.full { color: var(--red); }

.slot-btn {
  padding: 8px 14px; border-radius: 8px; border: none;
  font-size: 12px; font-weight: 700; cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.slot-btn.free { background: var(--blue); color: #fff; }
.slot-btn.free:hover { background: var(--blue-dark); }
.slot-btn.enrolled { background: var(--red-light); color: var(--red); }
.slot-btn.full { background: var(--bg); color: var(--muted); cursor: not-allowed; }
.slot-btn:disabled { cursor: not-allowed; opacity: 0.6; }

.btn-spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}

.toast {
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
  padding: 12px 20px; border-radius: 10px;
  font-size: 13px; font-weight: 600; white-space: nowrap;
  z-index: 999; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.toast.success { background: var(--green); color: #fff; }
.toast.error { background: var(--red); color: #fff; }
.toast.info { background: var(--blue); color: #fff; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
