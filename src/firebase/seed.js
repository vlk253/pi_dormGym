// Pokretanje jednom da se postave inicijalne podatke u Firestore
// node src/firebase/seed.js  (ili pozovi iz konzole)
import { db, auth } from './config.js'
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Prijavi se kao admin prije seeda
await signInWithEmailAndPassword(auth, 'teo@scpu.hr', '12345678')

// ... ostatak koda
console.log("SEED START")
function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
console.log("slots done")
console.log("users done")
const today = new Date()

// Generira slotove za danas + 7 dana
async function seedSlots() {
  for (let d = 0; d < 7; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)
    const dateStr = formatLocalDate(date) // "2025-06-03"

    const slots = [
      { id: `${dateStr}_0700`, startTime: '07:00', endTime: '08:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_0800`, startTime: '08:00', endTime: '09:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_0900`, startTime: '09:00', endTime: '10:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1000`, startTime: '10:00', endTime: '11:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1100`, startTime: '11:00', endTime: '12:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1200`, startTime: '12:00', endTime: '13:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1300`, startTime: '13:00', endTime: '14:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1400`, startTime: '14:00', endTime: '15:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1500`, startTime: '15:00', endTime: '16:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1600`, startTime: '16:00', endTime: '17:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1700`, startTime: '17:00', endTime: '18:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1800`, startTime: '18:00', endTime: '19:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_1900`, startTime: '19:00', endTime: '20:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_2000`, startTime: '20:00', endTime: '21:00', capacity: 5, enrolled: [] },
      { id: `${dateStr}_2100`, startTime: '21:00', endTime: '22:00', capacity: 5, enrolled: [] }
    ]

    for (const slot of slots) {
      await setDoc(doc(db, 'slots', slot.id), {
        date: dateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        enrolled: slot.enrolled,
        createdAt: Timestamp.now()
      })
    }
  }
  console.log('✅ Slots seeded!')
}
console.log("slots done")
console.log("users done")
// Kreiraj testne korisnike
async function seedUsers() {
  const testUsers = [
    {
      id: 'test_admin_001',
      name: 'Admin Test',
      email: 'admin@scpu.hr',
      role: 'admin',
      avatarInitials: 'AT',
      createdAt: Timestamp.now()
    },
    {
      id: 'test_student_001',
      name: 'Marko Marković',
      email: 'marko@student.unipu.hr',
      role: 'student',
      avatarInitials: 'MM',
      createdAt: Timestamp.now()
    },
    {
      id: 'test_student_002',
      name: 'Ana Anić',
      email: 'ana@student.unipu.hr',
      role: 'student',
      avatarInitials: 'AA',
      createdAt: Timestamp.now()
    },
    {
      id: 'test_student_003',
      name: 'Petar Petrović',
      email: 'petar@student.unipu.hr',
      role: 'student',
      avatarInitials: 'PP',
      createdAt: Timestamp.now()
    }
  ]

  for (const user of testUsers) {
    await setDoc(doc(db, 'users', user.id), user)
  }
  console.log('✅ Test users seeded!')
}
console.log("slots done")
console.log("users done")
// Prijavi testne studente na neke slotove
async function enrollTestStudents() {
  const today = new Date().toISOString().split('T')[0]
  const slots = [
    `${today}_0900`,
    `${today}_1000`,
    `${today}_1100`,
  ]
  
  // Marko se prijavljuje na 09:00, 10:00
  await setDoc(doc(db, 'slots', slots[0]), {
    enrolled: ['test_student_001']
  }, { merge: true })
  
  await setDoc(doc(db, 'slots', slots[1]), {
    enrolled: ['test_student_001', 'test_student_002']
  }, { merge: true })
  
  // Ana se prijavljuje na 11:00
  await setDoc(doc(db, 'slots', slots[2]), {
    enrolled: ['test_student_002', 'test_student_003']
  }, { merge: true })
  
  console.log('✅ Test students enrolled!')
}
console.log("slots done")
console.log("users done")
async function runSeed() {
  try {
    await seedSlots()
    await seedUsers()
    await enrollTestStudents()
    console.log('\n✅ Seed completed! You can now test the app.')
    console.log('\n📋 Test credentials:')
    console.log('  Admin:   admin@scpu.hr (any password)')
    console.log('  Student: marko@student.unipu.hr (any password)')
    console.log('  Student: ana@student.unipu.hr (any password)')
  } catch (err) {
    console.error('❌ Seed error:', err.message)
  }
}

runSeed()
