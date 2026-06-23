<template>
  <div class="page-content">
    <!-- Dummy slanje Obavijesti -->
    <section class="card">
      <h2 class="section-title">Slanje Obavijesti (Dummy feature)</h2>
      <label class="field-label">RAZLOG OTKAZIVANJA</label>
      <div class="chip-group">
        <button
          v-for="r in cancellationReasons" :key="r" class="chip"
          :class="{ active: selectedReasons.includes(r) }" @click="toggleReason(r)"
        >{{ r }}</button>
      </div>
      <label class="field-label mt">PORUKA ZA STUDENTE</label>
      <textarea v-model="message" class="textarea" rows="4"
        placeholder="Npr. Zbog hitnog održavanja instalacija, teretana je zatvorena do daljnjeg..."
      />
      <button class="btn-send" @click="sendNotification" :disabled="sending">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        {{ sending ? 'Slanje...' : 'Pošalji svima' }}
      </button>
    </section>

    

    <!-- Aktivni Kvarovi -->
    <AktivniKvarovi ref="aktivniKvaroviRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import AktivniKvarovi from '@/components/AktivniKvarovi.vue'

const capacity = ref(25)
const cancellationReasons = ['Održavanje', 'Blagdan', 'Izvanredno']
const selectedReasons = ref(['Izvanredno'])
const message = ref('')
const sending = ref(false)
const aktivniKvaroviRef = ref(null)

onMounted(async () => {
  const snap = await getDoc(doc(db, 'settings', 'gym'))
  if (snap.exists()) capacity.value = snap.data().capacity ?? 25
})

async function saveCapacity() {
  await setDoc(doc(db, 'settings', 'gym'), { capacity: capacity.value }, { merge: true })
}

function toggleReason(r) {
  const idx = selectedReasons.value.indexOf(r)
  if (idx === -1) selectedReasons.value.push(r)
  else selectedReasons.value.splice(idx, 1)
}

async function sendNotification() {
  if (!message.value.trim()) return
  sending.value = true
  // TODO: cloud function or FCM for real push
  // For now, save to Firestore notifications collection
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
  await addDoc(collection(db, 'notifications'), {
    razlozi: selectedReasons.value,
    poruka: message.value,
    sentAt: serverTimestamp()
  })
  await new Promise(r => setTimeout(r, 800))
  sending.value = false
  message.value = ''
  alert('Obavijest pohranjena!')
}
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.section-title { font-size: 16px; font-weight: 700; color: var(--text); }
.section-desc { font-size: 13px; color: var(--muted); margin-bottom: 14px; line-height: 1.5; }

.slider-wrap { display: flex; flex-direction: column; gap: 6px; }
.slider {
  -webkit-appearance: none; width: 100%; height: 4px;
  border-radius: 4px; background: #dde3f0; outline: none; cursor: pointer;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 20px; height: 20px;
  border-radius: 50%; background: var(--blue); cursor: pointer;
  box-shadow: 0 2px 6px rgba(59,108,247,0.4);
}
.slider-labels { display: flex; justify-content: space-between; font-size: 11px; color: #999; font-weight: 600; }

.field-label { display: block; font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 0.8px; margin-bottom: 8px; }
.field-label.mt { margin-top: 16px; }
.chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  border: 1.5px solid var(--border); border-radius: 20px;
  padding: 6px 14px; font-size: 13px; font-weight: 500;
  background: #fff; color: var(--muted); cursor: pointer; transition: all 0.15s;
}
.chip.active { background: var(--blue); border-color: var(--blue); color: #fff; }

.textarea {
  width: 100%; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 12px; font-size: 13px; color: var(--text); resize: none;
  font-family: inherit; line-height: 1.5; outline: none; transition: border-color 0.15s;
}
.textarea:focus { border-color: var(--blue); }
.textarea::placeholder { color: #bbb; }

.btn-send {
  margin-top: 14px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #1a1a2e; color: #fff; border: none; border-radius: 12px;
  padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.btn-send:hover:not(:disabled) { background: #2d2d4e; }
.btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
