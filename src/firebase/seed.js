// src/firebase/seed.js
// Pokreni jednom da postaviš inicijalne podatke u Firestore
// node src/firebase/seed.js  (ili pozovi iz konzole)

import { db } from './config.js'
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore'

const today = new Date()

// Generira slotove za danas + 7 dana
async function seedSlots() {
  for (let d = 0; d < 7; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)
    const dateStr = date.toISOString().split('T')[0] // "2025-06-03"

    const slots = []
    for (let hour = 7; hour < 21; hour++) {
      const start = hour.toString().padStart(2, '0') + ':00'
      const end = (hour + 1).toString().padStart(2, '0') + ':00'
      slots.push({
        id: `${dateStr}_${start.replace(':', '')}`,
        startTime: start,
        endTime: end,
        capacity: 20,
        enrolled: []
      })
    }

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
  console.log('Slots seeded!')
}

seedSlots()
