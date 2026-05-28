/**
 * DormGym Backend - Primjer Node.js/Express servera
 * ===================================================
 * Backend automatski prepoznaje rolu korisnika (admin/student)
 * i vraća je frontendu. Frontend NE zna unaprijed koju rogu
 * korisnik ima — saznaje tek iz odgovora servera.
 *
 * Instaliraj: npm install express jsonwebtoken bcryptjs cors
 */

const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' }))

const JWT_SECRET = process.env.JWT_SECRET || 'dormgym-super-secret-key'

// -------------------------------------------------------
// Primjer korisnika (zamijeni sa bazom podataka)
// -------------------------------------------------------
const USERS = [
  {
    id: 1,
    email: 'admin@sczg.hr',
    // bcrypt hash od 'admin123'
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'admin',
    name: 'Marko Horvat',
  },
  {
    id: 2,
    email: 'ana.kovic@sczg.hr',
    // bcrypt hash od 'student123'
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'student',
    name: 'Ana Ković',
  },
]

// -------------------------------------------------------
// POST /api/auth/login
// Backend prima email + lozinku, traži korisnika u bazi,
// provjerava lozinku i vraća JWT + ROLU.
// Frontend NE šalje željenu rolu — backend je određuje.
// -------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email i lozinka su obavezni.' })
  }

  // Pronađi korisnika po emailu (case-insensitive)
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase())

  if (!user) {
    // Koristimo istu poruku da ne otkrijemo postoji li email
    return res.status(401).json({ message: 'Pogrešan email ili lozinka.' })
  }

  // Provjeri lozinku
  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Pogrešan email ili lozinka.' })
  }

  // Generiraj JWT koji sadrži i rolu
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,   // <-- rola je unutar tokena
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )

  // Vrati token, rolu i osnovne podatke o korisniku
  return res.json({
    token,
    role: user.role,       // <-- frontend koristi ovo za redirect
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  })
})

// -------------------------------------------------------
// Middleware za zaštitu ruta (primjer)
// -------------------------------------------------------
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Niste autorizirani.' })
  }

  try {
    const token = authHeader.split(' ')[1]
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Token je istekao ili je neispravan.' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Nemate pristup ovoj ruti.' })
    }
    next()
  }
}

// -------------------------------------------------------
// Zaštićene rute
// -------------------------------------------------------
app.get('/api/admin/dashboard', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin podaci', user: req.user })
})

app.get('/api/student/profile', requireAuth, requireRole('student'), (req, res) => {
  res.json({ message: 'Student profil', user: req.user })
})

// Status teretane (javna ruta)
app.get('/api/gym/status', (req, res) => {
  const hour = new Date().getHours()
  res.json({
    isOpen: hour >= 6 && hour < 23,
    message: hour >= 6 && hour < 23 ? 'Teretana je otvorena' : 'Teretana je zatvorena',
  })
})

app.listen(3000, () => {
  console.log('DormGym API radi na http://localhost:3000')
})
