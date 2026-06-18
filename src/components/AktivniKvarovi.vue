<template>
  <section class="card kvarovi-card">
    <div class="kvarovi-header">
      <h2 class="section-title">Aktivni Kvarovi</h2>
      <span class="badge badge-red">{{ kvaroviStore.aktivni().length }} PRIJAVE</span>
    </div>

    <div v-if="kvaroviStore.loading" class="center-spinner"><div class="spinner"/></div>

    <div v-else-if="kvaroviStore.kvarovi.length === 0" class="empty-state">
      <p>Nema aktivnih kvarova 🎉</p>
    </div>

    <div v-else class="kvar-list">
      <div
        v-for="kvar in kvaroviStore.kvarovi" :key="kvar.id"
        class="kvar-item" :class="{ resolved: kvar.popravljeno }"
      >
        <div class="kvar-icon" :class="`tip-${kvar.tip}`">
          <span>{{ tipEmoji(kvar.tip) }}</span>
        </div>
        <div class="kvar-body">
          <div class="kvar-top">
            <span class="kvar-naziv">{{ kvar.naziv }}</span>
            <span class="kvar-vrijeme">{{ formatTime(kvar.createdAt) }}</span>
          </div>
          <p class="kvar-opis">{{ kvar.opis }}</p>
          <div class="kvar-actions">
            <button
              class="btn-oznaci" :class="{ done: kvar.popravljeno }"
              @click="oznaciPopravljeno(kvar.id)" :disabled="kvar.popravljeno"
            >
              {{ kvar.popravljeno ? '✓ POPRAVLJENO' : 'OZNACI KAO POPRAVLJENO' }}
            </button>
            <button class="btn-detalji" @click="selectedKvar = kvar">DETALJI</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add kvar form -->
    <div class="add-kvar-wrap">
      <button class="btn-add-kvar" @click="showForm = !showForm">
        {{ showForm ? '✕ Otkaži' : '+ Prijavi novi kvar' }}
      </button>
      <Transition name="faq">
        <div v-if="showForm" class="add-kvar-form">
          <input v-model="newKvar.naziv" placeholder="Naziv (npr. Traka #4)" class="mini-input"/>
          <select v-model="newKvar.tip" class="mini-input">
            <option value="mehanicar">🔧 Mehanički</option>
            <option value="namjestaj">🪑 Namještaj</option>
            <option value="klima">❄️ Klima</option>
            <option value="ostalo">⚙️ Ostalo</option>
          </select>
          <textarea v-model="newKvar.opis" placeholder="Opis kvara..." class="mini-input" rows="2"/>
          <button class="btn-primary" @click="prijaviKvar" :disabled="submitting">
            {{ submitting ? 'Sprema...' : 'Prijavi kvar' }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Detail modal -->
    <div v-if="selectedKvar" class="modal-overlay" @click.self="selectedKvar = null">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ selectedKvar.naziv }}</h3>
          <button class="modal-close" @click="selectedKvar = null">✕</button>
        </div>
        <p class="modal-opis">{{ selectedKvar.opis }}</p>
        <div class="modal-meta">
          <div class="meta-row"><span>Tip:</span><strong>{{ selectedKvar.tip }}</strong></div>
          <div class="meta-row"><span>Prijavljeno:</span><strong>{{ formatTime(selectedKvar.createdAt) }}</strong></div>
          <div class="meta-row"><span>Status:</span><strong>{{ selectedKvar.popravljeno ? '✓ Popravljeno' : '⚠️ Aktivno' }}</strong></div>
        </div>
        <button class="btn-primary" @click="selectedKvar = null">Zatvori</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useKvaroviStore } from '@/stores/kvarovi'

const kvaroviStore = useKvaroviStore()
const selectedKvar = ref(null)
const showForm = ref(false)
const submitting = ref(false)
const newKvar = ref({ naziv: '', opis: '', tip: 'mehanicar' })

