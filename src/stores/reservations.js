// src/stores/reservations.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, query, where, getDocs, addDoc, deleteDoc, doc,
  onSnapshot, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'

export const useReservationsStore = defineStore('reservations', () => {
  const reservations = ref([])
  const loading = ref(false)
  let unsubscribe = null

  function listenToMyReservations() {
    const auth = useAuthStore()
    const uid = auth.user?.uid
    if (!uid) return

    loading.value = true
    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    unsubscribe = onSnapshot(q, (snap) => {
      reservations.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    }, (err) => {
      console.error('listenToMyReservations snapshot error', err)
      loading.value = false
    })
  }

  async function fetchSlotReservations(slotId) {
    try {
      const q = query(
        collection(db, 'reservations'),
        where('slotId', '==', slotId)
      )
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.error('fetchSlotReservations error', err)
      return []
    }
  }

  async function createReservation(slotId, slotData) {
    const auth = useAuthStore()
    const uid = auth.user?.uid
    if (!uid) throw new Error('User not authenticated')

    const existing = await getDocs(
      query(
        collection(db, 'reservations'),
        where('userId', '==', uid),
        where('slotId', '==', slotId)
      )
    )
    if (!existing.empty) {
      throw new Error('Already reserved for this slot')
    }

    try {
      await addDoc(collection(db, 'reservations'), {
        userId: uid,
        slotId: slotId,
        date: slotData.date,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        createdAt: serverTimestamp()
      })
    } catch (err) {
      console.error('createReservation error', err)
      throw err
    }
  }

  async function cancelReservation(reservationId) {
    try {
      await deleteDoc(doc(db, 'reservations', reservationId))
    } catch (err) {
      console.error('cancelReservation error', err)
      throw err
    }
  }

  function stopListening() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
  }

  return {
    reservations,
    loading,
    listenToMyReservations,
    fetchSlotReservations,
    createReservation,
    cancelReservation,
    stopListening
  }
})
