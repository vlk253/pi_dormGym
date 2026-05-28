<template>
  <div style="padding:40px; font-family:'Outfit',sans-serif; text-align:center;">
    <h1 style="color:#1a6fd4;">Student Portal 💪</h1>
    <p style="color:#64748b; margin-top:12px;">Prijavljeni ste kao: <strong>{{ auth.user?.email }}</strong></p>
    <button @click="handleLogout" style="margin-top:24px; padding:10px 28px; background:#1a6fd4; color:#fff; border:none; border-radius:50px; font-size:15px; cursor:pointer;">
      Odjava
    </button>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'
const auth = useAuthStore()
const router = useRouter()
function handleLogout() { auth.logout(); router.push('/') }
</script>
