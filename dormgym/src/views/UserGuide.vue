<template>
  <div class="guide-page">
    <!-- Header -->
    <header class="guide-header">
      <div class="logo">
        <span class="logo-icon">🏋️</span>
        <span class="logo-text">DormGym</span>
      </div>
      <div class="avatar">
        <img v-if="user?.avatar" :src="user.avatar" alt="avatar" />
        <div v-else class="avatar-placeholder">{{ userInitials }}</div>
      </div>
    </header>

    <!-- Hero -->
    <section class="guide-hero">
      <h1>Upute za korisnike</h1>
      <p class="subtitle">Sve što trebate znati za brz početak vašeg treninga.</p>
    </section>

    <!-- Steps -->
    <div class="guide-cards">

      <div class="guide-card">
        <div class="card-tag">
          <span class="tag-icon">✅</span> PRVI KORAK
        </div>
        <h2>Kako započeti?</h2>
        <p>Ulaz u teretanu omogućen je isključivo putem vaše fizičke kartice sa senzorom. Prislonite karticu na čitač kod ulaznih vrata za automatsku verifikaciju termina.</p>
      </div>

      <div class="guide-card">
        <div class="card-tag">
          <span class="tag-icon">🕐</span> TERMINI
        </div>
        <h2>Rezervacija termina</h2>
        <p>Trajanje termina je fleksibilno, a unosi ga student svaki put prilikom prijave.</p>
      </div>

      <div class="guide-card rules-card">
        <div class="rules-header">
          <span class="rules-icon">🏃</span>
          <h2>Pravila teretane</h2>
        </div>
        <ul class="rules-list">
          <li>
            <span class="rule-icon">👟</span>
            <div>
              <strong>Čista obuća</strong>
              <p>Obavezno presvlačenje u čistu sportsku obuću prije ulaska u prostor vježbanja.</p>
            </div>
          </li>
          <li>
            <span class="rule-icon">🧴</span>
            <div>
              <strong>Korištenje ručnika</strong>
              <p>Uvijek koristite vlastiti ručnik na spravama radi higijene i udobnosti ostalih korisnika.</p>
            </div>
          </li>
          <li>
            <span class="rule-icon">⚠️</span>
            <div>
              <strong>Prijavite kvarove</strong>
              <p>Uočite li oštećenu opremu, odmah prijavite kvar putem aplikacije ili domskom osoblju.</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- FAQ -->
      <div class="guide-card faq-card">
        <h2>Česta pitanja (FAQ)</h2>
        <div
          v-for="(item, i) in faq"
          :key="i"
          class="faq-item"
          :class="{ open: openFaq === i }"
          @click="toggleFaq(i)"
        >
          <div class="faq-question">
            <span>{{ item.q }}</span>
            <span class="faq-arrow">{{ openFaq === i ? '∧' : '∨' }}</span>
          </div>
          <div class="faq-answer" v-if="openFaq === i">
            <p>{{ item.a }}</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Back button -->
    <div class="guide-footer">
      <button class="back-btn" @click="goBack">
        ↩ Povratak na prijavu
      </button>
      <p class="support-text">ⓘ Trebate dodatnu pomoć? Kontaktirajte domsku recepciju.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Props - prosljeđuje se korisnik iz router statea ili store-a
const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const router = useRouter()

const userInitials = computed(() => {
  if (!props.user?.name) return 'K'
  return props.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const openFaq = ref(null)

const faq = [
  {
    q: 'Što ako izgubim karticu?',
    a: 'U slučaju gubitka kartice odmah kontaktirajte domsku upravu ili pošaljite zahtjev putem aplikacije. Kartica će biti deaktivirana, a nova izdana uz administrativnu naknadu.'
  },
  {
    q: 'Mogu li otkazati termin?',
    a: 'Da, termin možete otkazati u bilo kojem trenutku, ali budite obazrivi kako bi prostor teretane bio dostupan drugima.'
  },
  {
    q: 'Koliko dugo može trajati termin?',
    a: 'Trajanje termina unosite sami pri rezervaciji. Preporučujemo maksimalno 90 minuta kako bi svi studenti imali jednaku mogućnost korištenja.'
  },
  {
    q: 'Je li teretana dostupna vikendom?',
    a: 'Da, teretana je dostupna 7 dana u tjednu. Radno vrijeme vikendom može biti skraćeno — provjerite u aplikaciji.'
  }
]

const toggleFaq = (i) => {
  openFaq.value = openFaq.value === i ? null : i
}

const goBack = () => {
  router.push({ name: 'Login' }) // prilagodi name ruti u tvom routeru
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

.guide-page {
  min-height: 100vh;
  background: #f4f6fb;
  font-family: 'DM Sans', sans-serif;
  color: #1a1f36;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 0 40px 0;
}

/* Header */
.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  background: #fff;
  border-bottom: 1px solid #e8ecf4;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a73e8;
}
.logo-icon { font-size: 1.3rem; }

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: #1a73e8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder {
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  font-family: 'Sora', sans-serif;
}

/* Hero */
.guide-hero {
  padding: 28px 24px 16px;
  background: #fff;
}
.guide-hero h1 {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #1a1f36;
}
.subtitle {
  font-size: 0.95rem;
  color: #5f6987;
  margin: 0;
}

/* Cards */
.guide-cards {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.guide-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(26,31,54,0.07);
}

.card-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #1a73e8;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.tag-icon { font-size: 0.9rem; }

.guide-card h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.guide-card p {
  font-size: 0.9rem;
  color: #4a5170;
  line-height: 1.55;
  margin: 0;
}

/* Rules */
.rules-card .rules-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.rules-icon { font-size: 1.3rem; }
.rules-header h2 { margin: 0; font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; }

.rules-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rules-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.rule-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.rules-list strong {
  display: block;
  font-size: 0.92rem;
  font-weight: 600;
  color: #1a1f36;
  margin-bottom: 2px;
}
.rules-list p {
  font-size: 0.85rem;
  color: #5f6987;
  margin: 0;
  line-height: 1.45;
}

/* FAQ */
.faq-card h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 14px;
}
.faq-item {
  border-top: 1px solid #eef0f6;
  padding: 13px 0;
  cursor: pointer;
  transition: background 0.15s;
}
.faq-item:first-of-type { border-top: none; padding-top: 0; }
.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.93rem;
  font-weight: 500;
  color: #1a1f36;
}
.faq-arrow {
  color: #9099b5;
  font-size: 0.85rem;
  margin-left: 8px;
}
.faq-answer p {
  font-size: 0.88rem;
  color: #4a5170;
  line-height: 1.55;
  margin: 10px 0 0;
}

/* Footer */
.guide-footer {
  padding: 24px 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.back-btn {
  width: 100%;
  padding: 15px;
  background: #1a73e8;
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.back-btn:hover { background: #1558c0; }
.back-btn:active { transform: scale(0.98); }

.support-text {
  font-size: 0.8rem;
  color: #9099b5;
  margin: 0;
}
</style>
