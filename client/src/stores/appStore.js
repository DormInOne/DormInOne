import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const darkMode = ref(false)
  const sidebarCollapsed = ref(false)
  
  // 认证状态 - 从 localStorage 读取
  const storedRole = localStorage.getItem('dorminone_role')
  const storedUsername = localStorage.getItem('dorminone_username')
  
  const role = ref(storedRole || 'member')  // member, admin, supervisor
  const username = ref(storedUsername || '')
  const isLoggedIn = computed(() => role.value !== 'member')

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

  // 登录
  const login = (newRole, newUsername) => {
    role.value = newRole
    username.value = newUsername
    localStorage.setItem('dorminone_role', newRole)
    localStorage.setItem('dorminone_username', newUsername)
  }

  // 登出（回到member角色）
  const logout = () => {
    role.value = 'member'
    username.value = ''
    localStorage.removeItem('dorminone_role')
    localStorage.removeItem('dorminone_username')
  }

  // 判断是否有权限
  const hasPermission = (requiredRoles) => {
    return requiredRoles.includes(role.value)
  }

  // 是否是管理员
  const isAdmin = computed(() => role.value === 'admin')

  // 是否是宿管
  const isSupervisor = computed(() => role.value === 'supervisor')

  // 是否是普通成员
  const isMember = computed(() => role.value === 'member')

  return {
    darkMode,
    sidebarCollapsed,
    role,
    username,
    isLoggedIn,
    isAdmin,
    isSupervisor,
    isMember,
    toggleDarkMode,
    toggleSidebar,
    initDarkMode,
    login,
    logout,
    hasPermission
  }
})
