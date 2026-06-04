# dormGym — Rezervacijski sustav

Vue 3 + Firebase + Pinia aplikacija za upravljanje teretanom.

## Postavljanje

### 1. Instaliraj pakete
```bash
npm install
```

### 2. Konfiguriraj Firebase
Otvori `src/firebase/config.js` i zamijeni vrijednosti s tvojim Firebase projektom:
```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
}
```

### 3. Firebase konzola — uključi servise
- **Authentication** → Email/Password (uključi)
- **Firestore** → Kreiraj bazu u production modu
- Kopiraj pravila iz `firestore.rules` → Firebase konzola → Firestore → Rules

### 4. Kreiraj admin korisnika
U Firebase konzoli → Authentication → Add user:
- Email: `admin@dormgym.hr`
- Password: (tvoja lozinka)

Zatim u Firestore → `users` kolekcija → novi dokument s ID = UID tog korisnika:
```json
{
  "name": "Marko Marković",
  "email": "admin@dormgym.hr",
  "role": "admin",
  "avatarInitials": "MM"
}
```

### 5. Inicijalni termini (slotovi)
Pokreni seed skriptu jednom da popuniš termine:
```bash
node src/firebase/seed.js
```
(Ili ručno dodaj dokumente u `slots` kolekciju po formatu u seed.js)

### 6. Pokretanje
```bash
npm run dev
```

---

## Struktura projekta

```
src/
├── firebase/
│   ├── config.js          ← Firebase konfiguracija
│   └── seed.js            ← Inicijalni podaci
├── stores/
│   ├── auth.js            ← Autentifikacija + korisnik
│   ├── slots.js           ← Termini (real-time)
│   └── kvarovi.js         ← Kvarovi (real-time)
├── router/
│   └── index.js           ← Rute + navigation guards
├── components/
│   └── AktivniKvarovi.vue ← Kvarovi komponenta
├── views/
│   ├── LoginView.vue      ← Prijava / Registracija
│   ├── student/
│   │   ├── StudentDashboard.vue   ← Shell + nav
│   │   ├── RezervacijeView.vue    ← Rezervacija termina
│   │   ├── MojeRezervacije.vue    ← Moje rezervacije
│   │   ├── UserGuide.vue          ← Upute
│   │   └── StudentProfil.vue      ← Profil studenta
│   └── admin/
│       ├── AdminDashboard.vue     ← Shell + nav
│       ├── NadzorPage.vue         ← Upravljanje
│       ├── StatistikaView.vue     ← Statistika
│       └── AdminProfil.vue        ← Admin profil
├── App.vue
├── main.js
└── style.css
```

## Firestore kolekcije

| Kolekcija | Opis |
|-----------|------|
| `users` | Profili korisnika (role: admin/student) |
| `slots` | Termini (datum, capacitet, enrolled[]) |
| `kvarovi` | Prijave kvarova |
| `settings` | Globalne postavke (kapacitet) |
| `notifications` | Poslane obavijesti |
