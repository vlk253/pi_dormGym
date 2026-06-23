// src/stores/slots.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, query, where, getDocs, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export const useSlotsStore = defineStore('slots', () => {
  const slots = ref([])
  const loading = ref(false)
  let unsubscribe = null

  // Real-time listener for a specific date
  function listenToDate(dateStr) {
    if (unsubscribe) unsubscribe()
    loading.value = true
    const q = query(
      collection(db, 'slots'),
      where('date', '==', dateStr)
    )
    unsubscribe = onSnapshot(q, (snap) => {
      slots.value = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
      loading.value = false
    }, (err) => {
      console.error('listenToDate snapshot error', err)
      loading.value = false
    })
  }

  // Fallback one-time fetch in case realtime listener doesn't return data (e.g. indexing/timezone)
  async function fetchDateSlots(dateStr) {
    loading.value = true
    try {
      const q = query(
        collection(db, 'slots'),
        where('date', '==', dateStr)
      )
      const snap = await getDocs(q)
      slots.value = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    } catch (err) {
      console.error('fetchDateSlots error', err)
    } finally {
      loading.value = false
    }
  }

  function stopListening() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
  }

  // Enroll student in a slot
  async function enrollSlot(slotId, userId) {
    await updateDoc(doc(db, 'slots', slotId), {
      enrolled: arrayUnion(userId)
    })
  }

  // Unenroll student from a slot
  async function unenrollSlot(slotId, userId) {
    await updateDoc(doc(db, 'slots', slotId), {
      enrolled: arrayRemove(userId)
    })
  }

  // Fetch all reservations for a specific user
  async function fetchMyReservations(userId) {
    try {
      const q = query(collection(db, 'slots'), where('enrolled', 'array-contains', userId))
      const snap = await getDocs(q)
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    } catch (err) {
      console.error('fetchMyReservations error', err)
      return []
    }
  }

  return { slots, loading, listenToDate, fetchDateSlots, stopListening, enrollSlot, unenrollSlot, fetchMyReservations }
})
