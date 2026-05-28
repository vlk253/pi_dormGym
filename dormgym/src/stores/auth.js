import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('dormgym_token') || null)
  const role = ref(localStorage.getItem('dormgym_role') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isStudent = computed(() => role.value === 'student')

  // Actions
  async function login(email, password) {
    isLoading.value = true
    error.value = null

    try {
      /**
       * Backend prima email i lozinku, sam prepoznaje je li korisnik
       * admin ili student i vraća odgovarajući role u odgovoru.
       *
       * Primjer backend odgovora:
       * {
       *   token: "jwt_token_here",
       *   role: "admin" | "student",
       *   user: { id, name, email, ... }
       * }
       */
      const response = await axios.post('/api/auth/login', {
        email,
        password
      })

      const { token: newToken, role: userRole, user: userData } = response.data

      // Spremi u state
      token.value = newToken
      role.value = userRole
      user.value = userData

      // Spremi u localStorage za persistenciju
      localStorage.setItem('dormgym_token', newToken)
      localStorage.setItem('dormgym_role', userRole)

      // Postavi axios default header za buduće zahtjeve
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      return { success: true, role: userRole }

    } catch (err) {
      const message = err.response?.data?.message || 'Pogrešan email ili lozinka.'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    role.value = null
    error.value = null

    localStorage.removeItem('dormgym_token')
    localStorage.removeItem('dormgym_role')

    delete axios.defaults.headers.common['Authorization']
  }

  function clearError() {
    error.value = null
  }

  // Inicijaliziraj axios header ako postoji token
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    user, token, role, isLoading, error,
    isAuthenticated, isAdmin, isStudent,
    login, logout, clearError
  }
})