onMounted(() => kvaroviStore.listenToKvarovi())
onUnmounted(() => kvaroviStore.stopListening())

async function oznaciPopravljeno(id) {
  await kvaroviStore.oznaciPopravljeno(id)
}

async function prijaviKvar() {
  if (!newKvar.value.naziv.trim()) return
  submitting.value = true
  await kvaroviStore.prijaviKvar({ ...newKvar.value })
  newKvar.value = { naziv: '', opis: '', tip: 'mehanicar' }
  showForm.value = false
  submitting.value = false
}

function tipEmoji(tip) {
  return { mehanicar: '🔧', namjestaj: '🪑', klima: '❄️', ostalo: '⚙️' }[tip] || '⚙️'
}

function formatTime(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = (Date.now() - date) / 1000
  if (diff < 3600) return `PRIJE ${Math.round(diff / 60)} MIN`
  if (diff < 86400) return `PRIJE ${Math.round(diff / 3600)} H`
  return `PRIJE ${Math.round(diff / 86400)} DAN/A`
}

// Exposed for parent ref
defineExpose({ kvarovi: kvaroviStore.kvarovi, refreshKvarovi: kvaroviStore.listenToKvarovi })
</script>

<style scoped>
.kvarovi-card { }
.kvarovi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 700; }

.center-spinner { display: flex; justify-content: center; padding: 24px; }
.empty-state { text-align: center; color: var(--muted); padding: 20px; font-size: 14px; }

.kvar-list { display: flex; flex-direction: column; }
.kvar-item {
  display: flex; gap: 12px; padding: 14px 0;
  border-bottom: 1px solid var(--border); transition: opacity 0.2s;
}
.kvar-item:last-child { border-bottom: none; }
.kvar-item.resolved { opacity: 0.4; }

.kvar-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.tip-mehanicar { background: var(--red-light); }
.tip-namjestaj  { background: #fff7ed; }
.tip-klima      { background: #ebf8ff; }
.tip-ostalo     { background: var(--bg); }

.kvar-body { flex: 1; min-width: 0; }
.kvar-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
.kvar-naziv { font-weight: 700; font-size: 14px; }
.kvar-vrijeme { font-size: 11px; color: var(--muted); }
.kvar-opis { font-size: 12px; color: var(--muted); line-height: 1.5; margin-bottom: 10px; }
.kvar-actions { display: flex; gap: 14px; }
.btn-oznaci {
  font-size: 11px; font-weight: 700; color: var(--blue);
  background: none; border: none; cursor: pointer; padding: 0;
}
.btn-oznaci.done { color: var(--green); cursor: default; }
.btn-detalji { font-size: 11px; font-weight: 700; color: var(--muted); background: none; border: none; cursor: pointer; }

/* Add kvar */
.add-kvar-wrap { margin-top: 14px; }
.btn-add-kvar {
  font-size: 13px; font-weight: 700; color: var(--blue);
  background: none; border: none; cursor: pointer; padding: 4px 0;
}
.add-kvar-form { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.mini-input {
  width: 100%; border: 1.5px solid var(--border); border-radius: 8px;
  padding: 10px 12px; font-size: 13px; font-family: inherit; outline: none;
  background: #fff; resize: none;
}
.mini-input:focus { border-color: var(--blue); }
.faq-enter-active, .faq-leave-active { transition: all 0.2s; overflow: hidden; }
.faq-enter-from, .faq-leave-to { max-height: 0; opacity: 0; }
.faq-enter-to, .faq-leave-from { max-height: 400px; opacity: 1; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: flex-end; justify-content: center; z-index: 100;
}
.modal {
  background: #fff; border-radius: 20px 20px 0 0;
  padding: 24px; width: 100%; max-width: 430px;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.modal-header h3 { font-size: 17px; font-weight: 700; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--muted); }
.modal-opis { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
.modal-meta { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.meta-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); }
.meta-row strong { color: var(--text); }
</style>
