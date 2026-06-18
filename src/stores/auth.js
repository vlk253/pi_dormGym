// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)       // Firebase Auth user
  const profile = ref(null)    // Firestore user document
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isStudent = computed(() => profile.value?.role === 'student')

  // Listen to auth state changes — call once in App.vue
  function initAuth() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser
          await fetchProfile(firebaseUser.uid)
        } else {
          user.value = null
          profile.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  async function fetchProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      profile.value = { id: snap.id, ...snap.data() }
    }
  }

  function getRoleFromEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain === 'scpu.hr') return 'admin'
    if (domain === 'student.unipu.hr') return 'student'
    return 'student' // default za ostale domene
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    user.value = cred.user
    await fetchProfile(cred.user.uid)
    if (!profile.value) {
      await logout()
      const error = new Error('Profil nije pronađen.')
      error.code = 'auth/profile-not-found'
      throw error
    }
    return profile.value?.role
  }

  async function register(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    user.value = cred.user
    const role = getRoleFromEmail(email)
    const profileData = {
      name,
      email,
      role,
      createdAt: serverTimestamp(),
      avatarInitials: name.slice(0, 2).toUpperCase()
    }
    await setDoc(doc(db, 'users', cred.user.uid), profileData)
    profile.value = { id: cred.user.uid, ...profileData }
    return role
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    profile.value = null
  }

  async function refreshProfile() {
    if (user.value) await fetchProfile(user.value.uid)
  }

  return { user, profile, loading, isLoggedIn, isAdmin, isStudent, initAuth, login, register, logout, refreshProfile, getRoleFromEmail }
})
