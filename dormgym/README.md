# DormGym — Vue 3 + Pinia Frontend

## Struktura projekta

```
dormgym/
├── src/
│   ├── stores/
│   │   └── auth.js          # Pinia store — login, logout, role state
│   ├── views/
│   │   ├── LoginView.vue    # Stranica za prijavu
│   │   ├── AdminDashboard.vue
│   │   └── StudentDashboard.vue
│   ├── router/
│   │   └── index.js         # Vue Router s role-based guards
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── server.example.js        # Primjer Node.js/Express backenda
├── index.html
├── vite.config.js
└── package.json
```

## Pokretanje

```bash
# Instaliraj ovisnosti
npm install

# Pokreni frontend (dev)
npm run dev
```

## Kako radi autentikacija

Frontend šalje **samo email i lozinku** na `/api/auth/login`.  
Backend sam određuje rolu korisnika iz baze podataka i vraća:

```json
{
  "token": "eyJhbGci...",
  "role": "admin",          ← frontend pročita ovo
  "user": { "id": 1, "email": "...", "name": "..." }
}
```

Na temelju `role` u odgovoru, Vue Router preusmjerava:
- `admin` → `/admin`
- `student` → `/student`

## Backend integracija

Pogledaj `server.example.js` za referentni Express backend.  
Prilagodi `USERS` array ili zamijeni s pravom bazom podataka.

## Environment varijable

Stvori `.env` datoteku:
```
VITE_API_URL=http://localhost:3000
```
