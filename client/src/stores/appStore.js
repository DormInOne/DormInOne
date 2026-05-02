import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const darkMode = ref(false)
  const sidebarCollapsed = ref(false)

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.value)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const initDarkMode = () => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      darkMode.value = saved === 'true'
      if (darkMode.value) {
        document.documentElement.classList.add('dark')
      }
    } else {
      darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (darkMode.value) {
        document.documentElement.classList.add('dark')
      }
    }
  }

  return {
    darkMode,
    sidebarCollapsed,
    toggleDarkMode,
    toggleSidebar,
    initDarkMode
  }
})
