<template>
  <div class="page-content">
    <div class="guide-hero card">
      <div class="guide-icon">📋</div>
      <h2>Upute za korištenje</h2>
      <p>Sve što trebaš znati za rezervaciju termina.</p>
    </div>

    <div v-for="(section, i) in sections" :key="i" class="card faq-card">
      <button class="faq-q" @click="open = open === i ? null : i">
        <span>{{ section.q }}</span>
        <svg :style="{ transform: open === i ? 'rotate(180deg)' : '' }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <Transition name="faq">
        <div v-if="open === i" class="faq-a">{{ section.a }}</div>
      </Transition>
    </div>

    <div class="card contact-card">
      <div class="contact-title">Kontaktiraj upravu</div>
      <p class="contact-sub">Imaš pitanje ili problem? Javi se recepciji!</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(0)
const sections = [
  {
    q: 'Kako rezervirati termin?',
    a: 'Idite na tab "Rezervacije", odaberite datum i pritisnite "Prijavi se" na željeni termin. Rezervacija se potvrđuje odmah.'
  },
  {
    q: 'Kako se odjaviti s termina?',
    a: 'U sekciji "Moje rezervacije" ili direktno na terminu pritisni "Odjavi se". Misli na druge - odjavi se na vrijeme.'
  },
  {
    q: 'Kako pristupiti prostoru teretane?',
    a: 'Vaša kartica za ulaz u dom povezana je s korisničkim računom i rezervacijom. Prilikom ulaska u prostor, prisloni karticu na čitač i pričekaj zeleno svjetlo. Dopušten ulaz je samo u vrijeme rezervacije s vremenskim intervalom od 15 minuta prije i poslije iste. Ako kartica ne radi, javite se na recepciju.'
  },
  {
    q: 'Koliko mjesta ima po terminu?',
    a: 'Svaki termin ima ograničen broj mjesta (globalni limit). Kada se popuni, prikazuje se "Popunjeno" i prijava nije moguća.'
  },
  {
    q: 'Što ako propustim termin?',
    a: 'Bez sankcije :) Svejedno, molimo Vas da se odjavite ako ne možete doći, kako bi se oslobodilo mjesto za drugog korisnika.'
  },
  {
    q: 'Kada se otvara rezervacija za sljedeći tjedan?',
    a: 'Termini su dostupni 7 dana unaprijed. Svaki dan u ponoć dodaje se novi dan u kalendar.'
  }
]
</script>

<style scoped>
.guide-hero {
  text-align: center; padding: 28px 20px;
  background: linear-gradient(135deg, var(--blue) 0%, #5b8af7 100%);
  color: #fff;
}
.guide-icon { font-size: 36px; margin-bottom: 10px; }
.guide-hero h2 { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
.guide-hero p { font-size: 13px; opacity: 0.85; }

.faq-card { padding: 0; overflow: hidden; }
.faq-q {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px; background: none; border: none; cursor: pointer;
  font-size: 14px; font-weight: 600; color: var(--text); text-align: left; gap: 8px;
}
.faq-q svg { flex-shrink: 0; transition: transform 0.2s; }
.faq-a {
  padding: 0 16px 16px;
  font-size: 13px; color: var(--muted); line-height: 1.6;
}

.faq-enter-active, .faq-leave-active { transition: all 0.2s; overflow: hidden; }
.faq-enter-from, .faq-leave-to { max-height: 0; opacity: 0; }
.faq-enter-to, .faq-leave-from { max-height: 200px; opacity: 1; }

.contact-card { text-align: center; }
.contact-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.contact-sub { font-size: 13px; color: var(--muted); }
</style>
