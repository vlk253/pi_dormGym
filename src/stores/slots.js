// src/stores/slots.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, query, where, getDocs, doc,
  updateDoc, arrayUnion, arrayRemove, onSnapshot, orderBy
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'

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
      where('date', '==', dateStr),
      orderBy('startTime')
    )
    unsubscribe = onSnapshot(q, (snap) => {
      slots.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    })
  }

  function stopListening() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
  }

  async function enrollSlot(slotId) {
    const auth = useAuthStore()
    const uid = auth.user?.uid
    if (!uid) return
    await updateDoc(doc(db, 'slots', slotId), {
      enrolled: arrayUnion(uid)
    })
  }

  async function unenrollSlot(slotId) {
    const auth = useAuthStore()
    const uid = auth.user?.uid
    if (!uid) return
    await updateDoc(doc(db, 'slots', slotId), {
      enrolled: arrayRemove(uid)
    })
  }

  // Fetch all slots where user is enrolled (for Moje Rezervacije)
  async function fetchMyReservations(uid) {
    const q = query(collection(db, 'slots'), where('enrolled', 'array-contains', uid))
    const snap = await getDocs(q)
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  }

  return { slots, loading, listenToDate, stopListening, enrollSlot, unenrollSlot, fetchMyReservations }
})
