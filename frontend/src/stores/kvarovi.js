// src/stores/kvarovi.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, doc, updateDoc,
  serverTimestamp, query, orderBy, onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'

export const useKvaroviStore = defineStore('kvarovi', () => {
  const kvarovi = ref([])
  const loading = ref(false)
  let unsubscribe = null

  function listenToKvarovi() {
    loading.value = true
    const q = query(collection(db, 'kvarovi'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(q, (snap) => {
      kvarovi.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    })
  }

  function stopListening() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
  }

  async function prijaviKvar(data) {
    // include reporter metadata from auth store when available
    const auth = useAuthStore()
    const reporter = auth.profile ? { id: auth.profile.id, name: auth.profile.name, email: auth.profile.email } : null
    await addDoc(collection(db, 'kvarovi'), {
      ...data,
      reporter,
      popravljeno: false,
      createdAt: serverTimestamp()
    })
  }

  async function oznaciPopravljeno(id) {
    await updateDoc(doc(db, 'kvarovi', id), { popravljeno: true })
  }

  const aktivni = () => kvarovi.value.filter(k => !k.popravljeno)

  return { kvarovi, loading, listenToKvarovi, stopListening, prijaviKvar, oznaciPopravljeno, aktivni }
})
